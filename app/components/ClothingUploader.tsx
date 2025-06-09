'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, Plus, Shirt, Package, Palette, Info, ChevronDown, ChevronUp, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'
import { 
  validateImageFile, 
  validateModelImage,
  fileToBase64, 
  generateClothingItemId,
  ClothingItem,
  ModelReference
} from '../../lib/image-utils'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'

interface ClothingUploaderProps {
  step: 'garments' | 'accessories' | 'model' | 'review'
  onItemsChange: (items: ClothingItem[]) => void
  onModelReferenceChange: (model: ModelReference | null) => void
  existingItems?: ClothingItem[]
  existingModel?: ModelReference | null
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

const defaultModels = {
  male: {
    id: 'default-male',
    type: 'default' as const,
    gender: 'male' as const,
    imageUrl: '/models/default-male.jpg'
  },
  female: {
    id: 'default-female',
    type: 'default' as const,
    gender: 'female' as const,
    imageUrl: '/models/default-female.jpg'
  }
}

export default function ClothingUploader({
  step,
  onItemsChange,
  onModelReferenceChange,
  existingItems = [],
  existingModel = null
}: ClothingUploaderProps) {
  const [items, setItems] = useState<ClothingItem[]>(existingItems)
  const [selectedModel, setSelectedModel] = useState<ModelReference | null>(existingModel)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: File[], type: 'garments' | 'accessories') => {
    setError(null)
    const newItems: ClothingItem[] = []
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload only image files (JPG, PNG, WebP)')
        continue
      }

      try {
        const imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })

        const newItem: ClothingItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          category: type === 'garments' ? 'top' : 'accessories',
          imageUrl,
          file,
          type: type
        }
        newItems.push(newItem)
      } catch (err) {
        setError('Error processing image file')
        console.error('Error processing file:', err)
      }
    }

    if (newItems.length > 0) {
      const updatedItems = [...items, ...newItems]
      setItems(updatedItems)
      onItemsChange(updatedItems)
    }
  }, [items, onItemsChange])

  const handleModelUpload = useCallback(async (file: File) => {
    setError(null)
    try {
      const isValid = await validateModelImage(file)
      if (!isValid) {
        setError('Please upload a valid model image (portrait, clear face, good lighting)')
        return
      }

      const imageUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })

      const newModel: ModelReference = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'custom',
        imageUrl
      }
      setSelectedModel(newModel)
      onModelReferenceChange(newModel)
    } catch (err) {
      setError('Error processing model image')
      console.error('Error processing model image:', err)
    }
  }, [onModelReferenceChange])

  const handleDefaultModelSelect = useCallback((gender: 'male' | 'female') => {
    const model = defaultModels[gender]
    setSelectedModel(model)
    onModelReferenceChange(model)
  }, [onModelReferenceChange])

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    setIsDragging(false)
    if (step === 'model') {
      if (acceptedFiles.length > 0) {
        handleModelUpload(acceptedFiles[0])
      }
    } else if (step === 'garments' || step === 'accessories') {
      handleFiles(acceptedFiles, step)
    }
  }, [step, handleFiles, handleModelUpload])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (step === 'model') {
      if (files.length > 0) {
        handleModelUpload(files[0])
      }
    } else if (step === 'garments' || step === 'accessories') {
      handleFiles(files, step)
    }
  }, [step, handleFiles, handleModelUpload])

  const handleChooseFiles = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleRemoveItem = useCallback((id: string) => {
    const updatedItems = items.filter(item => item.id !== id)
    setItems(updatedItems)
    onItemsChange(updatedItems)
  }, [items, onItemsChange])

  const handleCategoryChange = useCallback((id: string, category: 'top' | 'bottom' | 'shoes' | 'accessories') => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, category } : item
    )
    setItems(updatedItems)
    onItemsChange(updatedItems)
  }, [items, onItemsChange])

  const handleRemoveModel = useCallback(() => {
    setSelectedModel(null)
    onModelReferenceChange(null)
  }, [onModelReferenceChange])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    }
  })

  const renderStepContent = () => {
    switch (step) {
      case 'garments':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-blue-800 font-medium mb-2">📸 Flatlay Image Requirements</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Take photos from directly above (top-down view)</li>
                <li>• Use a clean, solid-colored background</li>
                <li>• Ensure good lighting and no shadows</li>
                <li>• Lay items flat and spread them out</li>
              </ul>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Drag & drop your garment images here</p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <button
                onClick={handleChooseFiles}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose Files
              </button>
              <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, WebP</p>
            </div>

            {items.filter(item => item.type === 'garments').length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {items.filter(item => item.type === 'garments').map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <select
                      value={item.category}
                      onChange={(e) => handleCategoryChange(item.id, e.target.value as 'top' | 'bottom' | 'shoes' | 'accessories')}
                      className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-sm"
                    >
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="shoes">Shoes</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'accessories':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-blue-800 font-medium mb-2">💡 Tips for Accessories</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Flatlay images are recommended but not required</li>
                <li>• Include items like sunglasses, bags, watches, hats</li>
                <li>• This step is optional - you can skip to model selection</li>
              </ul>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Drag & drop your accessory images here</p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <button
                onClick={handleChooseFiles}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose Files
              </button>
              <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, WebP</p>
            </div>

            {items.filter(item => item.type === 'accessories').length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {items.filter(item => item.type === 'accessories').map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <select
                      value={item.category}
                      onChange={(e) => handleCategoryChange(item.id, e.target.value as 'top' | 'bottom' | 'shoes' | 'accessories')}
                      className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-sm"
                    >
                      <option value="accessories">Accessory</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'model':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-blue-800 font-medium mb-2">👤 Model Selection Requirements</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Choose a default model or upload your own photo</li>
                <li>• If uploading, use a clear, well-lit portrait</li>
                <li>• The model should be facing the camera</li>
                <li>• This step is required to proceed</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => handleDefaultModelSelect('male')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  selectedModel?.id === defaultModels.male.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary'
                }`}
              >
                <img
                  src={defaultModels.male.imageUrl}
                  alt="Default Male Model"
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <p className="font-medium">Default Male Model</p>
              </button>
              <button
                onClick={() => handleDefaultModelSelect('female')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  selectedModel?.id === defaultModels.female.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary'
                }`}
              >
                <img
                  src={defaultModels.female.imageUrl}
                  alt="Default Female Model"
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <p className="font-medium">Default Female Model</p>
              </button>
            </div>

            <div className="text-center mb-4">
              <p className="text-gray-500">or</p>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Upload your own model photo</p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <button
                onClick={handleChooseFiles}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose File
              </button>
              <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, WebP</p>
            </div>

            {selectedModel && (
              <div className="relative group">
                <img
                  src={selectedModel.imageUrl}
                  alt="Selected Model"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    onClick={handleRemoveModel}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )

      case 'review':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Uploaded Items</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Garments</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {items.filter(item => item.type === 'garments').map((item) => (
                        <div key={item.id} className="relative group">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-sm">
                            {item.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {items.filter(item => item.type === 'accessories').length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Accessories</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {items.filter(item => item.type === 'accessories').map((item) => (
                          <div key={item.id} className="relative group">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Selected Model</h3>
                {selectedModel && (
                  <div className="relative group">
                    <img
                      src={selectedModel.imageUrl}
                      alt="Selected Model"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={handleRemoveModel}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {renderStepContent()}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}
    </div>
  )
} 