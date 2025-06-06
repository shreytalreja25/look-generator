'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, Plus, Shirt, Package, Palette } from 'lucide-react'
import { 
  validateImageFile, 
  fileToBase64, 
  generateClothingItemId,
  ClothingItem 
} from '../../lib/image-utils'

interface ClothingUploaderProps {
  onItemsUploaded: (items: ClothingItem[]) => void
  existingItems: ClothingItem[]
}

const categoryIcons = {
  top: Shirt,
  bottom: Package,
  shoes: Package,
  accessories: Palette
}

const categoryLabels = {
  top: 'Tops',
  bottom: 'Bottoms',
  shoes: 'Shoes',
  accessories: 'Accessories'
}

export default function ClothingUploader({ onItemsUploaded, existingItems }: ClothingUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingItems, setUploadingItems] = useState<ClothingItem[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const newErrors: string[] = []
    const newItems: ClothingItem[] = []

    for (const file of fileArray) {
      const validation = validateImageFile(file)
      
      if (!validation.isValid) {
        newErrors.push(`${file.name}: ${validation.error}`)
        continue
      }

      try {
        const imageUrl = await fileToBase64(file)
        const item: ClothingItem = {
          id: generateClothingItemId(),
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          category: 'top', // Default category - user can change later
          imageUrl,
          file
        }
        newItems.push(item)
      } catch (error) {
        newErrors.push(`${file.name}: Failed to process image`)
      }
    }

    setErrors(newErrors)
    
    if (newItems.length > 0) {
      const allItems = [...existingItems, ...newItems]
      setUploadingItems(allItems)
      onItemsUploaded(allItems)
    }
  }, [existingItems, onItemsUploaded])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleChooseFiles = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    fileInputRef.current?.click()
  }, [])

  const handleUploadAreaClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only trigger file selection if the click target is the div itself or certain child elements
    const target = e.target as HTMLElement
    if (target.tagName !== 'BUTTON') {
      fileInputRef.current?.click()
    }
  }, [])

  const handleCategoryChange = useCallback((itemId: string, category: ClothingItem['category']) => {
    const updatedItems = existingItems.map(item => 
      item.id === itemId ? { ...item, category } : item
    )
    onItemsUploaded(updatedItems)
  }, [existingItems, onItemsUploaded])

  const handleNameChange = useCallback((itemId: string, name: string) => {
    const updatedItems = existingItems.map(item => 
      item.id === itemId ? { ...item, name } : item
    )
    onItemsUploaded(updatedItems)
  }, [existingItems, onItemsUploaded])

  const removeItem = useCallback((itemId: string) => {
    const updatedItems = existingItems.filter(item => item.id !== itemId)
    onItemsUploaded(updatedItems)
  }, [existingItems, onItemsUploaded])

  return (
    <div className="notion-card">
      <div className="flex items-center space-x-sm mb-xxl">
        <span className="text-xl">📤</span>
        <h2 className="text-section-header text-notion-text-primary">
          Upload Clothing Items
        </h2>
      </div>
      
      <p className="text-body-text text-notion-text-secondary mb-xxl">
        Upload high-quality images of clothing items you want to include in your look. 
        Supported formats: JPG, PNG, WebP.
      </p>

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-notion p-xxxl text-center transition-colors cursor-pointer
          ${isDragging 
            ? 'border-notion-blue bg-notion-blue bg-opacity-5' 
            : 'border-notion-border hover:border-notion-blue hover:bg-notion-hover-bg'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadAreaClick}
      >
        <Upload className="mx-auto mb-lg text-notion-text-tertiary" size={48} />
        <h3 className="text-block-title text-notion-text-primary mb-sm">
          Upload Clothing Items
        </h3>
        <p className="text-body-text text-notion-text-secondary mb-lg">
          Drag and drop images here, or click to browse
        </p>
        <button 
          className="btn-primary"
          onClick={handleChooseFiles}
          type="button"
        >
          Choose Files
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-lg p-md bg-notion-red bg-opacity-10 border border-notion-red border-opacity-20 rounded-notion">
          <div className="flex items-center space-x-sm mb-sm">
            <span className="text-notion-red">⚠️</span>
            <h4 className="text-body-text font-medium text-notion-red">
              Upload Errors
            </h4>
          </div>
          <ul className="space-y-xs">
            {errors.map((error, index) => (
              <li key={index} className="text-caption-text text-notion-red">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded Items */}
      {existingItems.length > 0 && (
        <div className="mt-xxl">
          <div className="flex items-center space-x-sm mb-lg">
            <span className="text-lg">👕</span>
            <h3 className="text-subsection-title text-notion-text-primary">
              Uploaded Items ({existingItems.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {existingItems.map((item) => (
              <div key={item.id} className="notion-block">
                <div className="flex justify-between items-start mb-sm">
                  <h4 className="text-block-title text-notion-text-primary truncate">
                    {item.name}
                  </h4>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="btn-ghost p-xs hover:bg-notion-red hover:bg-opacity-10"
                  >
                    <X size={14} className="text-notion-red" />
                  </button>
                </div>

                {/* Item Image */}
                <div className="aspect-square bg-notion-block-bg rounded-notion mb-md overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Item Name Input */}
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleNameChange(item.id, e.target.value)}
                  className="input-field w-full mb-sm"
                  placeholder="Item name"
                />

                {/* Category Selector */}
                <select
                  value={item.category}
                  onChange={(e) => handleCategoryChange(item.id, e.target.value as ClothingItem['category'])}
                  className="input-field w-full"
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 