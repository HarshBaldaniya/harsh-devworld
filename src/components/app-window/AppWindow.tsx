"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export interface AppWindowProps {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  zIndex?: number;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
}

export default function AppWindow({
  id,
  title,
  icon,
  isOpen,
  onClose,
  onMinimize,
  onMaximize,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 800, height: 600 },
  zIndex = 50,
  position: propPosition,
  size: propSize,
  onPositionChange,
  // onSizeChange - removed unused parameter
}: AppWindowProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState(propPosition || initialPosition);
  const [size, setSize] = useState(propSize || initialSize); // Keep for width/height usage
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMaximize = () => {
    setIsAnimating(true);
    setIsMaximized(!isMaximized);
    onMaximize();
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.window-header')) {
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isMaximized) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      setPosition(newPosition);
      onPositionChange?.(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, isMaximized, handleMouseMove, handleMouseUp]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key={id}
          className={`fixed bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl border border-gray-200/50 overflow-hidden ${
            isMaximized ? 'top-8 bottom-20 left-4 right-4' : ''
          }`}
          style={{
            zIndex,
            ...(isMaximized
              ? {}
              : {
                  left: position.x,
                  top: position.y,
                  width: size.width,
                  height: size.height,
                })
          }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            backdropFilter: isAnimating ? "blur(20px)" : "blur(12px)",
            ...(isAnimating && {
              borderRadius: isMaximized ? 0 : 8,
              y: isMaximized ? -20 : 0,
              x: isMaximized ? -5 : 0,
            })
          }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ 
            duration: isAnimating ? 0.6 : 0.3, 
            ease: isAnimating ? [0.25, 0.46, 0.45, 0.94] : "easeOut",
            backdropFilter: { duration: isAnimating ? 0.6 : 0.3 },
            ...(isAnimating && {
              borderRadius: { duration: 0.4, ease: "easeInOut" },
              y: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
              x: { duration: 0.5, ease: "easeInOut" }
            })
          }}
          onMouseDown={handleMouseDown}
          onClick={() => {
            if ((window as Window & { bringToFront?: (appId: string) => void }).bringToFront) {
              (window as Window & { bringToFront?: (appId: string) => void }).bringToFront!(id);
            }
          }}
        >
          {/* Window Header */}
          <motion.div 
            className="window-header flex items-center justify-between bg-gray-100/80 backdrop-blur-sm border-b border-gray-200/50 px-4 py-2 cursor-move"
            animate={{
              backgroundColor: isAnimating ? "rgba(243, 244, 246, 0.9)" : "rgba(243, 244, 246, 0.8)",
            }}
            transition={{
              duration: isAnimating ? 0.3 : 0.2
            }}
          >
            {/* Window Controls - Left Side */}
            <motion.div 
              className="flex items-center gap-2"
              animate={{
                x: isAnimating ? (isMaximized ? -8 : 0) : 0,
                y: isAnimating ? (isMaximized ? -2 : 0) : 0,
              }}
              transition={{
                duration: isAnimating ? 0.5 : 0,
                ease: "easeInOut"
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200 flex items-center justify-center group"
                title="Close"
              >
                <span className="text-red-500 group-hover:text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  ×
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMinimize();
                }}
                className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors duration-200 flex items-center justify-center group"
                title="Minimize"
              >
                <span className="text-yellow-500 group-hover:text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  −
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMaximize();
                }}
                className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors duration-200 flex items-center justify-center group"
                title={isMaximized ? "Restore" : "Maximize"}
              >
                <span className="text-green-500 group-hover:text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {isMaximized ? "⤢" : "⤡"}
                </span>
              </button>
            </motion.div>
            
            {/* Window Title - Center */}
            <motion.div 
              className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2"
              animate={{
                y: isAnimating ? (isMaximized ? -3 : 0) : 0,
                opacity: isAnimating ? (isMaximized ? 0.8 : 1) : 1,
              }}
              transition={{
                duration: isAnimating ? 0.4 : 0,
                ease: "easeInOut"
              }}
            >
              <Image src={icon} alt={title} width={20} height={20} className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-700">{title}</span>
            </motion.div>
          </motion.div>

          {/* Window Content */}
          <motion.div 
            className="h-full overflow-hidden"
            animate={{
              opacity: isAnimating ? (isMaximized ? 0.9 : 1) : 1,
              filter: isAnimating ? (isMaximized ? "contrast(1.08) saturate(1.05)" : "contrast(1) saturate(1)") : "contrast(1) saturate(1)",
              y: isAnimating ? (isMaximized ? -5 : 0) : 0,
            }}
            transition={{
              duration: isAnimating ? 0.5 : 0,
              ease: "easeInOut"
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 