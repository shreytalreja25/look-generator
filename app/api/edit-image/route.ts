import { NextRequest, NextResponse } from 'next/server'
import fetch from 'node-fetch'
import sharp from 'sharp'
import { generateWithReplicate } from '../generate/route'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, editPrompt, editJson } = await request.json();
    let prompt = '';
    if (editJson && typeof editJson === 'object' && editJson.prompt) {
      prompt = editJson.prompt;
    } else if (editPrompt) {
      prompt = editPrompt;
    }
    if (!imageUrl || !prompt) {
      return NextResponse.json({ error: 'Missing image or prompt' }, { status: 400 });
    }
    // Download the image
    const imgRes = await fetch(imageUrl)
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
    // Ensure .jpeg buffer
    const jpegBuffer = await sharp(imgBuffer).jpeg().toBuffer()
    // Build the prompt
    const fullPrompt = `Apply the following modification to this image: "${prompt}". Do NOT change the model's identity, clothing, pose, background, or lighting. Only apply the requested change.`
    const negativePrompt = "multiple people, group, crowd, duplicate model, extra body parts, extra limbs, multiple faces, clones, reflections, cartoon, illustration, anime, unrealistic, distorted, deformed, poorly drawn, bad anatomy, wrong proportions, mutation, mutated, ugly, overexposed, underexposed, text, watermark, logo, low resolution, low quality, cropped, background clutter, extra garments, extra accessories"
    const editedUrl = await generateWithReplicate(fullPrompt, negativePrompt, jpegBuffer)
    if (!editedUrl) throw new Error('No output from Replicate')
    return NextResponse.json({ editedUrl })
  } catch (error) {
    console.error('Edit image error:', error)
    return NextResponse.json({ error: 'Failed to edit image', details: error?.message || error }, { status: 500 })
  }
} 