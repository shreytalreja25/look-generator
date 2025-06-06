import Replicate from 'replicate'

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
})

export interface ClothingItem {
  id: string
  name: string
  category: 'top' | 'bottom' | 'shoes' | 'accessories'
  imageUrl: string
  x: number
  y: number
  width: number
  height: number
}

export interface GenerationOptions {
  modelType?: 'female' | 'male' | 'diverse'
  style?: 'casual' | 'formal' | 'streetwear' | 'bohemian'
  background?: 'studio' | 'outdoor' | 'minimal' | 'lifestyle'
  pose?: 'front' | 'side' | 'dynamic' | 'sitting'
}

/**
 * Generate a virtual try-on image using Replicate's virtual try-on models
 */
export async function generateVirtualTryOn(
  layoutImageBase64: string,
  options: GenerationOptions = {}
): Promise<string> {
  try {
    const {
      modelType = 'diverse',
      style = 'casual',
      background = 'studio',
      pose = 'front'
    } = options

    // Use a virtual try-on model (this is a placeholder - you'll need to find the actual model)
    // Popular models include: tencentarc/gfpgan, stability-ai/stable-diffusion, etc.
    // For virtual try-on specifically, look for models like "virtual-try-on" or "fashion-synthesis"
    
    const prompt = `Professional fashion photography, ${modelType} model wearing the outfit from the provided layout, ${style} style, ${background} background, ${pose} pose, high resolution, studio lighting, fashion photography, clean composition, realistic fabric textures, professional modeling`

    const output = await replicate.run(
      // Note: This is a placeholder model. You'll need to find an actual virtual try-on model
      // Some options to explore:
      // - "tencentarc/gfpgan" for face enhancement
      // - "cjwbw/anything-v3.0" for general image generation
      // - Look for specific virtual try-on models on Replicate
      "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
      {
        prompt: prompt,
        image: `data:image/png;base64,${layoutImageBase64}`,
        num_inference_steps: 50,
        guidance_scale: 7.5,
        width: 512,
        height: 768,
        seed: Math.floor(Math.random() * 1000000)
      }
    )

    // The output format depends on the model used
    if (Array.isArray(output) && output.length > 0) {
      return output[0] as string
    } else if (typeof output === 'string') {
      return output
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
  layoutImageBase64: string,
  count: number = 3,
  options: GenerationOptions = {}
): Promise<string[]> {
  const promises = Array.from({ length: count }, () => 
    generateVirtualTryOn(layoutImageBase64, options)
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

/**
 * Get available models for virtual try-on (you'll need to update this based on available models)
 */
export function getAvailableModels() {
  return [
    {
      id: 'stable-diffusion',
      name: 'Stable Diffusion',
      description: 'General purpose image generation with clothing prompt',
      category: 'general'
    },
    {
      id: 'gfpgan',
      name: 'GFPGAN Face Enhancement',
      description: 'Face enhancement for better portrait results',
      category: 'enhancement'
    }
    // Add more models as they become available
  ]
}

export default replicate 