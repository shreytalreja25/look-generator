import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import fetch from 'node-fetch'

const REPLICATE_API_KEY = process.env.REPLICATE_API_TOKEN || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Edit API received body:', body)
    const { imageUrl, editPrompt, editJson } = body
    let prompt = ''
    if (editJson && typeof editJson === 'object' && editJson.prompt) {
      prompt = editJson.prompt
    } else if (editPrompt) {
      prompt = editPrompt
    }
    console.log('Edit API using prompt:', prompt)
    if (!imageUrl || !prompt) {
      return NextResponse.json({ error: 'Missing image or prompt' }, { status: 400 })
    }
    // Download the image
    const imgRes = await fetch(imageUrl)
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
    // Build the prompt
    const fullPrompt = `Apply the following modification to this image: "${prompt}". Do NOT change the model's identity, clothing, pose, background, or lighting. Only apply the requested change.`
    const replicate = new Replicate({ auth: REPLICATE_API_KEY })
    const base64 = imgBuffer.toString('base64')
    const dataURI = `data:image/jpeg;base64,${base64}`
    const input = {
      prompt: fullPrompt,
      input_image: dataURI,
      output_format: 'jpg'
    }
    const output = await replicate.run('black-forest-labs/flux-kontext-pro', { input })
    let editedUrl = null
    if (Array.isArray(output)) {
      editedUrl = output[0]
    } else if (typeof output === 'string') {
      editedUrl = output
    } else if (
      output &&
      typeof output === 'object' &&
      'output' in output &&
      Array.isArray((output as any).output)
    ) {
      editedUrl = (output as any).output[0]
    }
    if (!editedUrl) throw new Error('No output from Replicate')
    return NextResponse.json({ editedUrl })
  } catch (error) {
    console.error('Edit image error:', error)
    return NextResponse.json({ error: 'Failed to edit image', details: error?.message || error }, { status: 500 })
  }
} 