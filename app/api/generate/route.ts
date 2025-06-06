import { NextRequest, NextResponse } from 'next/server'
import { generateVirtualTryOn, GenerationOptions } from '../../../lib/replicate'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { layoutImageBase64, options = {} }: {
      layoutImageBase64: string
      options?: GenerationOptions
    } = body

    if (!layoutImageBase64) {
      return NextResponse.json(
        { error: 'Layout image is required' },
        { status: 400 }
      )
    }

    // Check if Replicate API token is configured
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500 }
      )
    }

    // Generate the virtual try-on image
    const generatedImageUrl = await generateVirtualTryOn(layoutImageBase64, options)

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in generate API route:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        error: 'Failed to generate virtual try-on',
        details: errorMessage
      },
      { status: 500 }
    )
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