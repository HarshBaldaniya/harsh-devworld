"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface FileItem {
  id: string;
  name: string;
  type: "folder" | "file";
  icon: string;
  size?: string;
  modified?: string;
}

const SAMPLE_FILES: FileItem[] = [
  { id: "1", name: "Applications", type: "folder", icon: "📁", modified: "Today, 2:30 PM" },
  { id: "2", name: "Desktop", type: "folder", icon: "🖥️", modified: "Today, 1:45 PM" },
  { id: "3", name: "Documents", type: "folder", icon: "📄", modified: "Yesterday, 4:20 PM" },
  { id: "4", name: "Downloads", type: "folder", icon: "⬇️", modified: "Today, 10:15 AM" },
  { id: "5", name: "Pictures", type: "folder", icon: "🖼️", modified: "2 days ago" },
  { id: "6", name: "Music", type: "folder", icon: "🎵", modified: "3 days ago" },
  { id: "7", name: "Movies", type: "folder", icon: "🎬", modified: "1 week ago" },
  { id: "8", name: "resume.pdf", type: "file", icon: "📄", size: "2.4 MB", modified: "Today, 9:30 AM" },
  { id: "9", name: "portfolio.html", type: "file", icon: "🌐", size: "156 KB", modified: "Yesterday, 3:45 PM" },
  { id: "10", name: "project.zip", type: "file", icon: "📦", size: "45.2 MB", modified: "2 days ago" },
];

export default function FinderApp() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPath, setCurrentPath] = useState<string[]>(["Home"]);

  const handleItemClick = (itemId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      setSelectedItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setSelectedItems([itemId]);
    }
  };

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === "folder") {
      setCurrentPath([...currentPath, item.name]);
      setSelectedItems([]);
    }
  };

  const navigateBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedItems([]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <button
            onClick={navigateBack}
            disabled={currentPath.length <= 1}
            className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Back"
          >
            ←
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${viewMode === "list" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
            title="List View"
          >
            ☰
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
            title="Grid View"
          >
            ⊞
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <button className="p-2 rounded hover:bg-gray-200" title="New Folder">
            📁+
          </button>
          <button className="p-2 rounded hover:bg-gray-200" title="Get Info">
            ℹ️
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{SAMPLE_FILES.length} items</span>
          {selectedItems.length > 0 && (
            <span>• {selectedItems.length} selected</span>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 p-2 text-sm text-gray-600 border-b border-gray-200">
        {currentPath.map((path, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-gray-400">/</span>}
            <button
              onClick={() => {
                setCurrentPath(currentPath.slice(0, index + 1));
                setSelectedItems([]);
              }}
              className="hover:text-blue-600 hover:underline"
            >
              {path}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-48 bg-gray-50 border-r border-gray-200 p-3">
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Favorites
            </div>
            <div className="space-y-1">
              <div className="flex items-center p-2 rounded hover:bg-gray-200 cursor-pointer">
                <span className="text-lg mr-2">🏠</span>
                <span className="text-sm">Home</span>
              </div>
              <div className="flex items-center p-2 rounded hover:bg-gray-200 cursor-pointer">
                <span className="text-lg mr-2">📁</span>
                <span className="text-sm">Documents</span>
              </div>
              <div className="flex items-center p-2 rounded hover:bg-gray-200 cursor-pointer">
                <span className="text-lg mr-2">⬇️</span>
                <span className="text-sm">Downloads</span>
              </div>
              <div className="flex items-center p-2 rounded hover:bg-gray-200 cursor-pointer">
                <span className="text-lg mr-2">🖼️</span>
                <span className="text-sm">Pictures</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === "list" ? (
            <div className="space-y-1">
              {SAMPLE_FILES.map((item) => (
                <motion.div
                  key={item.id}
                  className={`flex items-center p-2 rounded cursor-pointer hover:bg-blue-50 ${
                    selectedItems.includes(item.id) ? "bg-blue-100" : ""
                  }`}
                  onClick={(e) => handleItemClick(item.id, e)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.type === "folder" ? "Folder" : item.size} • {item.modified}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {SAMPLE_FILES.map((item) => (
                <motion.div
                  key={item.id}
                  className={`flex flex-col items-center p-4 rounded cursor-pointer hover:bg-blue-50 ${
                    selectedItems.includes(item.id) ? "bg-blue-100" : ""
                  }`}
                  onClick={(e) => handleItemClick(item.id, e)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-4xl mb-2">{item.icon}</span>
                  <div className="text-center">
                    <div className="font-medium text-gray-900 text-sm truncate max-w-full">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.type === "folder" ? "Folder" : item.size}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
        {selectedItems.length > 0 ? (
          <span>{selectedItems.length} items selected</span>
        ) : (
          <span>{SAMPLE_FILES.length} items</span>
        )}
      </div>
    </div>
  );
} 