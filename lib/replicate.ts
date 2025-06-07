import Replicate from 'replicate'

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
})

export interface GenerationOptions {
  prompt: string
  negative_prompt?: string
  layoutImageBase64: string
  strength?: number
  guidance_scale?: number
  num_inference_steps?: number
  seed?: number
  output_format?: string
}

/**
 * Generate a virtual try-on image using black-forest-labs/flux-kontext-pro
 */
export async function generateVirtualTryOn(options: GenerationOptions): Promise<string> {
  try {
    const {
      prompt = "A professional fashion model wearing the exact outfit as arranged in the provided layout image. The model should wear only the clothing items shown in the layout, matching their style, color, and position. High-resolution, studio lighting, realistic fabric textures, natural pose, clean background, fashion magazine quality.",
      negative_prompt = "cartoon, drawing, anime, illustration, extra clothing, extra accessories, unrealistic, deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, low quality, watermark, text, logo, blurry, out of frame, cropped, duplicate, multiple people, background clutter",
      layoutImageBase64,
      strength = 1,
      guidance_scale = 4.0,
      num_inference_steps = 4,
      seed = Math.floor(Math.random() * 1000000),
      output_format = 'jpg',
    } = options

    const replicateInput = {
      prompt,
      negative_prompt,
      input_image: `data:image/png;base64,${layoutImageBase64}`,
      strength,
      guidance_scale,
      num_inference_steps,
      seed,
      output_format
    }
    console.log('Replicate API input:', JSON.stringify(replicateInput, null, 2));
    const output = await replicate.run(
      "black-forest-labs/flux-kontext-pro",
      { input: replicateInput }
    )

    // Log the output for debugging
    console.log('Replicate API output:', output);

    // Handle streaming response
    if (output instanceof ReadableStream) {
      const reader = output.getReader();
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      // Combine all chunks into a single Uint8Array
      const imageData = new Uint8Array(chunks.flatMap(chunk => Array.from(chunk)));
      
      // Convert to base64
      const base64 = Buffer.from(imageData).toString('base64');
      return `data:image/jpeg;base64,${base64}`;
    }

    throw new Error('Unexpected output format from Replicate API')
  } catch (error) {
    console.error('Error generating virtual try-on:', error)
    throw new Error(`Failed to generate virtual try-on: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate multiple variations of a virtual try-on
 */
export async function generateVirtualTryOnVariations(
  prompt: string,
  layoutImageBase64: string,
  count: number = 3,
  options: Omit<GenerationOptions, 'prompt' | 'layoutImageBase64'> = {}
): Promise<string[]> {
  const promises = Array.from({ length: count }, () => 
    generateVirtualTryOn({
      prompt,
      layoutImageBase64,
      ...options
    })
  )

  try {
    const results = await Promise.all(promises)
    return results
  } catch (error) {
    console.error('Error generating variations:', error)
    throw error
  }
}

/**
 * Check if Replicate API is properly configured
 */
export function checkReplicateConfig(): boolean {
  return !!process.env.REPLICATE_API_TOKEN
}

export default replicate 