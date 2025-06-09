/**
 * Image processing utilities for the Look Generator
 * Handles image uploading, resizing, and layout composition
 */

export interface ClothingItem {
  id: string
  name: string
  category: 'top' | 'bottom' | 'shoes' | 'accessories'
  imageUrl: string
  file: File
  type: 'garments' | 'accessories'
}

export interface ModelReference {
  id: string
  type: 'default' | 'custom'
  gender?: 'male' | 'female'
  imageUrl?: string
  file?: File
}

export interface LayoutItem extends ClothingItem {
  x: number
  y: number
  width: number
  height: number
}

export interface LayoutDimensions {
  width: number
  height: number
  backgroundColor?: string
}

/**
 * Convert a File to a base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * Load an image from a URL and return as HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.crossOrigin = 'anonymous' // Enable CORS for external images
    img.src = src
  })
}

/**
 * Resize an image to fit within specified dimensions while maintaining aspect ratio
 */
export function resizeImage(
  image: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = image.width / image.height
  
  let width = maxWidth
  let height = maxHeight
  
  if (width / height > aspectRatio) {
    width = height * aspectRatio
  } else {
    height = width / aspectRatio
  }
  
  return { width: Math.round(width), height: Math.round(height) }
}

/**
 * Create a canvas-based layout by stitching clothing items together
 */
export async function createOutfitLayout(
  layoutItems: LayoutItem[],
  dimensions: LayoutDimensions = { width: 800, height: 1200 }
): Promise<string> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Unable to get canvas context')
  }
  
  // Set canvas dimensions
  canvas.width = dimensions.width
  canvas.height = dimensions.height
  
  // Fill background
  ctx.fillStyle = dimensions.backgroundColor || '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Load and draw each clothing item
  for (const item of layoutItems) {
    try {
      const img = await loadImage(item.imageUrl)
      
      // Calculate position and size based on layout coordinates
      const x = (item.x / 100) * canvas.width
      const y = (item.y / 100) * canvas.height
      const width = (item.width / 100) * canvas.width
      const height = (item.height / 100) * canvas.height
      
      // Draw the image
      ctx.drawImage(img, x, y, width, height)
      
    } catch (error) {
      console.error(`Failed to load image for item ${item.id}:`, error)
      // Draw a placeholder rectangle instead
      ctx.fillStyle = '#E8E8E8'
      ctx.fillRect(
        (item.x / 100) * canvas.width,
        (item.y / 100) * canvas.height,
        (item.width / 100) * canvas.width,
        (item.height / 100) * canvas.height
      )
      
      // Add error text
      ctx.fillStyle = '#666666'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(
        'Image Error',
        (item.x / 100) * canvas.width + (item.width / 100) * canvas.width / 2,
        (item.y / 100) * canvas.height + (item.height / 100) * canvas.height / 2
      )
    }
  }
  
  // Convert canvas to base64
  return canvas.toDataURL('image/png')
}

/**
 * Extract base64 data from a data URL
 */
export function extractBase64FromDataURL(dataUrl: string): string {
  const base64Index = dataUrl.indexOf(',')
  if (base64Index === -1) {
    throw new Error('Invalid data URL format')
  }
  return dataUrl.substring(base64Index + 1)
}

/**
 * Validate uploaded image file
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPG, PNG, or WebP)'
    }
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB'
    }
  }
  
  return { isValid: true }
}

/**
 * Validate model reference image
 */
export function validateModelImage(file: File): { isValid: boolean; error?: string } {
  const validation = validateImageFile(file)
  if (!validation.isValid) return validation

  // Additional model-specific validations can be added here
  return { isValid: true }
}

/**
 * Generate a unique ID for clothing items
 */
export function generateClothingItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get optimal layout positions for different clothing categories
 */
export function getDefaultLayoutPosition(category: string): {
  x: number
  y: number
  width: number
  height: number
} {
  const positions = {
    top: { x: 25, y: 10, width: 50, height: 35 },
    bottom: { x: 25, y: 45, width: 50, height: 35 },
    shoes: { x: 25, y: 80, width: 50, height: 15 },
    accessories: { x: 5, y: 10, width: 15, height: 15 }
  }
  
  return positions[category as keyof typeof positions] || positions.top
}

/**
 * Create a thumbnail version of an image
 */
export async function createThumbnail(
  imageUrl: string,
  maxSize: number = 150
): Promise<string> {
  const img = await loadImage(imageUrl)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Unable to get canvas context')
  }
  
  const { width, height } = resizeImage(img, maxSize, maxSize)
  
  canvas.width = width
  canvas.height = height
  
  ctx.drawImage(img, 0, 0, width, height)
  
  return canvas.toDataURL('image/jpeg', 0.8)
}

/**
 * Stitch an array of image URLs side by side into a single base64 image
 */
export async function stitchImagesSideBySide(imageUrls: string[], targetHeight: number = 400): Promise<string> {
  if (imageUrls.length === 0) throw new Error('No images to stitch');
  // Load all images
  const images = await Promise.all(imageUrls.map(url => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }));
  // Calculate total width and scale each image to targetHeight
  const widths = images.map(img => img.width * (targetHeight / img.height));
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  const canvas = document.createElement('canvas');
  canvas.width = totalWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  let x = 0;
  for (let i = 0; i < images.length; i++) {
    const w = widths[i];
    ctx.drawImage(images[i], x, 0, w, targetHeight);
    x += w;
  }
  return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
} 