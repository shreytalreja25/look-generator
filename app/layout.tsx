import React from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from './components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ShopOS Look Generator',
  description: 'AI-powered virtual try-on and look generation for fashion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-notion-page-bg">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="max-w-notion-page mx-auto p-xxxl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
} 