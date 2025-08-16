"use client";

import { useState, useEffect } from "react";
import MacBackground from "./MacBackground";
import { motion } from "framer-motion";
import { LuImage, LuSettings, LuX, LuExternalLink, LuGithub, LuLinkedin, LuMaximize2, LuMinimize2, LuGlobe, LuCheck } from "react-icons/lu";
import { useBackground } from "@/contexts/BackgroundContext";

// Background images data
const BACKGROUND_IMAGES = [
  {
    id: "mac-wallpaper-1",
    name: "Mountain Lake",
    url: "/mac-wallpaper-1.jpg",
    category: "nature"
  },
  {
    id: "mac-wallpaper-2", 
    name: "Abstract Waves",
    url: "/mac-wallpaper-2.jpg",
    category: "abstract"
  },
  {
    id: "lock-screen",
    name: "Lock Screen",
    url: "/lock-screen.jpg",
    category: "lock"
  },
  {
    id: "nature-1",
    name: "Tropical Beach",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop",
    category: "nature"
  },
  {
    id: "nature-2",
    name: "Cherry Blossoms",
    url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&h=1080&fit=crop",
    category: "nature"
  },
  {
    id: "nature-3",
    name: "Forest Path",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop",
    category: "nature"
  },
  {
    id: "abstract-1",
    name: "Neon Lights",
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop",
    category: "abstract"
  },
  {
    id: "abstract-2",
    name: "Geometric Shapes",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop",
    category: "abstract"
  },
  {
    id: "abstract-3",
    name: "Digital Art",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&h=1080&fit=crop",
    category: "abstract"
  },
  {
    id: "gradient-1",
    name: "Sunset Sky",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&sat=25",
    category: "gradient"
  },
  {
    id: "gradient-2",
    name: "Ocean Waves",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop&sat=20",
    category: "gradient"
  },
  {
    id: "gradient-3",
    name: "Purple Dream",
    url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&h=1080&fit=crop",
    category: "gradient"
  },
  {
    id: "lock-1",
    name: "Minimal Dark",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&sat=-40",
    category: "lock"
  }
];

export default function HomeScreen() {
  const { currentBackground, setCurrentBackground, setCurrentLockScreen } = useBackground();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showImageChanger, setShowImageChanger] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isChangingLockScreen, setIsChangingLockScreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Handle right click with adaptive positioning
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const menuWidth = 180; // Approximate menu width
    const menuHeight = 280; // Approximate menu height
    const padding = 20; // Padding from screen edges
    
    let x = e.clientX;
    let y = e.clientY;
    
    // Check if menu would go outside right edge
    if (x + menuWidth/2 > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth/2 - padding;
    }
    
    // Check if menu would go outside left edge
    if (x - menuWidth/2 < padding) {
      x = menuWidth/2 + padding;
    }
    
    // Check if menu would go outside bottom edge
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }
    
    // Check if menu would go outside top edge
    if (y - menuHeight < padding) {
      y = menuHeight + padding;
    }
    
    setContextMenuPosition({ x, y });
    setShowContextMenu(true);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    setShowContextMenu(false);
  };

  // Handle external links
  const openLink = (url: string) => {
    window.open(url, '_blank');
    setShowContextMenu(false);
  };

  // Handle background change with success notification
  const handleBackgroundChange = (imageUrl: string, imageName: string) => {
    if (isChangingLockScreen) {
      setCurrentLockScreen(imageUrl);
      setSuccessMessage(`Lock screen changed to "${imageName}"`);
    } else {
      setCurrentBackground(imageUrl);
      setSuccessMessage(`Desktop background changed to "${imageName}"`);
    }
    setShowImageChanger(false);
    setShowSuccessNotification(true);
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 3000);
  };

  const filteredImages = selectedCategory === "all" 
    ? BACKGROUND_IMAGES 
    : BACKGROUND_IMAGES.filter(img => img.category === selectedCategory);

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      onContextMenu={handleContextMenu}
    >
      {/* Background */}
      <MacBackground backgroundImage={currentBackground} />

      {/* Context Menu */}
      {showContextMenu && (
        <div 
          className="fixed z-[9999] bg-zinc-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-zinc-700/50 py-1 min-w-[180px]"
          style={{ 
            left: contextMenuPosition.x, 
            top: contextMenuPosition.y,
            transform: 'translate(-50%, -100%)',
            maxWidth: '180px'
          }}
        >
          <button
            onClick={() => {
              setShowImageChanger(true);
              setShowContextMenu(false);
            }}
            className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm"
          >
            <LuImage className="w-3 h-3" />
            Change Wallpaper
          </button>
          <button
            onClick={() => {
              setShowImageChanger(true);
              setShowContextMenu(false);
            }}
            className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm"
          >
            <LuSettings className="w-3 h-3" />
            Desktop Settings
          </button>
          <div className="border-t border-zinc-700/50 my-1"></div>
          <button
            onClick={() => openLink("https://www.linkedin.com/in/hb134/")}
            className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm"
          >
            <LuLinkedin className="w-3 h-3" />
            LinkedIn Profile
          </button>
          <button
            onClick={() => openLink("https://github.com/HarshBaldaniya")}
            className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm"
          >
            <LuGithub className="w-3 h-3" />
            GitHub Profile
          </button>
          <button
            onClick={() => openLink("https://www.harshbaldaniya.com/")}
            className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm"
          >
            <LuGlobe className="w-3 h-3" />
            Portfolio Website
          </button>
          <div className="border-t border-zinc-700/50 my-1"></div>
          <button
            onClick={toggleFullscreen}
            className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm"
          >
            {isFullscreen ? (
              <>
                <LuMinimize2 className="w-3 h-3" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <LuMaximize2 className="w-3 h-3" />
                Enter Fullscreen
              </>
            )}
          </button>
        </div>
      )}

      {/* Image Changer Modal */}
      {showImageChanger && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div 
            className="bg-zinc-900 rounded-2xl shadow-2xl max-w-5xl w-full mx-4 h-[85vh] overflow-hidden border border-zinc-700"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-700">
              <h2 className="text-xl font-semibold text-zinc-100">
                {isChangingLockScreen ? "Choose Lock Screen" : "Choose Background"}
              </h2>
              <button
                onClick={() => setShowImageChanger(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center"
              >
                <LuX className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            {/* Category Filter */}
            <div className="px-6 py-4 border-b border-zinc-700">
              <div className="flex gap-2">
                {["all", "nature", "abstract", "gradient", "lock"].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="px-6 py-3 border-b border-zinc-700">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsChangingLockScreen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !isChangingLockScreen
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  Desktop Background
                </button>
                <button
                  onClick={() => setIsChangingLockScreen(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isChangingLockScreen
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  Lock Screen
                </button>
              </div>
            </div>

            {/* Image Grid */}
            <div className="p-6 overflow-y-auto h-[calc(85vh-200px)]">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 border border-zinc-700"
                    onClick={() => handleBackgroundChange(image.url, image.name)}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide broken images
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                      <div className="p-3 w-full">
                        <p className="text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          {image.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccessNotification && (
        <motion.div
          className="fixed bottom-4 right-4 z-[9999]"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 rounded-lg shadow-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <LuCheck className="w-2.5 h-2.5 text-white" />
              </div>
              <p className="text-xs text-zinc-200 font-medium">
                {successMessage}
              </p>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="flex-shrink-0 w-4 h-4 rounded-full hover:bg-zinc-700/50 transition-colors flex items-center justify-center ml-1"
              >
                <span className="text-xs font-light text-zinc-400">×</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}