"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const DOCK_APPS = [
  { id: "finder", name: "Finder", icon: "/images/dock/finder.png", active: false },
  { id: "chrome", name: "Chrome", icon: "/images/dock/chrome.webp", active: false },
  { id: "mail", name: "Mail", icon: "/images/dock/mail.svg", active: false },
  { id: "notes", name: "Notes", icon: "/images/dock/note.png", active: false },
];

interface DockProps {
  onAppClick?: (appId: string) => void;
}

export default function Dock({ onAppClick }: DockProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-end justify-center">
      <motion.div 
        className="flex items-end gap-1 px-3 py-2 rounded-3xl bg-white/10 backdrop-blur-3xl shadow-2xl border border-white/20"
        animate={{
          scale: hovered !== null ? 1.05 : 1,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 20,
            mass: 0.8
          }
        }}
      >
        {DOCK_APPS.map((app, i) => {
          // Genie effect calculation with proper spacing
          let scale = 1;
          let yOffset = 0;
          let xOffset = 0;
          
          if (hovered !== null) {
            const distance = Math.abs(hovered - i);
            if (distance === 0) {
              scale = 1.45;
              yOffset = -8;
            } else if (distance === 1) {
              scale = 1.2;
              yOffset = -4;
              // Add horizontal offset to create space
              xOffset = hovered > i ? -6 : 6;
            } else if (distance === 2) {
              scale = 1.1;
              yOffset = -2;
              // More horizontal offset for further icons
              xOffset = hovered > i ? -10 : 10;
            }
          }

          return (
            <motion.div
              key={app.name}
              className="flex flex-col items-center justify-end relative"
              animate={{ 
                scale,
                y: yOffset,
                x: xOffset,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                  mass: 0.8,
                  restDelta: 0.01
                }
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              {hovered === i && (
                <motion.div
                  className="absolute bottom-full mb-2 px-2 py-0.5 bg-gray-800/90 backdrop-blur-sm rounded text-white text-[10px] font-medium uppercase tracking-wider whitespace-nowrap"
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {app.name}
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800/90"></div>
                </motion.div>
              )}

              <motion.div
                className="relative"
                animate={{
                  filter: hovered === i ? "brightness(1.2)" : "brightness(1)",
                }}
                transition={{ 
                  duration: 0.2,
                  ease: "easeOut"
                }}
                onClick={() => onAppClick?.(app.id)}
              >
                <Image
                  src={app.icon}
                  alt={app.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 object-contain"
                  draggable={false}
                />
              </motion.div>
              
              {/* Active indicator - only show when actually active */}
              {app.active && (
                <motion.div 
                  className="w-1 h-1 bg-white/80 rounded-full mt-1"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
