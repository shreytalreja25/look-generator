# ShopOS Look Generator

AI-powered virtual try-on and look generation system for fashion retailers. Create stunning outfit compositions by uploading clothing items, arranging them into layouts, and generating realistic model try-ons using advanced AI.

## ✨ Features

- **📤 Smart Upload System**: Drag-and-drop clothing item upload with automatic categorization
- **🎨 Visual Layout Composer**: Intuitive interface for arranging clothing items into outfit layouts
- **🤖 AI Virtual Try-On**: Generate realistic model photos wearing your designed outfits
- **👕 Digital Wardrobe**: Organize and manage your clothing inventory
- **🎯 Professional Results**: High-quality outputs suitable for e-commerce and marketing
- **⚡ Fast Processing**: Optimized workflows for rapid prototyping

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Replicate API account and token

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd look-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Replicate API Setup

1. Sign up at [Replicate](https://replicate.com)
2. Go to [Account Settings](https://replicate.com/account/api-tokens)
3. Create a new API token
4. Add the token to your `.env.local` file

### Supported AI Models

The application currently supports:
- Stable Diffusion for general image generation
- Custom virtual try-on models (configurable)
- Face enhancement models for better results

## 📋 How to Use

### Step 1: Upload Clothing Items
- Drag and drop clothing images or click to browse
- Supported formats: JPG, PNG, WebP (max 10MB)
- Categorize items as tops, bottoms, shoes, or accessories
- Edit item names and descriptions

### Step 2: Create Layout
- Arrange clothing items in the visual composer
- Resize and position items for optimal composition
- Preview your outfit layout before generation

### Step 3: Generate Virtual Try-On
- Choose model type (female, male, diverse)
- Select style (casual, formal, streetwear, bohemian)
- Pick background (studio, outdoor, minimal, lifestyle)
- Generate realistic model photos with your outfit

## 🏗️ Architecture

```
app/
├── components/           # Reusable UI components
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── ClothingUploader.tsx # File upload component
│   ├── LayoutComposer.tsx   # Visual layout editor
│   └── AIGenerator.tsx      # Virtual try-on generator
├── api/
│   └── generate/
│       └── route.ts     # Replicate API integration
├── generator/           # Main look generator page
├── layout.tsx          # App layout with sidebar
└── page.tsx            # Homepage

lib/
├── replicate.ts        # Replicate API client
└── image-utils.ts      # Image processing utilities
```

## 🎨 Design System

The application follows **Notion-style design principles**:

- **90% Grayscale Foundation**: Clean, minimal interface prioritizing content
- **Strategic Color Usage**: Color only for critical actions and status indicators  
- **Typography Hierarchy**: Clear information structure through font weights
- **Generous Spacing**: Notion's signature breathing room and organization
- **Functional Emojis**: Meaningful icons with proper 8px spacing

### Color Palette

```css
/* Foundation (90% of design) */
--notion-white: #FFFFFF
--notion-page-bg: #FAFAFA
--notion-sidebar-bg: #F7F7F5
--notion-block-bg: #F6F6F6
--notion-border: #E8E8E8

/* Strategic Colors (10% of design) */
--notion-blue: #2383E2    /* Primary actions */
--notion-green: #0F7B6C   /* Success states */
--notion-red: #E03E3E     /* Errors, warnings */
```

## 🔗 API Reference

### Generate Virtual Try-On

**POST** `/api/generate`

```json
{
  "layoutImageBase64": "data:image/png;base64,iVBORw0KGgoAAAA...",
  "options": {
    "modelType": "diverse",
    "style": "casual", 
    "background": "studio",
    "pose": "front"
  }
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://replicate.delivery/pbxt/...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🛠️ Development

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom Notion design system
- **AI Integration**: Replicate API
- **Image Processing**: Browser-based Canvas API
- **Icons**: Lucide React

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- 📧 Email: support@shopos.com
- 📖 Documentation: [docs.shopos.com](https://docs.shopos.com)
- 💬 Discord: [ShopOS Community](https://discord.gg/shopos)

## 🎯 Roadmap

- [ ] Advanced layout templates and presets
- [ ] Batch processing for multiple outfits
- [ ] Integration with e-commerce platforms
- [ ] Mobile app for on-the-go styling
- [ ] Collaborative styling features
- [ ] Advanced AI model fine-tuning

---

Made with ❤️ by the ShopOS team 