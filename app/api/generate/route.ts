import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import Replicate from 'replicate'
import fetch from 'node-fetch'
import { GoogleGenAI, createUserContent, createPartFromUri } from '@google/genai'
import { ClothingItem, ModelReference } from '../../../lib/image-utils'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const REPLICATE_API_KEY = process.env.REPLICATE_API_TOKEN || ''

async function createGridLayoutFromBuffers(imageBuffers: Buffer[]): Promise<Buffer> {
  const cellWidth = 512
  const cellHeight = 512
  const rows = 2, cols = 2

  const preparedBuffers = await Promise.all(
    imageBuffers.map(async (buf) => {
      const img = sharp(buf)
      const metadata = await img.metadata()
      const scale = Math.min(cellWidth / (metadata.width || 1), cellHeight / (metadata.height || 1))
      const newWidth = Math.round((metadata.width || 1) * scale)
      const newHeight = Math.round((metadata.height || 1) * scale)
      return await img
        .resize({ width: newWidth, height: newHeight, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .toBuffer()
    })
  )

  const compositeImages = []
  let index = 0
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (index >= preparedBuffers.length) break
      compositeImages.push({ input: preparedBuffers[index], top: y * cellHeight, left: x * cellWidth })
      index++
    }
  }

  const finalStitched = await sharp({
    create: {
      width: cols * cellWidth,
      height: rows * cellHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite(compositeImages)
    .jpeg({ quality: 95 })
    .toBuffer()

  return finalStitched
}

async function analyzeWithGeminiBuffer(imageBuffer: Buffer, backgroundStyle: 'studio' | 'lifestyle' = 'studio', modelReference?: ModelReference) {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  // Upload the buffer as a Blob
  const file = await ai.files.upload({ file: new Blob([imageBuffer], { type: 'image/jpeg' }) })
  // Add background style instruction
  const bgInstruction = backgroundStyle === 'studio'
    ? 'The user wants the background to be a professional studio style (clean, minimal, well-lit, neutral or white background).'
    : 'The user wants the background to be a lifestyle/real-life setting (natural, realistic, contextually appropriate for the outfit, e.g. street, home, cafe, park, etc).';
  // Add model reference instruction
  let modelInstruction = ''
  if (modelReference) {
    if (modelReference.type === 'default') {
      modelInstruction = `The model should be a ${modelReference.gender} model with a professional appearance.`
    } else {
      modelInstruction = 'The model should match the provided reference image in appearance and pose.'
    }
  }
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      createUserContent([
        `${bgInstruction}\n${modelInstruction}\n\nYou are a professional fashion analyst AI.\n\nPlease analyze the attached stitched outfit layout image and identify each clothing item or accessory shown in the grid (top-left to bottom-right order). For each item, describe:\n\n- Type of item (e.g., sunglasses, shirt, jeans, sneakers)\n- Primary use or region of the body (e.g., torso, legs, face, feet)\n- Color and pattern\n- Material/fabric type (e.g., cotton, denim, synthetic, plastic)\n- Visible textures or design features (e.g., glossy plastic frame, printed logo, button-up front, elastic sole)\n- Fit and cut (e.g., slim fit, relaxed, flared)\n- Style association (e.g., casual, sporty, summer wear, streetwear, formal)\n- Gender relevance (e.g., unisex, male, female)\n\nThen, generate a structured JSON object describing:\n1. A model identity and appearance matching the outfit\n2. A high-quality prompt to generate the outfit on a realistic try-on model\n3. A breakdown of the outfit by items\n4. A suitable background style and setting\n5. Output requirements for realism\n\nFormat:\n\n{\n  "prompt": "AI generation description",\n  "model": {\n    "identity": "...",\n    "pose": "...",\n    "expression": "...",\n    "lighting": "..."\n  },\n  "garment": {\n    "items": [\n      {\n        "type": "...",\n        "location": "...",\n        "color": "...",\n        "material": "...",\n        "texture": "...",\n        "fit": "...",\n        "style": "...",\n        "gender": "..."\n      },\n      ...\n    ]\n  },\n  "background": {\n    "type": "...",\n    "style": "...",\n    "integration": "..."\n  },\n  "output_requirements": {\n    "preserve_model_lighting": true,\n    "blend_model_into_background": true,\n    "no_pose_change": true,\n    "no_outfit_change": true,\n    "realistic_shadows": "..."\n  }\n}\n\nFocus on intricate visual details, textures, and fashion categorization. Do not skip any accessory.`,
        createPartFromUri(file.uri, file.mimeType),
      ]),
    ],
  })
  const jsonStart = response.text.indexOf('{')
  const jsonEnd = response.text.lastIndexOf('}')
  const jsonText = response.text.slice(jsonStart, jsonEnd + 1)
  const parsed = JSON.parse(jsonText)
  return parsed
}

function determineGenderPrompt(modelIdentity: string) {
  const isFemale = modelIdentity.toLowerCase().includes("female")
  const isMale = modelIdentity.toLowerCase().includes("male")
  if (isFemale) {
    return "A professional female fashion model wearing the exact outfit shown in the layout image. The model is realistic, styled for a studio editorial photo, with natural lighting, proportional body, and confident posture."
  } else if (isMale) {
    return "A professional male fashion model wearing the exact outfit shown in the layout image. Keep the style, color, and texture consistent. Full body shot with confident posture, studio lighting, and fashion magazine realism."
  }
  return "A single professional fashion model dressed in the outfit from the layout image, realistic body and posture, clean studio setup."
}

async function generateWithReplicate(basePrompt: string, negativePrompt: string, imageBuffer: Buffer) {
  const replicate = new Replicate({ auth: REPLICATE_API_KEY });
  const base64 = imageBuffer.toString('base64');
  const dataURI = `data:image/jpeg;base64,${base64}`;
  const input = {
    prompt: basePrompt,
    negative_prompt: negativePrompt,
    input_image: dataURI,
    output_format: "jpg",
    safety_tolerance: 6
  };
  const output = await replicate.run("black-forest-labs/flux-kontext-pro", { input });
  console.log('Replicate outputUrl:', output);
  if (!output) throw new Error("No output URL returned from Replicate.");

  // If output is a ReadableStream, convert to base64 data URL
  if (typeof ReadableStream !== 'undefined' && output instanceof ReadableStream) {
    const reader = output.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const imageData = new Uint8Array(chunks.flatMap(chunk => Array.from(chunk)));
    const base64Image = Buffer.from(imageData).toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;
  }

  if (Array.isArray(output)) {
    const first = (output as any[])[0];
    if (typeof first === 'string' && first.startsWith('http')) return first;
  }
  if (typeof output === 'string' && (output as string).startsWith('http')) return output;
  if (
    typeof output === 'object' &&
    output !== null &&
    'output' in output &&
    Array.isArray((output as any).output)
  ) {
    if (typeof (output as any).output[0] === 'string' && (output as any).output[0].startsWith('http')) {
      return (output as any).output[0];
    }
  }
  // Try to find a string URL property recursively
  if (typeof output === 'object' && output !== null) {
    const findUrl = (obj: any): string | null => {
      for (const key in obj) {
        if (typeof obj[key] === 'string' && obj[key].startsWith('http')) return obj[key];
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const found = findUrl(obj[key]);
          if (found) return found;
        }
      }
      return null;
    };
    const foundUrl = findUrl(output);
    if (foundUrl) return foundUrl;
  }
  return output;
}

// Helper to generate a structured JSON prompt for a given view
async function generateStructuredPromptWithGemini({
  geminiJSON,
  garmentDescription,
  view,
  basePrompt
}: {
  geminiJSON: any,
  garmentDescription: string,
  view: 'Front' | 'Close-up' | 'Back' | 'Side',
  basePrompt: string
}) {
  // Camera/pose instructions for each view
  const viewInstructions: Record<string, string> = {
    'Front': 'The model should be standing and facing directly towards the camera, full body visible, arms relaxed at the sides, neutral facial expression.',
    'Close-up': 'The model should be shown in a close-up studio portrait, head and upper torso visible, looking slightly off-camera or straight ahead, natural confident expression.',
    'Back': 'The model should be standing and facing directly away from the camera, full body visible, arms relaxed at the sides, posture natural. The back of the shirt, pants, and all accessories must be clearly visible and unobstructed.',
    'Side': 'The model should be standing in a perfect side profile pose (left or right), body turned exactly 90 degrees to the camera, arms relaxed, side of the outfit clearly visible.'
  }
  // Compose the Gemini prompt
  const geminiPrompt = `Generate a JSON-style prompt for an AI image generator to create a single professional fashion model in a ${view} studio pose. The JSON should include fields for prompt, garment_transfer (with source_outfit details), target_model (with identity, pose, expression, body_type, lighting, background, camera_angle), and output_requirements. The output must be a single model, with no duplicates, no extra limbs, no background clutter, no text, no watermarks, and no distortions.\n\nModel details: ${geminiJSON?.model?.identity || ''}.\nPose/camera: ${viewInstructions[view]}.\nOutfit: ${garmentDescription}.\nBackground: studio, soft even lighting, clean neutral background.\n`;

  // Use Gemini to generate the JSON prompt
  // (Assume GoogleGenAI is already initialized as 'ai')
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [createUserContent([geminiPrompt])],
  })
  // Extract JSON from Gemini response
  const jsonStart = response.text.indexOf('{')
  const jsonEnd = response.text.lastIndexOf('}')
  const jsonText = response.text.slice(jsonStart, jsonEnd + 1)
  return jsonText
}

// Example JSON structure for Gemini prompt
const EXAMPLE_JSON = `{
  "prompt": "Use only the left-side male model as the subject. Do not change his face, pose, hairstyle, body, lighting, or background. Only change his outfit — replace the plain fitted teal crew-neck T-shirt he is wearing with the shirt worn by the right-side model.",
  "garment_transfer": {
    "source_outfit": {
      "type": "men's casual button-up shirt",
      "pattern": "plaid checkered in black, navy blue, and white",
      "fabric": "soft brushed cotton with a matte finish and visible texture",
      "collar": "standard shirt collar",
      "closure": "front placket with small white buttons",
      "sleeves": "full-length sleeves with buttoned cuffs",
      "pocket": "left chest patch pocket with a small red brand tab",
      "fit": "relaxed and untucked with a slightly curved hem",
      "texture": "realistic weave and soft folds around elbows, chest, and shoulders"
    },
    "target_model": {
      "identity": "left-side male model wearing teal T-shirt and grey joggers",
      "pose": "standing front-facing, arms straight down",
      "expression": "neutral",
      "body_type": "athletic build",
      "lighting": "soft white studio lighting",
      "background": "clean white seamless background",
      "camera_angle": "frontal eye-level"
    }
  },
  "output_requirements": {
    "replace_outfit_only": true,
    "preserve_face": true,
    "preserve_pose": true,
    "preserve_lighting": true,
    "preserve_background": true,
    "fit_alignment": true,
    "pattern_wrap": "align plaid pattern to torso and arms realistically",
    "realistic_fabric_folds": true
  }
}`

// Helper to generate a detailed JSON description of garments, accessories, and model
async function generateGarmentModelJsonWithGemini({
  geminiJSON
}: {
  geminiJSON: any
}) {
  const garmentModelPrompt = `Generate a JSON prompt for a virtual try-on AI. Use the following JSON structure as a template. Fill in the details for the given model, outfit, and accessories.\n\nExample:\n${EXAMPLE_JSON}\n\nNow, for this model and outfit: ${JSON.stringify(geminiJSON)}, generate a JSON prompt in the same structure. The output must be a single image, with only one model, no collages, no extra people/items, no text, no watermarks, no distortions, etc.`;
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [createUserContent([garmentModelPrompt])],
  })
  const jsonStart = response.text.indexOf('{')
  const jsonEnd = response.text.lastIndexOf('}')
  const jsonText = response.text.slice(jsonStart, jsonEnd + 1)
  return jsonText
}

// Helper to generate a detailed JSON description of the pose/camera for a given view
async function generatePoseJsonWithGemini({
  view
}: {
  view: 'Front' | 'Close-up' | 'Back' | 'Side'
}) {
  const poseInstructions: Record<string, string> = {
    'Front': 'The model should be standing and facing directly towards the camera, full body visible, arms relaxed at the sides, neutral facial expression, studio lighting, clean background.',
    'Close-up': 'The model should be shown in a close-up studio portrait, head and upper torso visible, looking slightly off-camera or straight ahead, natural confident expression, studio lighting, clean background.',
    'Back': 'The model should be standing and facing directly away from the camera, full body visible, arms relaxed at the sides, posture natural. The back of the shirt, pants, and all accessories must be clearly visible and unobstructed, studio lighting, clean background.',
    'Side': 'The model should be standing in a perfect side profile pose (left or right), body turned exactly 90 degrees to the camera, arms relaxed, side of the outfit clearly visible, studio lighting, clean background.'
  }
  const posePrompt = `Generate a JSON object describing only the pose and camera angle for a virtual try-on AI. Use the following JSON structure as a template.\n\nExample:\n${EXAMPLE_JSON}\n\nFor the view: ${view}, describe the pose and camera details in the same structure, filling in only the relevant fields for pose, camera, and visibility. The output must be a single image, with only one model, no collages, no extra people/items, no text, no watermarks, no distortions, etc.\n\nPose/camera: ${poseInstructions[view]}`;
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [createUserContent([posePrompt])],
  })
  const jsonStart = response.text.indexOf('{')
  const jsonEnd = response.text.lastIndexOf('}')
  const jsonText = response.text.slice(jsonStart, jsonEnd + 1)
  return jsonText
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clothingItems, modelReference, backgroundStyle = 'studio' } = body
    if (!clothingItems || !Array.isArray(clothingItems) || clothingItems.length === 0) {
      return NextResponse.json({ error: 'No clothing items provided' }, { status: 400 })
    }
    // Only stitch garments and accessories, not model image
    const imagesBase64 = clothingItems
      .filter((item: any) => item.type === 'garments' || item.type === 'accessories')
      .map((item: any) => item.imageUrl)
    if (!imagesBase64.length) {
      return NextResponse.json({ error: 'No garment or accessory images provided' }, { status: 400 })
    }
    // Convert base64 images to Buffers
    const imageBuffers = imagesBase64.map((b64: string) => Buffer.from(b64.split(',')[1], 'base64'))
    // Create grid layout in memory
    const stitchedBuffer = await createGridLayoutFromBuffers(imageBuffers)
    // Analyze with Gemini, passing backgroundStyle and modelReference
    const geminiJSON = await analyzeWithGeminiBuffer(stitchedBuffer, backgroundStyle, modelReference)
    const genderPrompt = determineGenderPrompt(geminiJSON?.model?.identity || '')
    const basePrompt = `${genderPrompt} ${geminiJSON.prompt}`
    const negativePrompt = "multiple people, group, crowd, duplicate model, extra body parts, extra limbs, multiple faces, clones, reflections, cartoon, illustration, anime, unrealistic, distorted, deformed, poorly drawn, bad anatomy, wrong proportions, mutation, mutated, ugly, overexposed, underexposed, text, watermark, logo, low resolution, low quality, cropped, background clutter, extra garments, extra accessories"

    // If Studio mode, generate moodboard (4 angles)
    if (backgroundStyle === 'studio') {
      console.log('[Moodboard] Gemini analysis complete. Model:', geminiJSON?.model?.identity)
      // Step 1: Generate garment/model/accessory JSON once
      const garmentModelJson = await generateGarmentModelJsonWithGemini({ geminiJSON })
      console.log('[Moodboard] Garment/Model JSON:', garmentModelJson.slice(0, 200) + '...')
      // Views for the storyboard
      const views = [
        { label: 'Front', key: 'Front' },
        { label: 'Close-up', key: 'Close-up' },
        { label: 'Back', key: 'Back' },
        { label: 'Side', key: 'Side' },
      ]
      // Generate all images sequentially to preserve identity
      const moodboard = []
      let frontImageBuffer = null
      let frontUrl = null
      for (let i = 0; i < views.length; i++) {
        const { label, key } = views[i]
        let inputBuffer
        let prompt
        if (i === 0) {
          // Front: use stitchedBuffer and original prompt
          inputBuffer = stitchedBuffer
          const poseJson = await generatePoseJsonWithGemini({ view: key as any })
          const combinedPromptObj = {
            ...JSON.parse(garmentModelJson),
            ...JSON.parse(poseJson),
            output_requirements: {
              single_image: true,
              single_model: true,
              no_collage: true,
              no_multiple_people: true,
              no_extra_items: true,
              no_reflections: true,
              no_text: true,
              no_watermarks: true,
              no_logos: true,
              no_distortions: true
            }
          }
          prompt = JSON.stringify(combinedPromptObj)
          console.log(`[Moodboard] Front prompt:`, prompt.slice(0, 200))
          // Ensure .jpeg buffer
          inputBuffer = await sharp(inputBuffer).jpeg().toBuffer()
          frontUrl = await generateWithReplicate(prompt, negativePrompt, inputBuffer)
          console.log(`[Moodboard] Replicate output for Front:`, frontUrl)
          moodboard.push({ label, url: frontUrl })
          // Download front image as buffer for reuse
          const frontRes = await fetch(frontUrl)
          frontImageBuffer = await sharp(await frontRes.buffer()).jpeg().toBuffer()
        } else {
          // For other views, use front image as input
          inputBuffer = frontImageBuffer
          let anglePrompt = ''
          if (key === 'Back') {
            anglePrompt = 'Generate a back-facing studio shot of the same model and outfit as the input image. Keep identity, body proportions, outfit, and lighting consistent.'
          } else if (key === 'Close-up') {
            anglePrompt = 'Generate a close-up portrait crop of the same model shown in the input image. Focus on face and upper torso. Studio lighting.'
          } else if (key === 'Side') {
            anglePrompt = 'Show the same model from a clean side profile, standing in the same outfit and lighting.'
          }
          // Use the same garmentModelJson, but update the prompt
          let promptObj = {
            ...JSON.parse(garmentModelJson),
            output_requirements: {
              single_image: true,
              single_model: true,
              no_collage: true,
              no_multiple_people: true,
              no_extra_items: true,
              no_reflections: true,
              no_text: true,
              no_watermarks: true,
              no_logos: true,
              no_distortions: true
            }
          }
          if (promptObj.prompt) {
            promptObj.prompt += '\n' + anglePrompt
          } else {
            promptObj.prompt = anglePrompt
          }
          prompt = JSON.stringify(promptObj)
          console.log(`[Moodboard] ${label} prompt:`, prompt.slice(0, 200))
          // Ensure .jpeg buffer
          inputBuffer = await sharp(inputBuffer).jpeg().toBuffer()
          const url = await generateWithReplicate(prompt, negativePrompt, inputBuffer)
          console.log(`[Moodboard] Replicate output for ${label}:`, url)
          moodboard.push({ label, url })
        }
      }
      return NextResponse.json({ success: true, moodboard, timestamp: new Date().toISOString() })
    }
    // Otherwise, single-image flow (Lifestyle or fallback)
    // Generate a 4-view moodboard for lifestyle as well
    const views = [
      { label: 'Front', key: 'Front' },
      { label: 'Close-up', key: 'Close-up' },
      { label: 'Back', key: 'Back' },
      { label: 'Side', key: 'Side' },
    ]
    const moodboard = []
    let frontImageBuffer = null
    let frontUrl = null
    for (let i = 0; i < views.length; i++) {
      const { label, key } = views[i]
      let inputBuffer
      let prompt
      if (i === 0) {
        // Front: use stitchedBuffer and original prompt
        inputBuffer = stitchedBuffer
        // Use the same prompt as before for lifestyle front
        prompt = basePrompt
        console.log(`[Lifestyle] Front prompt:`, prompt.slice(0, 200))
        // Ensure .jpeg buffer
        inputBuffer = await sharp(inputBuffer).jpeg().toBuffer()
        frontUrl = await generateWithReplicate(prompt, negativePrompt, inputBuffer)
        console.log(`[Lifestyle] Replicate output for Front:`, frontUrl)
        moodboard.push({ label, url: frontUrl })
        // Download front image as buffer for reuse
        const frontRes = await fetch(frontUrl)
        frontImageBuffer = await sharp(await frontRes.buffer()).jpeg().toBuffer()
      } else {
        // For other views, use front image as input
        inputBuffer = frontImageBuffer
        let anglePrompt = ''
        if (key === 'Back') {
          anglePrompt = 'Generate a back-facing lifestyle shot of the same model and outfit as the input image. Keep identity, body proportions, outfit, and lighting consistent. Use a realistic lifestyle background.'
        } else if (key === 'Close-up') {
          anglePrompt = 'Generate a close-up portrait crop of the same model shown in the input image. Focus on face and upper torso. Realistic lifestyle lighting.'
        } else if (key === 'Side') {
          anglePrompt = 'Show the same model from a clean side profile, standing in the same outfit and lighting. Use a realistic lifestyle background.'
        }
        // Use the same base prompt, but update with the angle prompt
        let promptStr = basePrompt + '\n' + anglePrompt
        prompt = promptStr
        console.log(`[Lifestyle] ${label} prompt:`, prompt.slice(0, 200))
        // Ensure .jpeg buffer
        inputBuffer = await sharp(inputBuffer).jpeg().toBuffer()
        const url = await generateWithReplicate(prompt, negativePrompt, inputBuffer)
        console.log(`[Lifestyle] Replicate output for ${label}:`, url)
        moodboard.push({ label, url })
      }
    }
    return NextResponse.json({ success: true, moodboard, timestamp: new Date().toISOString() })
  } catch (error: any) {
    console.error('Error in generate API route:', error)
    return NextResponse.json({ error: 'Failed to generate virtual try-on', details: error?.message || error }, { status: 500 })
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 