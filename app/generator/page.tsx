'use client'

import React, { useState, useCallback } from 'react'
import { Upload, X, Plus, Wand2, Download, RotateCcw } from 'lucide-react'

interface ClothingItem {
  id: string
  name: string
  category: 'top' | 'bottom' | 'shoes' | 'accessories'
  imageUrl: string
  file: File
}

interface LayoutItem extends ClothingItem {
  x: number
  y: number
  width: number
  height: number
}

type GeneratorStep = 'upload' | 'layout' | 'generate'

export default function GeneratorPage() {
  const [currentStep, setCurrentStep] = useState<GeneratorStep>('upload')
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>([])
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const steps = [
    {
      id: 'upload' as const,
      title: 'Upload Items',
      emoji: '📤',
      description: 'Add clothing items to your collection'
    },
    {
      id: 'layout' as const,
      title: 'Create Layout',
      emoji: '🎨',
      description: 'Arrange items into an outfit'
    },
    {
      id: 'generate' as const,
      title: 'Generate Look',
      emoji: '✨',
      description: 'AI creates the virtual try-on'
    }
  ]

  const getStepIndex = (step: GeneratorStep) => {
    return steps.findIndex(s => s.id === step)
  }

  const canProceedToLayout = clothingItems.length > 0
  const canProceedToGenerate = layoutItems.length > 0

  const resetGenerator = () => {
    setCurrentStep('upload')
    setClothingItems([])
    setLayoutItems([])
    setGeneratedImage(null)
    setIsGenerating(false)
  }

  return (
    <div className="space-y-xxxl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-sm">
          <span className="text-4xl">✨</span>
          <h1 className="text-page-title text-notion-text-primary">
            Look Generator
          </h1>
        </div>
        
        {(clothingItems.length > 0 || layoutItems.length > 0 || generatedImage) && (
          <button
            onClick={resetGenerator}
            className="btn-ghost flex items-center space-x-sm"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="notion-card">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-lg">
              <div className="flex items-center space-x-md">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                  ${getStepIndex(currentStep) >= index
                    ? 'bg-notion-blue text-white'
                    : 'bg-notion-block-bg text-notion-text-tertiary border border-notion-border'
                  }
                `}>
                  {getStepIndex(currentStep) > index ? '✓' : index + 1}
                </div>
                <div>
                  <div className="flex items-center space-x-sm">
                    <span className="text-base">{step.emoji}</span>
                    <h3 className={`text-block-title ${
                      getStepIndex(currentStep) >= index
                        ? 'text-notion-text-primary'
                        : 'text-notion-text-tertiary'
                    }`}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-caption-text text-notion-text-tertiary">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-px ${
                  getStepIndex(currentStep) > index
                    ? 'bg-notion-blue'
                    : 'bg-notion-border'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[600px]">
        {currentStep === 'upload' && (
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
            
            {/* Upload placeholder - will be replaced with actual component */}
            <div className="border-2 border-dashed border-notion-border rounded-notion p-xxxl text-center">
              <Upload className="mx-auto mb-lg text-notion-text-tertiary" size={48} />
              <h3 className="text-block-title text-notion-text-primary mb-sm">
                Upload Clothing Items
              </h3>
              <p className="text-body-text text-notion-text-secondary mb-lg">
                Drag and drop images here, or click to browse
              </p>
              <button className="btn-primary">
                Choose Files
              </button>
            </div>
            
            {canProceedToLayout && (
              <div className="flex justify-end pt-lg border-t border-notion-border mt-xxl">
                <button
                  onClick={() => setCurrentStep('layout')}
                  className="btn-primary flex items-center space-x-sm"
                >
                  <span>Create Layout</span>
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'layout' && (
          <div className="notion-card">
            <div className="flex items-center space-x-sm mb-xxl">
              <span className="text-xl">🎨</span>
              <h2 className="text-section-header text-notion-text-primary">
                Create Outfit Layout
              </h2>
            </div>
            <p className="text-body-text text-notion-text-secondary mb-xxl">
              Arrange your clothing items to create the perfect outfit composition.
            </p>
            
            {/* Layout placeholder - will be replaced with actual component */}
            <div className="bg-notion-block-bg border border-notion-border rounded-notion p-xxxl min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-lg">🎨</div>
                <h3 className="text-block-title text-notion-text-primary mb-sm">
                  Layout Composer
                </h3>
                <p className="text-body-text text-notion-text-secondary">
                  Drag and arrange clothing items to create your look
                </p>
              </div>
            </div>
            
            <div className="flex justify-between pt-lg border-t border-notion-border mt-xxl">
              <button
                onClick={() => setCurrentStep('upload')}
                className="btn-secondary"
              >
                ← Back to Upload
              </button>
              
              {canProceedToGenerate && (
                <button
                  onClick={() => setCurrentStep('generate')}
                  className="btn-primary flex items-center space-x-sm"
                >
                  <Wand2 size={16} />
                  <span>Generate Look</span>
                </button>
              )}
            </div>
          </div>
        )}

        {currentStep === 'generate' && (
          <div className="notion-card">
            <div className="flex items-center space-x-sm mb-xxl">
              <span className="text-xl">✨</span>
              <h2 className="text-section-header text-notion-text-primary">
                AI Look Generation
              </h2>
            </div>
            <p className="text-body-text text-notion-text-secondary mb-xxl">
              Our AI will generate a realistic virtual try-on using your outfit layout.
            </p>
            
            {/* Generator placeholder - will be replaced with actual component */}
            <div className="bg-notion-block-bg border border-notion-border rounded-notion p-xxxl min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                {isGenerating ? (
                  <div>
                    <div className="text-4xl mb-lg">⏳</div>
                    <h3 className="text-block-title text-notion-text-primary mb-sm">
                      Generating Your Look...
                    </h3>
                    <p className="text-body-text text-notion-text-secondary">
                      This may take a few minutes
                    </p>
                  </div>
                ) : generatedImage ? (
                  <div>
                    <div className="text-4xl mb-lg">🎉</div>
                    <h3 className="text-block-title text-notion-text-primary mb-sm">
                      Look Generated Successfully!
                    </h3>
                    <p className="text-body-text text-notion-text-secondary">
                      Your virtual try-on is ready
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-lg">✨</div>
                    <h3 className="text-block-title text-notion-text-primary mb-sm">
                      Ready to Generate
                    </h3>
                    <p className="text-body-text text-notion-text-secondary mb-lg">
                      Click the button below to create your virtual try-on
                    </p>
                    <button
                      onClick={() => setIsGenerating(true)}
                      className="btn-primary flex items-center space-x-sm"
                    >
                      <Wand2 size={16} />
                      <span>Generate Look</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between pt-lg border-t border-notion-border mt-xxl">
              <button
                onClick={() => setCurrentStep('layout')}
                className="btn-secondary"
              >
                ← Back to Layout
              </button>
              
              {generatedImage && (
                <div className="flex space-x-md">
                  <button className="btn-secondary flex items-center space-x-sm">
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                  
                  <button
                    onClick={() => setIsGenerating(true)}
                    className="btn-primary flex items-center space-x-sm"
                  >
                    <Wand2 size={16} />
                    <span>Generate Again</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 