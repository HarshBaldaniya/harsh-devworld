"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  HiClock, 
  HiDocument, 
  HiDesktopComputer, 
  HiDownload, 
  HiHome, 
  HiFolder, 
  HiCloud, 
  HiUserGroup,
  HiViewList,
  HiViewGrid,
  HiPlus,
  HiInformationCircle,
  HiChevronLeft,
  HiDocumentText,
  HiPhotograph,
  HiMusicNote,
  HiFilm,
  HiArchive,
  HiCode,
  HiLockClosed,
  HiCog,
  HiViewBoards,
  HiCollection
} from "react-icons/hi";

interface FileItem {
  id: string;
  name: string;
  type: "folder" | "file";
  icon: string | React.ReactNode;
  size?: string;
  modified?: string;
  kind: string;
  imagePath?: string;
}

const SAMPLE_FILES: FileItem[] = [
  { id: "1", name: "Applications", type: "folder", icon: "/images/application/folder.png", modified: "12 Jun 2025 at 11:14 PM", kind: "Folder" },
  { id: "2", name: "Desktop", type: "folder", icon: "/images/application/folder.png", modified: "Today at 11:37 AM", kind: "Folder" },
  { id: "3", name: "Documents", type: "folder", icon: "/images/application/folder.png", modified: "Today at 5:03 PM", kind: "Folder" },
  { id: "4", name: "Downloads", type: "folder", icon: "/images/application/folder.png", modified: "Today at 11:37 AM", kind: "Folder" },
  { id: "5", name: "Mine", type: "folder", icon: "/images/application/folder.png", modified: "9 Jun 2025 at 11:56 PM", kind: "Folder" },
  { id: "6", name: "Movies", type: "folder", icon: "/images/application/folder.png", modified: "9 Jun 2025 at 11:18 PM", kind: "Folder" },
  { id: "7", name: "Music", type: "folder", icon: "/images/application/folder.png", modified: "9 Jun 2025 at 11:01 PM", kind: "Folder" },
  { id: "8", name: "Pictures", type: "folder", icon: "/images/application/folder.png", modified: "23 Jun 2025 at 6:39 PM", kind: "Folder" },
  { id: "9", name: "Postman", type: "folder", icon: "/images/application/folder.png", modified: "12 Jun 2025 at 11:28 PM", kind: "Folder" },
  { id: "10", name: "Public", type: "folder", icon: "/images/application/folder.png", modified: "9 Jun 2025 at 11:01 PM", kind: "Folder" },
  { id: "11", name: "Screen Shot", type: "folder", icon: "/images/application/folder.png", modified: "5 Aug 2025 at 12:08 AM", kind: "Folder" },
  { id: "12", name: "Wallpapers", type: "folder", icon: "/images/application/folder.png", modified: "25 Jul 2025 at 4:05 PM", kind: "Folder" },
  { id: "13", name: "Icons", type: "folder", icon: "/images/application/folder.png", modified: "22 Jul 2025 at 11:21 PM", kind: "Folder" },
  { id: "14", name: "Dock Apps", type: "folder", icon: "/images/application/folder.png", modified: "4 Aug 2025 at 11:50 PM", kind: "Folder" },
  { id: "15", name: "Apple Logo", type: "file", icon: <HiCog className="w-12 h-12 text-gray-500" />, size: "660 bytes", modified: "22 Jul 2025 at 11:21 PM", kind: "SVG Document", imagePath: "/apple-logo.svg" },
  { id: "16", name: "File Icon", type: "file", icon: <HiCog className="w-12 h-12 text-gray-500" />, size: "1.2 KB", modified: "22 Jul 2025 at 11:21 PM", kind: "SVG Document", imagePath: "/file.svg" },
  { id: "17", name: "Globe Icon", type: "file", icon: <HiCog className="w-12 h-12 text-blue-500" />, size: "1.5 KB", modified: "22 Jul 2025 at 11:21 PM", kind: "SVG Document", imagePath: "/globe.svg" },
  { id: "18", name: "Next.js Logo", type: "file", icon: <HiCog className="w-12 h-12 text-gray-500" />, size: "2.1 KB", modified: "22 Jul 2025 at 11:21 PM", kind: "SVG Document", imagePath: "/next.svg" },
  { id: "19", name: "Vercel Logo", type: "file", icon: <HiCog className="w-12 h-12 text-gray-500" />, size: "1.8 KB", modified: "22 Jul 2025 at 11:21 PM", kind: "SVG Document", imagePath: "/vercel.svg" },
  { id: "20", name: "Window Icon", type: "file", icon: <HiCog className="w-12 h-12 text-blue-500" />, size: "1.3 KB", modified: "22 Jul 2025 at 11:21 PM", kind: "SVG Document", imagePath: "/window.svg" },
  { id: "21", name: "Profile Picture", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "45 KB", modified: "25 Jul 2025 at 4:03 PM", kind: "JPEG Image", imagePath: "/hb-logo.jpg" },
  { id: "22", name: "Lock Screen", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "45 KB", modified: "25 Jul 2025 at 4:03 PM", kind: "JPEG Image", imagePath: "/lock-screen.jpg" },
  { id: "23", name: "Mountain Wallpaper", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "41 KB", modified: "25 Jul 2025 at 4:05 PM", kind: "JPEG Image", imagePath: "/mac-wallpaper-1.jpg" },
  { id: "24", name: "Ocean Wallpaper", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "38 KB", modified: "25 Jul 2025 at 4:05 PM", kind: "JPEG Image", imagePath: "/mac-wallpaper-2.jpg" },
  { id: "25", name: "Chrome Browser", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "64 KB", modified: "4 Aug 2025 at 11:50 PM", kind: "WebP Image", imagePath: "/images/dock/chrome.webp" },
  { id: "26", name: "Finder App", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "28 KB", modified: "25 Jul 2025 at 4:58 PM", kind: "PNG Image", imagePath: "/images/dock/finder.png" },
  { id: "27", name: "Mail App", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "52 KB", modified: "25 Jul 2025 at 4:58 PM", kind: "WebP Image", imagePath: "/images/dock/mail.webp" },
  { id: "28", name: "Notes App", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "31 KB", modified: "25 Jul 2025 at 4:58 PM", kind: "PNG Image", imagePath: "/images/dock/note.png" },
];

export default function FinderApp() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPath, setCurrentPath] = useState<string[]>(["harshbaldaniya"]);
  const [sortBy, setSortBy] = useState<string>("kind");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showImagePreview, setShowImagePreview] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  const handleItemClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
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
    // Check if it's an image file
    if (item.type === "file" && item.imagePath && (
      item.kind.includes("Image") || 
      item.kind.includes("JPEG") || 
      item.kind.includes("PNG") || 
      item.kind.includes("WebP") ||
      item.kind.includes("SVG")
    )) {
      setPreviewImage(item.imagePath);
      setShowImagePreview(true);
    }
  };

  const navigateBack = () => {
    // Disable back navigation - keep path unchanged
    // This prevents changing the current location
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortedFiles = () => {
    return [...SAMPLE_FILES].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "date":
          // Parse date strings like "Today at 11:37 AM", "12 Jun 2025 at 11:14 PM"
          aValue = parseDateString(a.modified || "");
          bValue = parseDateString(b.modified || "");
          break;
        case "size":
          aValue = parseFileSize(a.size || "0");
          bValue = parseFileSize(b.size || "0");
          break;
        case "kind":
          aValue = a.kind.toLowerCase();
          bValue = b.kind.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  const parseDateString = (dateStr: string): number => {
    if (!dateStr) return 0;
    
    // Handle "Today at" format
    if (dateStr.includes("Today at")) {
      const timeMatch = dateStr.match(/Today at (\d{1,2}):(\d{2}) (AM|PM)/);
      if (timeMatch) {
        const [, hour, minute, period] = timeMatch;
        let hour24 = parseInt(hour);
        if (period === "PM" && hour24 !== 12) hour24 += 12;
        if (period === "AM" && hour24 === 12) hour24 = 0;
        
        const today = new Date();
        today.setHours(hour24, parseInt(minute), 0, 0);
        return today.getTime();
      }
    }
    
    // Handle "Yesterday at" format
    if (dateStr.includes("Yesterday at")) {
      const timeMatch = dateStr.match(/Yesterday at (\d{1,2}):(\d{2}) (AM|PM)/);
      if (timeMatch) {
        const [, hour, minute, period] = timeMatch;
        let hour24 = parseInt(hour);
        if (period === "PM" && hour24 !== 12) hour24 += 12;
        if (period === "AM" && hour24 === 12) hour24 = 0;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(hour24, parseInt(minute), 0, 0);
        return yesterday.getTime();
      }
    }
    
    // Handle "DD MMM YYYY at HH:MM AM/PM" format
    const dateMatch = dateStr.match(/(\d{1,2}) (\w{3}) (\d{4}) at (\d{1,2}):(\d{2}) (AM|PM)/);
    if (dateMatch) {
      const [, day, month, year, hour, minute, period] = dateMatch;
      let hour24 = parseInt(hour);
      if (period === "PM" && hour24 !== 12) hour24 += 12;
      if (period === "AM" && hour24 === 12) hour24 = 0;
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = monthNames.indexOf(month);
      
      if (monthIndex !== -1) {
        const date = new Date(parseInt(year), monthIndex, parseInt(day), hour24, parseInt(minute), 0, 0);
        return date.getTime();
      }
    }
    
    // Fallback to current date if parsing fails
    return new Date().getTime();
  };

  const parseFileSize = (size: string): number => {
    if (size === "—" || !size) return 0;
    const match = size.match(/^([\d.]+)\s*([KMGT]?B)$/i);
    if (!match) return 0;
    const [, value, unit] = match;
    const numValue = parseFloat(value);
    const multipliers: { [key: string]: number } = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
      'TB': 1024 * 1024 * 1024 * 1024
    };
    return numValue * (multipliers[unit.toUpperCase()] || 1);
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  // Keyboard event handler for closing modal with Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showInfoModal) {
        setShowInfoModal(false);
      }
    };

    if (showInfoModal) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showInfoModal]);

  const renderIcon = (item: FileItem) => {
    if (typeof item.icon === 'string') {
      // For folder icons, use the image
      return (
        <Image
          src={item.icon}
          alt={item.name}
          width={24}
          height={24}
          className="w-6 h-6 object-contain"
        />
      );
    } else {
      // For React Icons
      return item.icon;
    }
  };

  const renderGridIcon = (item: FileItem) => {
    if (typeof item.icon === 'string') {
      // For folder icons, use the image
      return (
        <Image
          src={item.icon}
          alt={item.name}
          width={100}
          height={100}
          className="w-40 h-40 object-contain"
        />
      );
    } else {
      // For React Icons, return the icon as is (it's already sized appropriately)
      return item.icon;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={navigateBack}
            disabled={true}
            className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
          
                          <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">Users {'>'} harshbaldaniya</span>
                </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${viewMode === "list" ? "bg-blue-600" : "hover:bg-gray-700"}`}
          >
            <HiViewList className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-600" : "hover:bg-gray-700"}`}
          >
            <HiViewGrid className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-gray-700">
            <HiPlus className="w-5 h-5" />
          </button>
          <button 
            className="p-2 rounded hover:bg-gray-700"
            onClick={() => setShowInfoModal(true)}
          >
            <HiInformationCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>28 items</span>
          {selectedItems.length > 0 && (
            <span>• {selectedItems.length} selected</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 bg-gray-800 border-r border-gray-700 p-4">
          <div className="space-y-6">
            {/* Favourites */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Favourites
              </h3>
              <div className="space-y-1">
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <HiClock className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Recents</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <HiCog className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Applications</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <HiDocument className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Documents</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <HiDesktopComputer className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Desktop</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <HiDownload className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Downloads</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded bg-gray-700 cursor-pointer">
                  <HiHome className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">harshbaldaniya</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <HiFolder className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">MAMP</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <HiFolder className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Public</span>
                </div>
              </div>
            </div>

            {/* iCloud */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                iCloud
              </h3>
              <div className="space-y-1">
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <HiCloud className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">iCloud Drive</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <HiUserGroup className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Shared</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
          {viewMode === "list" ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Column Headers - Fixed */}
              <div className="flex items-center p-3 text-xs font-medium text-gray-400 border-b border-gray-700 bg-gray-800 flex-shrink-0">
                <div 
                  className="w-64 flex-shrink-0 flex items-center cursor-pointer hover:text-white"
                  onClick={() => handleSort("name")}
                >
                  Name
                  <span className="ml-1">{getSortIcon("name")}</span>
                </div>
                <div 
                  className="w-48 flex-shrink-0 cursor-pointer hover:text-white"
                  onClick={() => handleSort("date")}
                >
                  Date Modified
                  <span className="ml-1">{getSortIcon("date")}</span>
                </div>
                <div 
                  className="w-32 flex-shrink-0 cursor-pointer hover:text-white"
                  onClick={() => handleSort("size")}
                >
                  Size
                  <span className="ml-1">{getSortIcon("size")}</span>
                </div>
                <div 
                  className="w-40 flex-shrink-0 cursor-pointer hover:text-white"
                  onClick={() => handleSort("kind")}
                >
                  Kind
                  <span className="ml-1">{getSortIcon("kind")}</span>
                </div>
              </div>
              
              {/* File List - Scrollable */}
              <div className="flex-1 overflow-auto">
                <div className="w-full">
                  {getSortedFiles().map((item) => (
                    <motion.div
                      key={item.id}
                      className={`flex items-center p-3 cursor-pointer hover:bg-gray-800 min-w-full ${
                        selectedItems.includes(item.id) ? "bg-blue-600/20" : ""
                      }`}
                      onClick={(e) => handleItemClick(item.id, e)}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                    >
                      <div className="w-6 h-6 mr-3 flex items-center justify-center flex-shrink-0">
                        {renderIcon(item)}
                      </div>
                      <div className="w-64 flex-shrink-0">
                        <div className="font-medium text-white truncate">{item.name}</div>
                      </div>
                      <div className="w-48 text-sm text-gray-400 flex-shrink-0">{item.modified}</div>
                      <div className="w-32 text-sm text-gray-400 flex-shrink-0">{item.size || "—"}</div>
                      <div className="w-40 text-sm text-gray-400 flex-shrink-0">{item.kind}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-4 gap-6 w-full">
                {getSortedFiles().map((item) => (
                  <motion.div
                    key={item.id}
                    className={`flex flex-col items-center p-4 rounded cursor-pointer hover:bg-gray-800 ${
                      selectedItems.includes(item.id) ? "bg-blue-600/20" : ""
                    }`}
                    onClick={(e) => handleItemClick(item.id, e)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                  >
                    <div className="w-16 h-16 mb-2 flex items-center justify-center">
                      {renderGridIcon(item)}
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-white text-sm truncate max-w-full">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {item.type === "folder" ? "Folder" : item.size}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-2 text-xs text-gray-400 border-t border-gray-700 bg-gray-800">
        <span>Users {'>'} harshbaldaniya</span>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 p-4 overflow-y-auto pt-8"
          onClick={() => setShowInfoModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-gray-900 rounded-xl w-full max-w-lg border border-gray-600 shadow-2xl backdrop-blur-sm max-h-[calc(100vh-4rem)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <HiCog className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Finder</h2>
                  <p className="text-sm text-gray-400">Get Info</p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-700 flex items-center justify-center transition-all duration-200 group"
                title="Close"
              >
                <div className="w-4 h-4 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-gray-400 group-hover:bg-white rotate-45 transition-all duration-200"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-gray-400 group-hover:bg-white -rotate-45 transition-all duration-200"></div>
                  </div>
                </div>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
              {/* About Section */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">About Finder</h3>
                <p className="text-gray-300 leading-relaxed">
                  Finder is the default file manager and graphical user interface shell used on macOS. 
                  It&apos;s responsible for the overall user-management of files, disks, network volumes, 
                  and the launching of other applications.
                </p>
              </div>
              
              {/* Current Session */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-white mb-3">Current Session</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Location</p>
                    <p className="text-white font-medium">{currentPath.join(' > ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Items</p>
                    <p className="text-white font-medium">{SAMPLE_FILES.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">View Mode</p>
                    <p className="text-white font-medium">{viewMode === 'list' ? 'List' : 'Grid'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Selected</p>
                    <p className="text-white font-medium">{selectedItems.length} items</p>
                  </div>
                </div>
              </div>
              
              {/* System Info */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3">System Information</h3>
                <div className="bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">macOS Version</span>
                    <span className="text-white">14.0 (Sonoma)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Finder Version</span>
                    <span className="text-white">14.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Build</span>
                    <span className="text-white">23A344</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Architecture</span>
                    <span className="text-white">Apple Silicon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kernel</span>
                    <span className="text-white">Darwin 23.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memory</span>
                    <span className="text-white">16 GB</span>
                  </div>
                </div>
              </div>
              
              {/* Additional Info */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3">Features</h3>
                <div className="bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white">File and folder management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white">Multiple view modes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white">Sorting and filtering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white">Quick Look preview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white">Spotlight search integration</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-700 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-2"
          onClick={() => setShowImagePreview(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-black bg-opacity-70 rounded-full flex items-center justify-center text-white hover:bg-opacity-90 transition-all duration-200 z-10"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-0.5 sm:w-5 sm:h-0.5 bg-white rotate-45 transition-all duration-200"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-0.5 sm:w-5 sm:h-0.5 bg-white -rotate-45 transition-all duration-200"></div>
                </div>
              </div>
            </button>

            {/* Image */}
            <div className="w-full h-full flex items-center justify-center p-2">
              <Image
                src={previewImage}
                alt="Preview"
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                priority
              />
            </div>

            {/* Image info */}
            <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black bg-opacity-70 rounded-lg px-3 py-2 text-white text-sm">
              <p className="font-medium">Image Preview</p>
              <p className="text-gray-300 text-xs">Click outside to close</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 