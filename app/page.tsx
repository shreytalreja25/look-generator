import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Zap, Target } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-xxxl">
      {/* Header */}
      <div className="text-center space-y-lg">
        <div className="flex items-center justify-center space-x-sm">
          <span className="text-4xl">✨</span>
          <h1 className="text-page-title text-notion-text-primary">
            Look Generator
          </h1>
        </div>
        <p className="text-body-text text-notion-text-secondary max-w-2xl mx-auto">
          Create stunning fashion looks with AI-powered virtual try-on technology. 
          Upload clothing items, generate outfit layouts, and see them come to life on models.
        </p>
      </div>

      {/* Quick Start */}
      <div className="notion-card">
        <div className="flex items-center space-x-sm mb-lg">
          <span className="text-xl">🚀</span>
          <h2 className="text-section-header text-notion-text-primary">
            Quick Start
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="space-y-md">
            <div className="flex items-center space-x-sm">
              <div className="w-8 h-8 bg-notion-blue text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <h3 className="text-subsection-title text-notion-text-primary">
                Upload Items
              </h3>
            </div>
            <p className="text-body-text text-notion-text-secondary">
              Add clothing items to your digital wardrobe with high-quality images
            </p>
          </div>

          <div className="space-y-md">
            <div className="flex items-center space-x-sm">
              <div className="w-8 h-8 bg-notion-blue text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <h3 className="text-subsection-title text-notion-text-primary">
                Create Layout
              </h3>
            </div>
            <p className="text-body-text text-notion-text-secondary">
              Arrange items into a cohesive outfit layout using our smart composer
            </p>
          </div>

          <div className="space-y-md">
            <div className="flex items-center space-x-sm">
              <div className="w-8 h-8 bg-notion-blue text-white rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <h3 className="text-subsection-title text-notion-text-primary">
                Generate Look
              </h3>
            </div>
            <p className="text-body-text text-notion-text-secondary">
              AI transforms your layout into a realistic try-on with professional models
            </p>
          </div>
        </div>

        <div className="mt-xxl pt-lg border-t border-notion-border">
          <Link 
            href="/generator" 
            className="btn-primary inline-flex items-center space-x-sm"
          >
            <Sparkles size={16} />
            <span>Start Creating</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="notion-block">
        <div className="flex items-center space-x-sm mb-xxl">
          <span className="text-xl">⚡</span>
          <h2 className="text-section-header text-notion-text-primary">
            Key Features
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-xxl">
          <div className="space-y-lg">
            <div className="flex items-start space-x-md">
              <div className="w-10 h-10 bg-notion-green bg-opacity-10 rounded-notion flex items-center justify-center">
                <Zap className="text-notion-green" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-block-title text-notion-text-primary mb-sm">
                  🎨 Smart Outfit Composer
                </h3>
                <p className="text-body-text text-notion-text-secondary">
                  Intelligent layout system that automatically arranges clothing items 
                  for optimal composition and visual appeal.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-md">
              <div className="w-10 h-10 bg-notion-purple bg-opacity-10 rounded-notion flex items-center justify-center">
                <Target className="text-notion-purple" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-block-title text-notion-text-primary mb-sm">
                  🤖 AI-Powered Virtual Try-On
                </h3>
                <p className="text-body-text text-notion-text-secondary">
                  Advanced machine learning models that realistically place clothing 
                  items on professional fashion models.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-lg">
            <div className="flex items-start space-x-md">
              <div className="w-10 h-10 bg-notion-blue bg-opacity-10 rounded-notion flex items-center justify-center">
                <Sparkles className="text-notion-blue" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-block-title text-notion-text-primary mb-sm">
                  📊 Professional Results
                </h3>
                <p className="text-body-text text-notion-text-secondary">
                  High-quality outputs suitable for e-commerce, marketing, 
                  and fashion portfolio presentations.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-md">
              <div className="w-10 h-10 bg-notion-orange bg-opacity-10 rounded-notion flex items-center justify-center">
                <ArrowRight className="text-notion-orange" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-block-title text-notion-text-primary mb-sm">
                  ⚡ Fast Processing
                </h3>
                <p className="text-body-text text-notion-text-secondary">
                  Optimized workflows that generate professional looks in minutes, 
                  not hours. Perfect for rapid prototyping.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="notion-card">
        <div className="flex items-center space-x-sm mb-lg">
          <span className="text-xl">📈</span>
          <h2 className="text-section-header text-notion-text-primary">
            Recent Activity
          </h2>
        </div>
        
        <div className="space-y-md">
          <div className="text-body-text text-notion-text-secondary">
            No recent activity yet. Start creating your first look to see your history here.
          </div>
        </div>
      </div>
    </div>
  )
} 