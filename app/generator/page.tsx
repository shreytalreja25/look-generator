'use client'

import { useState, useRef, useEffect } from 'react'
import { ClothingItem, ModelReference } from '../../lib/image-utils'
import ClothingUploader from '../components/ClothingUploader'
import { Loader2, Download, RotateCcw, ArrowLeft } from 'lucide-react'

const steps = [
  { label: 'Upload Garments' },
  { label: 'Upload Accessories' },
  { label: 'Select Model' },
  { label: 'Review & Generate' },
]

export default function GeneratorPage() {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])
  const [selectedModel, setSelectedModel] = useState<ModelReference | null>(null)
  const [backgroundStyle, setBackgroundStyle] = useState<'studio' | 'lifestyle'>('studio')
  const [stepIndex, setStepIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generatedMoodboard, setGeneratedMoodboard] = useState<null | { label: string; url: string }[]>(null)
  const [moodboardGrid, setMoodboardGrid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Step navigation
  const nextStep = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  const prevStep = () => setStepIndex((i) => Math.max(i - 1, 0))
  const resetAll = () => {
    setStepIndex(0)
    setGeneratedImage(null)
    setIsGenerating(false)
    setError(null)
    setClothingItems([])
    setSelectedModel(null)
    setGeneratedMoodboard(null)
    setMoodboardGrid(null)
  }

  // Handlers
  const handleItemsChange = (items: ClothingItem[]) => setClothingItems(items)
  const handleModelReferenceChange = (model: ModelReference | null) => setSelectedModel(model)

  // Generate Look
  const handleGenerateLook = async () => {
    if (!selectedModel) {
      setError('Please select a model reference')
      return
    }
    if (clothingItems.length === 0) {
      setError('Please upload at least one clothing item')
      return
    }
    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)
    setGeneratedMoodboard(null)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clothingItems, modelReference: selectedModel, backgroundStyle }),
      })
      if (!response.ok) throw new Error('Failed to generate look')
      const data = await response.json()
      if (data.moodboard) {
        setGeneratedMoodboard(data.moodboard)
        setMoodboardGrid(data.grid)
        setGeneratedImage(null)
      } else {
        setGeneratedImage(data.imageUrl)
        setGeneratedMoodboard(null)
        setMoodboardGrid(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  // Step content
  let content = null
  if (stepIndex === 0) {
    // Step 1: Garments
    content = (
      <div className="max-w-xl mx-auto">
        <ClothingUploader
          step="garments"
          onItemsChange={handleItemsChange}
          onModelReferenceChange={() => {}}
          existingItems={clothingItems}
          existingModel={null}
        />
        <button
          onClick={nextStep}
          disabled={!clothingItems.some(i => i.type === 'garments')}
          className="mt-8 px-6 py-2 rounded-lg bg-blue-600 text-white font-medium shadow disabled:opacity-50"
        >
          Next
        </button>
      </div>
    )
  } else if (stepIndex === 1) {
    // Step 2: Accessories
    content = (
      <div className="max-w-xl mx-auto">
        <ClothingUploader
          step="accessories"
          onItemsChange={handleItemsChange}
          onModelReferenceChange={() => {}}
          existingItems={clothingItems}
          existingModel={null}
        />
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium"
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium shadow"
          >
            Next
          </button>
        </div>
      </div>
    )
  } else if (stepIndex === 2) {
    // Step 3: Model
    content = (
      <div className="max-w-xl mx-auto">
        <ClothingUploader
          step="model"
          onItemsChange={() => {}}
          onModelReferenceChange={handleModelReferenceChange}
          existingItems={[]}
          existingModel={selectedModel}
        />
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium"
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            disabled={!selectedModel}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium shadow disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    )
  } else if (stepIndex === 3) {
    // Step 4: Review & Generate
    content = (
      <div className="max-w-2xl mx-auto w-full">
        {!generatedImage && !generatedMoodboard ? (
          <div className="bg-white rounded-lg shadow-sm p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center">Review & Generate</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold mb-2">🧥 Garments</h3>
                <div className="flex flex-wrap gap-2">
                  {clothingItems.filter(i => i.type === 'garments').map(item => (
                    <img key={item.id} src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded" />
                  ))}
                </div>
                <h3 className="font-semibold mt-6 mb-2">👜 Accessories</h3>
                <div className="flex flex-wrap gap-2">
                  {clothingItems.filter(i => i.type === 'accessories').length === 0 ? (
                    <span className="text-gray-400 text-sm">None</span>
                  ) : clothingItems.filter(i => i.type === 'accessories').map(item => (
                    <img key={item.id} src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🧍 Model Reference</h3>
                {selectedModel ? (
                  <img src={selectedModel.imageUrl} alt="Model" className="w-32 h-40 object-cover rounded mb-4" />
                ) : (
                  <span className="text-gray-400 text-sm">None</span>
                )}
                <h3 className="font-semibold mb-2">🎨 Background Style</h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="backgroundStyle"
                      value="studio"
                      checked={backgroundStyle === 'studio'}
                      onChange={() => setBackgroundStyle('studio')}
                      disabled={!!generatedImage}
                    />
                    Studio
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="backgroundStyle"
                      value="lifestyle"
                      checked={backgroundStyle === 'lifestyle'}
                      onChange={() => setBackgroundStyle('lifestyle')}
                      disabled={!!generatedImage}
                    />
                    Lifestyle
                  </label>
                </div>
              </div>
            </div>
            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-4">{error}</div>}
            <button
              onClick={handleGenerateLook}
              disabled={isGenerating}
              className="w-full mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white font-medium shadow disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</span>
              ) : (
                'Generate Look'
              )}
            </button>
            <button
              onClick={prevStep}
              disabled={isGenerating}
              className="w-full py-2 mt-2 rounded-lg bg-gray-100 text-gray-500"
            >
              <ArrowLeft className="inline w-4 h-4 mr-1" /> Go Back
            </button>
          </div>
        ) : generatedMoodboard ? (
          <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center">🖼️ Studio Moodboard</h2>
            {moodboardGrid && (
              <img src={moodboardGrid} alt="Moodboard" className="w-full max-w-md rounded-lg shadow-lg mb-6" />
            )}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {generatedMoodboard.map((item, idx) => (
                <img
                  key={idx}
                  src={item.url}
                  alt={item.label}
                  className="w-full h-56 object-cover rounded-lg border border-gray-200"
                />
              ))}
            </div>
            <div className="flex gap-4 mt-4">
              {generatedMoodboard.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  download={`moodboard-${item.label.toLowerCase().replace(/\s/g, '-')}.jpg`}
                  className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download {item.label}
                </a>
              ))}
              <button
                onClick={() => { setGeneratedMoodboard(null); setMoodboardGrid(null); setError(null); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={resetAll}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Go Back
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center">🖼️ Generated Look</h2>
            <img
              src={generatedImage}
              alt="Generated Look"
              className="w-full max-w-md rounded-lg shadow-lg mb-6 transition-opacity duration-700 opacity-100"
              style={{ animation: 'fadeIn 1s' }}
            />
            <div className="flex gap-4 mt-4">
              <a
                href={generatedImage}
                download="generated-look.jpg"
                className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download
              </a>
              <button
                onClick={() => { setGeneratedImage(null); setError(null); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={resetAll}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Virtual Try-On Generator</h1>
      <div className="flex justify-center mb-8">
        <div className="flex gap-8">
          {steps.map((s, i) => {
            const isActive = stepIndex === i
            const isCompleted = stepIndex > i
            return (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 text-base font-bold border-2 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isCompleted
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-gray-200 text-gray-400 border-gray-200'
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>{s.label}</span>
                {i < steps.length - 1 && <div className="w-px h-6 bg-gray-300 mx-auto" />}
              </div>
            )
          })}
        </div>
      </div>
      {content}
    </div>
  )
} 