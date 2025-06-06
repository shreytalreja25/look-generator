'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Shirt, 
  Users, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Sparkles
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  emoji?: string
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    emoji: '🏠',
    icon: <Home size={16} />
  },
  {
    href: '/generator',
    label: 'Look Generator',
    emoji: '✨',
    icon: <Sparkles size={16} />
  },
  {
    href: '/wardrobe',
    label: 'Digital Wardrobe',
    emoji: '👕',
    icon: <Shirt size={16} />
  },
  {
    href: '/models',
    label: 'Model Gallery',
    emoji: '👥',
    icon: <Users size={16} />
  },
  {
    href: '/settings',
    label: 'Settings',
    emoji: '⚙️',
    icon: <Settings size={16} />
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (label: string) => {
    setExpandedSections(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || (href !== '/' && pathname.startsWith(href))
  }

  return (
    <aside className="w-notion-sidebar bg-notion-sidebar-bg border-r border-notion-border flex flex-col h-full">
      {/* Workspace Header */}
      <div className="p-xxl border-b border-notion-border">
        <div className="flex items-center space-x-sm">
          <div className="text-lg">🛍️</div>
          <h1 className="text-block-title text-notion-text-primary font-semibold">
            ShopOS Studio
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-lg">
        <div className="space-y-xs">
          {/* Quick Actions */}
          <div className="mb-xxl">
            <button className="w-full flex items-center space-x-sm p-sm rounded-notion-sm hover:bg-notion-hover-bg text-left text-body-text text-notion-text-secondary transition-colors">
              <Plus size={16} />
              <span>New Look</span>
            </button>
          </div>

          {/* Main Navigation */}
          <div className="space-y-xs">
            <div className="text-caption-text text-notion-text-tertiary font-medium uppercase tracking-wide px-sm py-xs">
              WORKSPACE
            </div>
            
            {navigationItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-sm p-sm rounded-notion-sm transition-colors text-body-text w-full
                    ${isActive(item.href) 
                      ? 'bg-notion-hover-bg text-notion-text-primary border-l-2 border-notion-blue' 
                      : 'text-notion-text-secondary hover:bg-notion-hover-bg'
                    }
                  `}
                >
                  {item.emoji && (
                    <span className="text-base">{item.emoji}</span>
                  )}
                  <span className="flex-1">{item.label}</span>
                  {item.children && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        toggleSection(item.label)
                      }}
                      className="p-xs hover:bg-notion-border rounded"
                    >
                      {expandedSections.includes(item.label) ? (
                        <ChevronDown size={12} />
                      ) : (
                        <ChevronRight size={12} />
                      )}
                    </button>
                  )}
                </Link>

                {/* Nested items */}
                {item.children && expandedSections.includes(item.label) && (
                  <div className="ml-lg mt-xs space-y-xs">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`
                          flex items-center space-x-sm p-sm rounded-notion-sm transition-colors text-body-text
                          ${isActive(child.href)
                            ? 'bg-notion-hover-bg text-notion-text-primary'
                            : 'text-notion-text-secondary hover:bg-notion-hover-bg'
                          }
                        `}
                      >
                        {child.emoji && (
                          <span className="text-sm">{child.emoji}</span>
                        )}
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-lg border-t border-notion-border">
        <div className="text-caption-text text-notion-text-tertiary">
          <div className="flex items-center space-x-sm">
            <div className="w-2 h-2 bg-notion-green rounded-full"></div>
            <span>AI Models Online</span>
          </div>
        </div>
      </div>
    </aside>
  )
} 