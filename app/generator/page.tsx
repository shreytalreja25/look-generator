'use client'

import React, { useState, useCallback } from 'react'
import { Upload, X, Plus, Wand2, Download, RotateCcw } from 'lucide-react'
import ClothingUploader from '../components/ClothingUploader'
import LayoutComposer from '../components/LayoutComposer'
import html2canvas from 'html2canvas'
import { stitchImagesSideBySide } from '../../lib/image-utils'

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

type GeneratorStep = 'upload' | 'generate'

export default function GeneratorPage() {
  const [currentStep, setCurrentStep] = useState<GeneratorStep>('upload')
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>([])
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [layoutImageBase64, setLayoutImageBase64] = useState<string | null>(null)
  const [backgroundStyle, setBackgroundStyle] = useState<'studio' | 'lifestyle'>('studio')

  const steps = [
    {
      id: 'upload' as const,
      title: 'Upload Items',
      emoji: '📤',
      description: 'Add clothing items to your collection'
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

  const canProceedToGenerate = clothingItems.length > 0

  const resetGenerator = () => {
    setCurrentStep('upload')
    setClothingItems([])
    setLayoutItems([])
    setGeneratedImage(null)
    setIsGenerating(false)
    setLayoutImageBase64(null)
  }

  const handleItemsUploaded = async (items: ClothingItem[]) => {
    setClothingItems(items);
    if (items.length > 0) {
      // Stitch images side by side
      const stitched = await stitchImagesSideBySide(items.map(i => i.imageUrl));
      setLayoutImageBase64(stitched);
    } else {
      setLayoutImageBase64(null);
    }
  };

  // Helper to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerateLook = async () => {
    if (!clothingItems.length) {
      alert('No clothing items found. Please upload items and try again.');
      return;
    }
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      // Convert all clothing item files to base64
      const imagesBase64 = await Promise.all(clothingItems.map(item => fileToBase64(item.file)));
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagesBase64, backgroundStyle })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        alert(data.error || 'Failed to generate look');
      }
    } catch (err) {
      alert('Error generating look: ' + (err instanceof Error ? err.message : err));
    } finally {
      setIsGenerating(false);
    }
  };

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
        
        {(clothingItems.length > 0 || generatedImage) && (
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
            <ClothingUploader
              onItemsUploaded={handleItemsUploaded}
              existingItems={clothingItems}
            />
            {/* Background Style Selector */}
            <div className="mt-lg mb-lg">
              <label className="text-block-title text-notion-text-primary mb-sm block">Background Style</label>
              <div className="flex space-x-lg">
                <label className="flex items-center space-x-sm">
                  <input
                    type="radio"
                    name="backgroundStyle"
                    value="studio"
                    checked={backgroundStyle === 'studio'}
                    onChange={() => setBackgroundStyle('studio')}
                  />
                  <span>Studio (Professional)</span>
                </label>
                <label className="flex items-center space-x-sm">
                  <input
                    type="radio"
                    name="backgroundStyle"
                    value="lifestyle"
                    checked={backgroundStyle === 'lifestyle'}
                    onChange={() => setBackgroundStyle('lifestyle')}
                  />
                  <span>Lifestyle (Real Life)</span>
                </label>
              </div>
            </div>
            {clothingItems.length > 0 && (
              <div className="flex justify-end pt-lg border-t border-notion-border mt-xxl">
                <button
                  onClick={() => {
                    setCurrentStep('generate');
                    handleGenerateLook();
                  }}
                  className="btn-primary flex items-center space-x-sm"
                >
                  <Wand2 size={16} />
                  <span>Generate Look</span>
                </button>
              </div>
            )}
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
            
            <div className="bg-notion-block-bg border border-notion-border rounded-notion p-xxxl min-h-[400px] flex flex-col items-center justify-center">
              <div className="text-center w-full">
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
                    <img src={generatedImage} alt="Generated Look" style={{maxWidth: 400, borderRadius: 16, margin: '0 auto'}} />
                    <div className="text-4xl mb-lg mt-lg">🎉</div>
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
                  </div>
                )}
              </div>
            </div>
            {/* Center and align the action buttons in a row */}
            <div className="flex flex-row justify-center items-center gap-md pt-lg border-t border-notion-border mt-xxl">
              <button
                onClick={() => setCurrentStep('upload')}
                className="btn-secondary"
              >
                ← Back to Upload
              </button>
              {generatedImage && (
                <>
                  <button className="btn-secondary flex items-center space-x-sm">
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleGenerateLook}
                    className="btn-primary flex items-center space-x-sm"
                  >
                    <Wand2 size={16} />
                    <span>Generate Again</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 