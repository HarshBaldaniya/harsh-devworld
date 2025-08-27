# 🚀 HarshOS - Developer Workspace

A beautiful macOS-style portfolio and developer workspace built with Next.js, React, and Tailwind CSS. Experience a fully functional desktop environment with multiple applications, dynamic backgrounds, and professional features.

## 🌐 Live Demo

**Visit the live application:** [https://harshos.vercel.app/](https://harshos.vercel.app/)

## ✨ Features

### 🖥️ **Desktop Environment**
- **macOS-style Interface**: Authentic desktop experience with dock, top bar, and window management
- **Dynamic Backgrounds**: 12+ high-quality wallpapers with desktop and lock screen support
- **Context Menu**: Right-click menu with background changer, links, and fullscreen toggle
- **Responsive Design**: Works seamlessly on desktop and tablet devices

### 📱 **Applications**

#### **📝 Notes App**
- **Rich Text Editor**: TipTap-powered editor with formatting capabilities
- **Sidebar Navigation**: Collapsible sidebar with note list and search
- **Tag System**: Organize notes with custom tags
- **Formatting Tools**: Bold, italic, underline, and text alignment
- **Character Limit**: 5000 character limit with professional notifications
- **Local Storage**: Persistent data storage
- **Professional UI**: Clean, modern interface with dark theme

#### **📧 Mail App**
- **Compose Interface**: Professional email composition form
- **Sent Mail View**: Track and view sent emails
- **Real Email Sending**: Integrated with Resend API
- **Rate Limiting**: Daily email limit protection
- **Professional Notifications**: Success/error feedback system
- **Data Persistence**: localStorage for sent emails
- **Dark Theme**: Modern, professional appearance

#### **🔍 Finder App**
- **File Browser**: macOS-style file explorer
- **Folder Navigation**: Browse through different directories
- **File Operations**: View, open, and manage files
- **Professional UI**: Authentic Finder experience

#### **🌐 Chrome App**
- **Web Browser**: Functional browser interface
- **Navigation Controls**: Back, forward, refresh, and home
- **URL Bar**: Address input functionality
- **Tab Management**: Multiple tab support
- **Professional Design**: Chrome-like interface

### 🎨 **UI/UX Features**

#### **Window Management**
- **Smooth Animations**: Ultra-smooth minimize/maximize transitions
- **Drag & Drop**: Move windows around the desktop
- **Resize Windows**: Adjust window sizes
- **Close/Minimize/Maximize**: Full window control
- **Professional Effects**: Multi-directional slides, layered effects, custom easing

#### **Dock System**
- **Application Icons**: Beautiful, custom-designed app icons
- **Hover Effects**: Smooth animations on hover
- **App Launching**: Click to open applications
- **Professional Design**: macOS-style dock appearance

#### **Top Bar**
- **System Information**: Time, date, and system status
- **Menu Integration**: macOS-style menu bar
- **Professional Layout**: Clean, organized interface

### 🎯 **Background System**

#### **Dynamic Backgrounds**
- **12 High-Quality Images**: Curated selection from Unsplash
- **Desktop & Lock Screen**: Separate background management
- **Smooth Transitions**: 1-second fade transitions
- **Context Menu Access**: Right-click to change backgrounds
- **Success Notifications**: Professional feedback system

#### **Background Categories**
- **Nature**: Landscapes, mountains, forests
- **Abstract**: Geometric patterns, gradients
- **Minimal**: Clean, simple designs
- **Professional**: Office, workspace themes

### 🔧 **Technical Features**

#### **Performance**
- **Next.js 14**: Latest React framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Optimized Images**: Next.js Image optimization

#### **State Management**
- **React Context**: Global state for backgrounds
- **localStorage**: Persistent data storage
- **useState/useEffect**: Component state management
- **Custom Hooks**: Reusable logic

#### **API Integration**
- **Resend API**: Email sending functionality
- **Rate Limiting**: Daily email limits
- **Error Handling**: Comprehensive error management
- **Loading States**: Professional loading indicators

### 🎨 **Design System**

#### **Color Palette**
- **Primary**: Blue (#3B82F6)
- **Secondary**: Light Blue (#60A5FA)
- **Background**: Dark (#0F172A, #1F2937)
- **Text**: White/Light Gray
- **Accent**: Emerald (#10B981), Rose (#F43F5E)

#### **Typography**
- **System Fonts**: macOS-style typography
- **Responsive**: Scales across devices
- **Professional**: Clean, readable text

#### **Animations**
- **Framer Motion**: Smooth transitions
- **Custom Easing**: Professional animation curves
- **Performance**: Optimized for 60fps
- **Accessibility**: Reduced motion support

### 🚀 **Getting Started**

#### **Prerequisites**
- Node.js 18+ 
- npm or yarn

#### **Installation**
```bash
# Clone the repository
git clone https://github.com/yourusername/harsh-devworld.git

# Navigate to project directory
cd harsh-devworld

# Install dependencies
npm install

# Run development server
npm run dev
```

#### **Environment Variables**
Create a `.env.local` file:
```env
RESEND_API_KEY=your_resend_api_key_here
```

#### **Build for Production**
```bash
# Build the application
npm run build

# Start production server
npm start
```

### 📁 **Project Structure**
```
harsh-devworld/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── app-window/     # Application windows
│   │   ├── topbar/         # Top bar components
│   │   ├── loader/         # Loading components
│   │   ├── Dock.tsx        # Dock component
│   │   ├── HomeScreen.tsx  # Desktop component
│   │   ├── LockScreen.tsx  # Lock screen
│   │   └── MacBackground.tsx # Background component
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utility libraries
│   └── constants/          # App constants
├── public/                 # Static assets
│   ├── images/            # Image assets
│   ├── sounds/            # Audio files
│   └── favicon.svg        # App favicon
└── package.json           # Dependencies and scripts
```

### 🛠️ **Technologies Used**

#### **Frontend**
- **Next.js 14**: React framework
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations

#### **Backend**
- **Next.js API Routes**: Server-side functionality
- **Resend**: Email service
- **localStorage**: Client-side storage

#### **Development**
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Vercel**: Deployment platform

### 🎯 **Key Features Summary**

#### **✅ Completed Features**
- [x] macOS-style desktop interface
- [x] Multiple functional applications
- [x] Dynamic background system
- [x] Professional animations
- [x] Email functionality
- [x] Rich text editing
- [x] File browser
- [x] Web browser interface
- [x] Responsive design
- [x] Professional notifications
- [x] Data persistence
- [x] Context menus
- [x] Window management
- [x] Dock system
- [x] Top bar integration

#### **🚀 Performance Features**
- [x] Optimized images
- [x] Smooth animations
- [x] Fast loading
- [x] Responsive design
- [x] SEO optimized
- [x] Accessibility support

### 🌟 **Why HarshOS?**

#### **Professional Portfolio**
- **Showcase Skills**: Demonstrates React, Next.js, and UI/UX skills
- **Interactive Experience**: Engaging user interface
- **Modern Design**: Contemporary, professional appearance
- **Technical Excellence**: High-quality code and performance

#### **Developer Workspace**
- **Functional Apps**: Real applications with practical use
- **Professional Tools**: Email, notes, file management
- **Customizable**: Dynamic backgrounds and themes
- **Extensible**: Easy to add new features

**Built with ❤️ by Harsh Baldaniya**

Experience the future of developer portfolios with HarshOS - where creativity meets functionality in a beautiful macOS-inspired workspace.
