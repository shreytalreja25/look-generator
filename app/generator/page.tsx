'use client'

import { useState, useRef, useEffect } from 'react'
import { ClothingItem, ModelReference } from '../../lib/image-utils'
import ClothingUploader from '../components/ClothingUploader'
import { Loader2, Download, RotateCcw, ArrowLeft } from 'lucide-react'
import JSZip from 'jszip'

const steps = [
  { label: 'Upload Garments' },
  { label: 'Upload Accessories' },
  { label: 'Select Model' },
  { label: 'Review & Generate' },
]

const LIFESTYLE_CAMERA_ANGLES = [
  {
    label: 'Motion Blur',
    value: 'motion_blur',
    json: {
      "prompt": "Transform the subject's environment to create a dynamic motion blur effect. Keep the subject sharp and in focus while adding horizontal motion blur to the background and surrounding elements. Maintain the subject's original pose, facial features, clothing, and body position exactly as they appear in the input image.",
      "effect_transformation": {
        "blur_type": "horizontal motion blur",
        "subject_focus": "keep main subject completely sharp and clear",
        "background_blur": "strong horizontal streaking motion blur",
        "surrounding_elements": "add ghostly motion trails to people or objects in background",
        "blur_intensity": "medium to strong blur suggesting movement",
        "blur_direction": "primarily horizontal with some diagonal elements"
      },
      "preserve_elements": {
        "subject_appearance": "exact same face, clothing, pose, and body position",
        "subject_lighting": "maintain original lighting on the main subject",
        "subject_sharpness": "keep subject completely in focus",
        "composition": "same framing and subject placement"
      },
      "output_requirements": {
        "dynamic_feel": true,
        "speed_suggestion": "convey sense of movement and energy",
        "focus_contrast": "sharp subject against blurred environment",
        "realistic_motion_blur": "natural-looking motion streaks"
      }
    }
  },
  {
    label: 'Low Angle',
    value: 'low_angle',
    json: {
      "prompt": "Reframe the image from a low angle perspective, shooting upward at the subject. Maintain the subject's exact appearance, clothing, and facial features while changing only the camera angle to create a powerful, dramatic low-angle view.",
      "camera_transformation": {
        "angle": "low angle looking upward at subject",
        "perspective": "ground-level or below eye-level viewpoint",
        "subject_positioning": "subject appears above camera level",
        "dramatic_effect": "emphasize subject's presence and stature",
        "horizon_line": "place horizon low in frame or below subject"
      },
      "preserve_elements": {
        "subject_identity": "exact same person, face, and features",
        "clothing": "identical outfit and styling",
        "lighting_quality": "maintain similar lighting conditions",
        "subject_pose": "same body position and gesture"
      },
      "output_requirements": {
        "powerful_composition": true,
        "upward_perspective": "clear low-angle viewpoint",
        "dramatic_impact": "subject appears commanding and prominent",
        "realistic_proportions": "natural low-angle perspective distortion"
      }
    }
  },
  {
    label: 'Eye Level',
    value: 'eye_level',
    json: {
      "prompt": "Reframe the image at eye level, positioning the camera at the same height as the subject's eyes. Maintain the subject's exact appearance, clothing, and features while creating a natural, straight-on perspective that feels balanced and approachable.",
      "camera_transformation": {
        "angle": "eye level, horizontal camera position",
        "perspective": "camera at same height as subject's eye line",
        "viewpoint": "straight-on, neither looking up nor down",
        "balance": "equal visual weight and natural proportions",
        "horizon_placement": "align with subject's eye level"
      },
      "preserve_elements": {
        "subject_identity": "exact same person and facial features",
        "clothing": "identical outfit and styling",
        "lighting": "maintain original lighting conditions",
        "pose": "same body position and stance"
      },
      "output_requirements": {
        "natural_perspective": true,
        "balanced_composition": "harmonious and approachable feel",
        "neutral_angle": "no dramatic perspective distortion",
        "realistic_proportions": "natural human proportions maintained"
      }
    }
  },
  {
    label: 'Framed Shot',
    value: 'framed_shot',
    json: {
      "prompt": "Create a framed composition using architectural elements, natural features, or environmental objects to frame the subject. Maintain the subject's exact appearance, clothing, and features while adding framing elements that draw focus to the subject within the scene.",
      "framing_transformation": {
        "frame_elements": "architectural arches, doorways, windows, or natural elements",
        "frame_placement": "surround or partially surround the subject",
        "depth_layers": "create foreground framing with subject in middle ground",
        "focus_direction": "frame elements guide eye toward subject",
        "frame_style": "natural, architectural, or environmental framing"
      },
      "preserve_elements": {
        "subject_identity": "exact same person and facial features",
        "clothing": "identical outfit and styling",
        "subject_pose": "same body position and stance",
        "subject_lighting": "maintain lighting on the main subject"
      },
      "output_requirements": {
        "compositional_depth": true,
        "clear_framing": "obvious framing elements around subject",
        "subject_prominence": "subject remains the clear focal point",
        "natural_integration": "framing elements feel organic to the scene"
      }
    }
  }
]
const LIFESTYLE_LIGHTING = [
  {
    label: 'Golden Hour Sunset Lighting',
    value: 'golden_hour',
    json: {
      "prompt": "Transform the lighting to golden hour sunset conditions. Keep the subject's face, pose, hairstyle, body, and clothing exactly the same. Only change the lighting and atmosphere.",
      "lighting_transfer": {
        "target_lighting": {
          "type": "golden hour sunset lighting",
          "color_temperature": "warm golden orange (2500K-3000K)",
          "direction": "soft directional light from the side",
          "intensity": "medium with gentle shadows",
          "ambient_light": "warm golden glow",
          "shadow_quality": "soft and elongated",
          "highlights": "warm golden on fabric texture and skin",
          "background_lighting": "warm atmospheric haze"
        },
        "preserve_elements": {
          "subject_identity": true,
          "pose": true,
          "clothing": "exact same garments with same fit and texture",
          "facial_expression": true,
          "body_proportions": true
        }
      },
      "output_requirements": {
        "lighting_only_change": true,
        "realistic_light_interaction": "golden light reflecting on clothing fabric",
        "maintain_original_colors": "all clothing colors with warm golden highlights",
        "atmospheric_consistency": true
      }
    }
  },
  {
    label: 'Cool Blue Twilight Lighting',
    value: 'cool_blue',
    json: {
      "prompt": "Transform the lighting to cool blue evening twilight conditions. Keep the subject's face, pose, hairstyle, body, and clothing exactly the same. Only change the lighting and color temperature.",
      "lighting_transfer": {
        "target_lighting": {
          "type": "cool blue twilight lighting",
          "color_temperature": "cool blue (5500K-7000K)",
          "direction": "soft even lighting from above",
          "intensity": "medium with subtle shadows",
          "ambient_light": "cool blue atmospheric light",
          "shadow_quality": "soft and cool-toned",
          "highlights": "cool blue highlights on fabric and skin",
          "background_lighting": "dusky blue evening atmosphere"
        },
        "preserve_elements": {
          "subject_identity": true,
          "pose": true,
          "clothing": "exact same garments with same fit and texture",
          "facial_expression": true,
          "body_proportions": true
        }
      },
      "output_requirements": {
        "lighting_only_change": true,
        "realistic_light_interaction": "cool blue light reflecting on clothing fabric",
        "maintain_original_colors": "all clothing colors with cool blue highlights",
        "atmospheric_consistency": true
      }
    }
  },
  {
    label: 'Dramatic Studio Lighting',
    value: 'dramatic_studio',
    json: {
      "prompt": "Transform the lighting to dramatic studio lighting with strong directional shadows. Keep the subject's face, pose, hairstyle, body, and clothing exactly the same. Only change the lighting setup.",
      "lighting_transfer": {
        "target_lighting": {
          "type": "dramatic studio lighting",
          "color_temperature": "neutral white (4000K-5000K)",
          "direction": "strong directional light from 45-degree angle",
          "intensity": "high contrast with deep shadows",
          "ambient_light": "minimal fill light",
          "shadow_quality": "sharp and defined",
          "highlights": "bright highlights on fabric texture",
          "background_lighting": "gradient from light to dark"
        },
        "preserve_elements": {
          "subject_identity": true,
          "pose": true,
          "clothing": "exact same garments with same fit and texture",
          "facial_expression": true,
          "body_proportions": true
        }
      },
      "output_requirements": {
        "lighting_only_change": true,
        "realistic_light_interaction": "dramatic shadows and highlights on clothing",
        "maintain_original_colors": "all clothing colors with enhanced contrast",
        "professional_studio_quality": true
      }
    }
  },
  {
    label: 'Soft Natural Window Lighting',
    value: 'soft_natural',
    json: {
      "prompt": "Transform the lighting to soft natural window lighting. Keep the subject's face, pose, hairstyle, body, and clothing exactly the same. Only change to gentle indoor natural light.",
      "lighting_transfer": {
        "target_lighting": {
          "type": "soft natural window lighting",
          "color_temperature": "daylight balanced (5000K-6000K)",
          "direction": "soft diffused light from the side",
          "intensity": "gentle and even",
          "ambient_light": "soft reflected light",
          "shadow_quality": "very soft and gradual",
          "highlights": "gentle natural highlights",
          "background_lighting": "soft indoor ambient light"
        },
        "preserve_elements": {
          "subject_identity": true,
          "pose": true,
          "clothing": "exact same garments with same fit and texture",
          "facial_expression": true,
          "body_proportions": true
        }
      },
      "output_requirements": {
        "lighting_only_change": true,
        "realistic_light_interaction": "soft natural light on clothing fabric",
        "maintain_original_colors": "all clothing colors with natural daylight rendering",
        "indoor_lighting_quality": true
      }
    }
  },
  {
    label: 'Moody Low-Key Lighting',
    value: 'moody_low_key',
    json: {
      "prompt": "Transform the lighting to moody low-key dramatic lighting. Keep the subject's face, pose, hairstyle, body, and clothing exactly the same. Only change to dark atmospheric lighting.",
      "lighting_transfer": {
        "target_lighting": {
          "type": "moody low-key lighting",
          "color_temperature": "slightly warm (3500K-4000K)",
          "direction": "dramatic rim lighting from behind/side",
          "intensity": "low overall with selective bright spots",
          "ambient_light": "very dark with minimal fill",
          "shadow_quality": "deep shadows with mystery",
          "highlights": "selective bright rim lighting on edges",
          "background_lighting": "dark moody atmosphere"
        },
        "preserve_elements": {
          "subject_identity": true,
          "pose": true,
          "clothing": "exact same garments with same fit and texture",
          "facial_expression": true,
          "body_proportions": true
        }
      },
      "output_requirements": {
        "lighting_only_change": true,
        "realistic_light_interaction": "dramatic rim lighting on clothing edges",
        "maintain_original_colors": "all clothing colors visible in selective lighting",
        "cinematic_mood": true
      }
    }
  }
]

export default function GeneratorPage() {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])
  const [selectedModel, setSelectedModel] = useState<ModelReference | null>(null)
  const [backgroundStyle, setBackgroundStyle] = useState<'studio' | 'lifestyle'>('studio')
  const [stepIndex, setStepIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generatedMoodboard, setGeneratedMoodboard] = useState<null | { label: string; url: string }[]>(null)
  const [error, setError] = useState<string | null>(null)
  const [nightImage, setNightImage] = useState<string | null>(null)
  const [selectedEditIndex, setSelectedEditIndex] = useState<number | null>(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedFlags, setEditedFlags] = useState([false, false, false, false])
  const [selectedLifestyleIndex, setSelectedLifestyleIndex] = useState<number | null>(null)
  const [lifestyleEditType, setLifestyleEditType] = useState<string>('')
  const [lifestyleEditOption, setLifestyleEditOption] = useState<string>('')
  const [lifestyleEditPrompt, setLifestyleEditPrompt] = useState('')
  const [isLifestyleEditing, setIsLifestyleEditing] = useState(false)
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false)

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
    setNightImage(null)
    setSelectedEditIndex(null)
    setEditPrompt('')
    setIsEditing(false)
    setEditedFlags([false, false, false, false])
    setSelectedLifestyleIndex(null)
    setLifestyleEditType('')
    setLifestyleEditOption('')
    setLifestyleEditPrompt('')
    setIsLifestyleEditing(false)
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
    setNightImage(null)
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
        setGeneratedImage(null)
        setNightImage(null)
      } else {
        setGeneratedImage(data.imageUrl)
        setNightImage(data.nightImageUrl || null)
        setGeneratedMoodboard(null)
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
      <div className="max-w-4xl mx-auto w-full">
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
      <div className="max-w-4xl mx-auto w-full">
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
      <div className="max-w-4xl mx-auto w-full">
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
      <div className="max-w-5xl mx-auto w-full">
        {!generatedImage && !generatedMoodboard ? (
          <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-4xl animate-fade-in">
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
          <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-6xl flex flex-col items-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center">🖼️ Studio Moodboard</h2>
            <div className="flex flex-row gap-8 w-full justify-center mb-6 overflow-x-auto max-w-full">
              {generatedMoodboard.map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center flex-grow min-w-0">
                  <img
                    src={item.url}
                    alt={item.label}
                    className={`w-full max-w-[22rem] object-contain bg-white rounded-lg shadow-lg mb-2 border ${selectedEditIndex === idx ? 'border-blue-500 border-4' : 'border-gray-200'} cursor-pointer`}
                    style={{ animation: 'fadeIn 1s' }}
                    onClick={() => setSelectedEditIndex(idx)}
                  />
                  {editedFlags[idx] && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded transition-opacity duration-500 opacity-100 animate-fade-out">Edited</span>
                  )}
                  <span className="text-base font-medium text-gray-700 mt-1">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-2 mb-4">
              {backgroundStyle === 'lifestyle' ? (
                <>
                  <div className="flex flex-row gap-4 mb-2">
                    <button
                      className={`px-4 py-2 rounded ${lifestyleEditType === 'camera' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => { setLifestyleEditType('camera'); setLifestyleEditOption(''); setLifestyleEditPrompt(''); }}
                    >
                      Edit Camera Angle
                    </button>
                    <button
                      className={`px-4 py-2 rounded ${lifestyleEditType === 'lighting' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => { setLifestyleEditType('lighting'); setLifestyleEditOption(''); setLifestyleEditPrompt(''); }}
                    >
                      Edit Lighting
                    </button>
                    <button
                      className={`px-4 py-2 rounded ${lifestyleEditType === 'prompt' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => { setLifestyleEditType('prompt'); setLifestyleEditOption(''); setLifestyleEditPrompt(''); }}
                    >
                      Edit with Prompt
                    </button>
                  </div>
                  {lifestyleEditType === 'camera' && (
                    <select
                      className="w-80 px-3 py-2 border rounded mb-2"
                      value={lifestyleEditOption}
                      onChange={e => setLifestyleEditOption(e.target.value)}
                    >
                      <option value="">Select Camera Angle</option>
                      {LIFESTYLE_CAMERA_ANGLES.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                  {lifestyleEditType === 'lighting' && (
                    <select
                      className="w-80 px-3 py-2 border rounded mb-2"
                      value={lifestyleEditOption}
                      onChange={e => setLifestyleEditOption(e.target.value)}
                    >
                      <option value="">Select Lighting</option>
                      {LIFESTYLE_LIGHTING.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                  {lifestyleEditType === 'prompt' && (
                    <input
                      type="text"
                      className="w-80 px-3 py-2 border rounded mb-2"
                      placeholder="Describe a change to apply (e.g. 'make hair curly', 'add nose ring')"
                      value={lifestyleEditPrompt}
                      onChange={e => setLifestyleEditPrompt(e.target.value)}
                    />
                  )}
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    disabled={selectedEditIndex === null || isLifestyleEditing ||
                      (lifestyleEditType === 'camera' && !lifestyleEditOption) ||
                      (lifestyleEditType === 'lighting' && !lifestyleEditOption) ||
                      (lifestyleEditType === 'prompt' && !lifestyleEditPrompt.trim())}
                    onClick={async () => {
                      if (selectedEditIndex === null) return;
                      setIsLifestyleEditing(true);
                      let editPayload: any = { imageUrl: generatedMoodboard[selectedEditIndex].url };
                      if (lifestyleEditType === 'camera') {
                        const json = LIFESTYLE_CAMERA_ANGLES.find(opt => opt.value === lifestyleEditOption)?.json;
                        editPayload = { ...editPayload, editJson: json };
                      } else if (lifestyleEditType === 'lighting') {
                        const json = LIFESTYLE_LIGHTING.find(opt => opt.value === lifestyleEditOption)?.json;
                        editPayload = { ...editPayload, editJson: json };
                      } else if (lifestyleEditType === 'prompt') {
                        editPayload = { ...editPayload, editPrompt: lifestyleEditPrompt };
                      }
                      try {
                        const res = await fetch('/api/edit-image', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(editPayload)
                        });
                        if (!res.ok) throw new Error('Failed to edit image');
                        const data = await res.json();
                        // Replace the selected image in the moodboard
                        const newMoodboard = [...generatedMoodboard];
                        newMoodboard[selectedEditIndex] = { ...newMoodboard[selectedEditIndex], url: data.editedUrl };
                        setGeneratedMoodboard(newMoodboard);
                        // Mark as edited
                        const newFlags = [...editedFlags];
                        newFlags[selectedEditIndex] = true;
                        setEditedFlags(newFlags);
                        // Clear selection
                        setLifestyleEditType('');
                        setLifestyleEditOption('');
                        setLifestyleEditPrompt('');
                        setSelectedEditIndex(null);
                        setTimeout(() => {
                          setEditedFlags(flags => {
                            const updated = [...flags];
                            updated[selectedEditIndex] = false;
                            return updated;
                          });
                        }, 1000);
                      } catch (err) {
                        alert('Failed to edit image');
                      } finally {
                        setIsLifestyleEditing(false);
                      }
                    }}
                  >
                    {isLifestyleEditing ? 'Applying...' : 'Apply Change'}
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    className="w-96 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Describe a change to apply (e.g. 'make hair curly', 'add nose ring')"
                    value={editPrompt}
                    onChange={e => setEditPrompt(e.target.value)}
                    disabled={isEditing}
                  />
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    disabled={selectedEditIndex === null || !editPrompt.trim() || isEditing}
                    onClick={async () => {
                      if (selectedEditIndex === null || !editPrompt.trim()) return
                      setIsEditing(true)
                      try {
                        const res = await fetch('/api/edit-image', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            imageUrl: generatedMoodboard[selectedEditIndex].url,
                            editPrompt
                          })
                        })
                        if (!res.ok) throw new Error('Failed to edit image')
                        const data = await res.json()
                        // Replace the selected image in the moodboard
                        const newMoodboard = [...generatedMoodboard]
                        newMoodboard[selectedEditIndex] = { ...newMoodboard[selectedEditIndex], url: data.editedUrl }
                        setGeneratedMoodboard(newMoodboard)
                        // Mark as edited
                        const newFlags = [...editedFlags]
                        newFlags[selectedEditIndex] = true
                        setEditedFlags(newFlags)
                        // Clear prompt and selection
                        setEditPrompt('')
                        setSelectedEditIndex(null)
                        // Add a timer to clear the edited flag after 1 second
                        setTimeout(() => {
                          setEditedFlags(flags => {
                            const updated = [...flags]
                            updated[selectedEditIndex] = false
                            return updated
                          })
                        }, 1000)
                      } catch (err) {
                        alert('Failed to edit image')
                      } finally {
                        setIsEditing(false)
                      }
                    }}
                  >
                    {isEditing ? 'Applying...' : 'Apply Change'}
                  </button>
                </>
              )}
            </div>
            <div className="flex flex-row gap-4 mt-4 items-center">
              <div className="relative">
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg rounded-lg flex items-center gap-2 transition-colors duration-150"
                  onClick={() => setDownloadDropdownOpen((open) => !open)}
                >
                  <Download className="w-5 h-5" /> Select & Download <span className="ml-2">▼</span>
                </button>
                {downloadDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                    {generatedMoodboard.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.url}
                        download={`moodboard-${item.label.toLowerCase().replace(/\s/g, '-')}.jpg`}
                        className="block px-4 py-2 text-gray-800 hover:bg-blue-100 cursor-pointer"
                        onClick={() => setDownloadDropdownOpen(false)}
                      >
                        Download {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg rounded-lg flex items-center gap-2 transition-colors duration-150"
                onClick={async () => {
                  if (!generatedMoodboard || generatedMoodboard.length === 0) return;
                  try {
                    const zip = new JSZip();
                    const folder = zip.folder('StudioMoodboard') || zip;
                    await Promise.all(
                      generatedMoodboard.map(async (item, idx) => {
                        const response = await fetch(item.url);
                        const blob = await response.blob();
                        folder.file(`moodboard-${item.label.toLowerCase().replace(/\s/g, '-')}.jpg`, blob);
                      })
                    );
                    const content = await zip.generateAsync({ type: 'blob' });
                    const url = URL.createObjectURL(content);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'StudioMoodboard.zip';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }, 100);
                  } catch (err) {
                    // fallback: trigger 4 downloads in sequence
                    generatedMoodboard.forEach((item, idx) => {
                      const a = document.createElement('a');
                      a.href = item.url;
                      a.download = `moodboard-${item.label.toLowerCase().replace(/\s/g, '-')}.jpg`;
                      document.body.appendChild(a);
                      a.click();
                      setTimeout(() => document.body.removeChild(a), 100);
                    });
                  }
                }}
              >
                <span className="material-icons">folder_zip</span> Download All
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center">🖼️ Generated Look</h2>
            {backgroundStyle === 'lifestyle' && generatedImage && nightImage ? (
              <div className="flex flex-col md:flex-row gap-8 w-full justify-center mb-6">
                <div className="flex flex-col items-center">
                  <img
                    src={generatedImage}
                    alt="Lifestyle Day Look"
                    className="w-72 h-96 object-cover rounded-lg shadow-lg mb-2 border border-gray-200"
                    style={{ animation: 'fadeIn 1s' }}
                  />
                  <span className="text-base font-medium text-gray-700 mt-1">Day Lighting</span>
                </div>
                <div className="flex flex-col items-center">
                  <img
                    src={nightImage}
                    alt="Lifestyle Night Look"
                    className="w-72 h-96 object-cover rounded-lg shadow-lg mb-2 border border-gray-200"
                    style={{ animation: 'fadeIn 1s' }}
                  />
                  <span className="text-base font-medium text-gray-700 mt-1">Night Lighting</span>
                </div>
              </div>
            ) : (
              <img
                src={generatedImage}
                alt="Generated Look"
                className="w-full max-w-md rounded-lg shadow-lg mb-6 transition-opacity duration-700 opacity-100"
                style={{ animation: 'fadeIn 1s' }}
              />
            )}
            <div className="flex gap-4 mt-4">
              {backgroundStyle === 'lifestyle' && generatedImage && nightImage ? (
                <>
                  <a
                    href={generatedImage}
                    download="lifestyle-day-look.jpg"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg rounded-lg flex items-center gap-2 transition-colors duration-150"
                  >
                    <Download className="w-4 h-4" /> Download Day
                  </a>
                  <a
                    href={nightImage}
                    download="lifestyle-night-look.jpg"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg rounded-lg flex items-center gap-2 transition-colors duration-150"
                  >
                    <Download className="w-4 h-4" /> Download Night
                  </a>
                </>
              ) : (
                <a
                  href={generatedImage}
                  download="generated-look.jpg"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg rounded-lg flex items-center gap-2 transition-colors duration-150"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              )}
              <button
                onClick={() => { setGeneratedImage(null); setNightImage(null); setError(null); }}
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
    <div className="max-w-screen-xl mx-auto px-4 py-8">
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