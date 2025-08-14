"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
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
  HiCog,
  HiViewBoards,
  HiPencil,
  HiSun,
  HiMoon,
  HiArchive,
} from "react-icons/hi";
import {
  BiBold,
  BiItalic,
  BiUnderline,
  BiListUl,
  BiListOl,
  BiCodeAlt,
} from "react-icons/bi";
import { secureStore } from "@/lib/secureStore";

/* ---------------- Types & Seed ---------------- */

interface FileItem {
  id: string;
  name: string;
  type: "folder" | "file";
  icon: string | React.ReactNode;
  size?: string;
  modified?: string;
  kind: string;
  imagePath?: string;
  content?: string;
  parentId?: string;
  deletable?: boolean;
}

const SAMPLE_FILES: FileItem[] = [
  { id: "1", name: "Applications", type: "folder", icon: "/images/application/folder.png", modified: "12 Jun 2025 at 11:14 PM", kind: "Folder", deletable: false },
  { id: "2", name: "Desktop", type: "folder", icon: "/images/application/folder.png", modified: "Today at 11:37 AM", kind: "Folder", deletable: false },
  { id: "3", name: "Documents", type: "folder", icon: "/images/application/folder.png", modified: "Today at 5:03 PM", kind: "Folder", deletable: false },
  { id: "4", name: "Downloads", type: "folder", icon: "/images/application/folder.png", modified: "Today at 11:37 AM", kind: "Folder", deletable: false },
  { id: "5", name: "Mine", type: "folder", icon: "/images/application/folder.png", modified: "9 Jun 2025 at 11:56 PM", kind: "Folder", deletable: false },
  { id: "6", name: "Movies", type: "folder", icon: "/images/application/folder.png", modified: "9 Jun 2025 at 11:18 PM", kind: "Folder", deletable: false },
  { id: "7", name: "Music", type: "folder", icon: "/images/application/folder.png", modified: "9 Jun 2025 at 11:01 PM", kind: "Folder", deletable: false },
  { id: "8", name: "Pictures", type: "folder", icon: "/images/application/folder.png", modified: "23 Jun 2025 at 6:39 PM", kind: "Folder", deletable: false },
  { id: "9", name: "Postman", type: "folder", icon: "/images/application/folder.png", modified: "12 Jun 2025 at 11:28 PM", kind: "Folder", deletable: false },
  { id: "10", name: "Public", type: "folder", icon: "/images/application/folder.png", modified: "9 Jun 2025 at 11:01 PM", kind: "Folder", deletable: false },
  { id: "11", name: "Screen Shot", type: "folder", icon: "/images/application/folder.png", modified: "5 Aug 2025 at 12:08 AM", kind: "Folder", deletable: false },
  { id: "12", name: "Wallpapers", type: "folder", icon: "/images/application/folder.png", modified: "25 Jul 2025 at 4:05 PM", kind: "Folder", deletable: false },
  { id: "13", name: "Icons", type: "folder", icon: "/images/application/folder.png", modified: "22 Jul 2025 at 11:21 PM", kind: "Folder", deletable: false },
  { id: "14", name: "Dock Apps", type: "folder", icon: "/images/application/folder.png", modified: "4 Aug 2025 at 11:50 PM", kind: "Folder", deletable: false },
  { id: "15", name: "Apple Logo", type: "file", icon: <HiCog className="w-12 h-12 text-gray-500" />, size: "660 bytes", modified: "22 Jul 2025 at 11:21 PM", kind: "SVG Document", imagePath: "/apple-logo.svg", deletable: false },
  { id: "16", name: "File Icon", type: "file", icon: <HiCog className="w-12 h-12 text-gray-500" />, size: "1.2 KB", modified: "22 Jul 2025 at 11:21 PM", kind: "SVG Document", imagePath: "/file.svg", deletable: false },
  { id: "17", name: "Globe Icon", type: "file", icon: <HiCog className="w-12 h-12 text-blue-500" />, size: "1.5 KB", modified: "22 Jul 2025 at 11:21 PM", kind: "SVG Document", imagePath: "/globe.svg", deletable: false },
  { id: "18", name: "Next.js Logo", type: "file", icon: <HiCog className="w-12 h-12 text-gray-500" />, size: "2.1 KB", modified: "22 Jul 2025 at 11:21 PM", kind: "SVG Document", imagePath: "/next.svg", deletable: false },
  { id: "19", name: "Vercel Logo", type: "file", icon: <HiCog className="w-12 h-12 text-gray-500" />, size: "1.8 KB", modified: "22 Jul 2025 at 11:21 PM", kind: "SVG Document", imagePath: "/vercel.svg", deletable: false },
  { id: "20", name: "Window Icon", type: "file", icon: <HiCog className="w-12 h-12 text-blue-500" />, size: "1.3 KB", modified: "22 Jul 2025 at 11:21 PM", kind: "SVG Document", imagePath: "/window.svg", deletable: false },
  { id: "21", name: "Profile Picture", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "45 KB", modified: "25 Jul 2025 at 4:03 PM", kind: "JPEG Image", imagePath: "/hb-logo.jpg", deletable: false },
  { id: "22", name: "Lock Screen", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "45 KB", modified: "25 Jul 2025 at 4:03 PM", kind: "JPEG Image", imagePath: "/lock-screen.jpg", deletable: false },
  { id: "23", name: "Mountain Wallpaper", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "41 KB", modified: "25 Jul 2025 at 4:05 PM", kind: "JPEG Image", imagePath: "/mac-wallpaper-1.jpg", deletable: false },
  { id: "24", name: "Ocean Wallpaper", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "38 KB", modified: "25 Jul 2025 at 4:05 PM", kind: "JPEG Image", imagePath: "/mac-wallpaper-2.jpg", deletable: false },
  { id: "25", name: "Chrome Browser", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "64 KB", modified: "4 Aug 2025 at 11:50 PM", kind: "WebP Image", imagePath: "/images/dock/chrome.webp", deletable: false },
  { id: "26", name: "Finder App", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "28 KB", modified: "25 Jul 2025 at 4:58 PM", kind: "PNG Image", imagePath: "/images/dock/finder.png", deletable: false },
  { id: "27", name: "Mail App", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "52 KB", modified: "25 Jul 2025 at 4:58 PM", kind: "WebP Image", imagePath: "/images/dock/mail.webp", deletable: false },
  { id: "28", name: "Notes App", type: "file", icon: <HiPhotograph className="w-12 h-12 text-green-500" />, size: "31 KB", modified: "25 Jul 2025 at 4:58 PM", kind: "PNG Image", imagePath: "/images/dock/note.png", deletable: false },
];

/* ---------------- Persistence ---------------- */

const STORE_KEY = "hb_finder_state_v1";
type Persisted = {
  files: FileItem[];
  viewMode: "list" | "grid";
  currentPath: string[];
};

/* ---------------- Component ---------------- */

export default function FinderApp() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPath, setCurrentPath] = useState<string[]>(["harshbaldaniya"]);
  const [sortBy, setSortBy] = useState<string>("kind");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showImagePreview, setShowImagePreview] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  const [showCreateMenu, setShowCreateMenu] = useState<boolean>(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  /* Text editor state */
  const [showTextEditor, setShowTextEditor] = useState<boolean>(false);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [editorDark, setEditorDark] = useState<boolean>(true);
  const [editorFull, setEditorFull] = useState<boolean>(false);
  const [editorMin, setEditorMin] = useState<boolean>(false);
  const [originalText, setOriginalText] = useState<string>("");

  /* Modals */
  const [confirmClose, setConfirmClose] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; itemId: string | null }>({ open: false, itemId: null });

  /* Rename */
  const [renamingItem, setRenamingItem] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  /* Files */
  const [files, setFiles] = useState<FileItem[]>(SAMPLE_FILES);

  /* Right-click popup (centered) */
  const [actionPopup, setActionPopup] = useState<{ open: boolean; itemId: string | null }>({ open: false, itemId: null });

  const isImageKind = (kind: string) => /(image|jpeg|png|webp|svg)/i.test(kind);
  const isTextKind = (item: FileItem) =>
    item.type === "file" &&
    (item.kind.includes("Text Document") || item.name.toLowerCase().endsWith(".txt"));
  const nameCellWidth = "w-64";

  /* ----- Load persisted state once (sync) ----- */
  useEffect(() => {
    // Only on client
    if (typeof window === "undefined") return;
    const saved = secureStore.get<Persisted>(STORE_KEY);
    if (saved) {
      if (Array.isArray(saved.files) && saved.files.length) {
        // Ensure icons are properly handled when loading from storage
        const processedFiles = saved.files.map(file => {
          // If the icon is an object (from persisted JSX), convert it back to a proper icon
          if (typeof file.icon === 'object' && file.icon !== null) {
            // For files with specific types, assign appropriate icons
            if (file.kind.includes('SVG Document')) {
              return { ...file, icon: <HiCog className="w-12 h-12 text-gray-500" /> };
            } else if (file.kind.includes('JPEG Image') || file.kind.includes('PNG Image') || file.kind.includes('WebP Image')) {
              return { ...file, icon: <HiPhotograph className="w-12 h-12 text-green-500" /> };
            } else if (file.kind.includes('Text Document')) {
              return { ...file, icon: <HiDocumentText className="w-12 h-12 text-blue-500" /> };
            } else {
              return { ...file, icon: <HiDocument className="w-12 h-12 text-gray-500" /> };
            }
          }
          return file;
        });
        setFiles(processedFiles);
      }
      if (saved.viewMode === "list" || saved.viewMode === "grid") setViewMode(saved.viewMode);
      if (Array.isArray(saved.currentPath) && saved.currentPath.length)
        setCurrentPath(saved.currentPath);
    }
  }, []);

  /* ----- Persist (debounced) whenever files/viewMode/currentPath change ----- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.setTimeout(() => {
      const payload: Persisted = { files, viewMode, currentPath };
      secureStore.set(STORE_KEY, payload);
    }, 400);
    return () => window.clearTimeout(id);
  }, [files, viewMode, currentPath]);

  /* ----- Selection / context ----- */
  const handleItemClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey)
      setSelectedItems((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
    else setSelectedItems([itemId]);
  };
  const handleItemRightClick = (itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedItems.includes(itemId)) setSelectedItems([itemId]);
    setActionPopup({ open: true, itemId });
  };
  const handleBackgroundContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedItems([]);
    setActionPopup({ open: true, itemId: null });
  };

  /* ----- Open item ----- */
  const handleItemDoubleClick = (item: FileItem) => {
    if (isTextKind(item)) {
      setEditingFile(item);
      setEditingText(item.content || "");
      setOriginalText(item.content || "");
      setEditorDark(true);
      setEditorFull(false);
      setEditorMin(false);
      setShowTextEditor(true);
      return;
    }
    if (item.type === "file" && item.imagePath && isImageKind(item.kind)) {
      setPreviewImage(item.imagePath);
      setShowImagePreview(true);
    } else if (item.type === "folder") {
      setCurrentPath((p) => [...p, item.name]);
    }
  };

  const navigateBack = () =>
    currentPath.length > 1 && setCurrentPath((p) => p.slice(0, -1));

  const handleSort = (column: string) => {
    if (sortBy === column) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortedFiles = () =>
    [...getCurrentFolderFiles()].sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "date":
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
      return sortOrder === "asc"
        ? aValue < bValue
          ? -1
          : aValue > bValue
          ? 1
          : 0
        : aValue > bValue
        ? -1
        : aValue < bValue
        ? 1
        : 0;
    });

  const parseDateString = (s: string): number => {
    if (!s) return 0;
    let m = s.match(/Today at (\d{1,2}):(\d{2}) (AM|PM)/);
    if (m) {
      const [, hh, mm, ap] = m;
      let h = parseInt(hh, 10);
      if (ap === "PM" && h !== 12) h += 12;
      if (ap === "AM" && h === 12) h = 0;
      const d = new Date();
      d.setHours(h, parseInt(mm, 10), 0, 0);
      return d.getTime();
    }
    m = s.match(/Yesterday at (\d{1,2}):(\d{2}) (AM|PM)/);
    if (m) {
      const [, hh, mm, ap] = m;
      let h = parseInt(hh, 10);
      if (ap === "PM" && h !== 12) h += 12;
      if (ap === "AM" && h === 12) h = 0;
      const d = new Date();
      d.setDate(d.getDate() - 1);
      d.setHours(h, parseInt(mm, 10), 0, 0);
      return d.getTime();
    }
    const d2 = s.match(
      /(\d{1,2}) (\w{3}) (\d{4}) at (\d{1,2}):(\d{2}) (AM|PM)/
    );
    if (d2) {
      const [, dd, mon, yyyy, hh, mm, ap] = d2;
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const mi = months.indexOf(mon);
      if (mi >= 0) {
        let h = parseInt(hh, 10);
        if (ap === "PM" && h !== 12) h += 12;
        if (ap === "AM" && h === 12) h = 0;
        return new Date(
          parseInt(yyyy, 10),
          mi,
          parseInt(dd, 10),
          h,
          parseInt(mm, 10),
          0,
          0
        ).getTime();
      }
    }
    return new Date().getTime();
  };

  const parseFileSize = (size: string): number => {
    if (size === "—" || !size) return 0;
    const normalized = size
      .toLowerCase()
      .includes("bytes")
      ? size.toLowerCase().replace("bytes", "B")
      : size;
    const match = normalized.match(/^([\d.]+)\s*([kmgt]?b)$/i);
    if (!match) return 0;
    const [, v, uRaw] = match;
    const u = uRaw.toUpperCase();
    const val = parseFloat(v);
    const mul: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
      TB: 1024 ** 4,
    };
    return val * (mul[u] ?? 1);
  };

  const getSortIcon = (column: string) =>
    sortBy !== column ? null : sortOrder === "asc" ? "↑" : "↓";
  const getCurrentFolderFiles = () => {
    const curr = currentPath.join("/");
    return files.filter(
      (f) => f.parentId === curr || (!f.parentId && curr === "harshbaldaniya")
    );
  };

  /* ----- Create ----- */
  const getUniqueName = (base: string, parentPath: string) => {
    const siblings = files
      .filter((f) => (f.parentId ?? "harshbaldaniya") === parentPath)
      .map((f) => f.name);
    if (!siblings.includes(base)) return base;
    const dot = base.lastIndexOf(".");
    const stem = dot > 0 ? base.slice(0, dot) : base;
    const ext = dot > 0 ? base.slice(dot) : "";
    let n = 2;
    let candidate = `${stem} copy${ext}`;
    while (siblings.includes(candidate)) {
      candidate = `${stem} copy ${n}${ext}`;
      n++;
    }
    return candidate;
  };

  const createNewFolder = () => {
    const parent = currentPath.join("/");
    const name = getUniqueName("New Folder", parent);
    const folder: FileItem = {
      id: `folder-${Date.now()}`,
      name,
      type: "folder",
      icon: "/images/application/folder.png",
      modified: "Just now",
      kind: "Folder",
      parentId: parent,
      deletable: true,
    };
    setFiles((prev) => [...prev, folder]);
    setShowCreateMenu(false);
    setTimeout(() => startRename(folder.id, folder.name), 0);
  };

  const createNewTextFile = () => {
    const parent = currentPath.join("/");
    const name = getUniqueName("New Document.txt", parent);
    const file: FileItem = {
      id: `file-${Date.now()}`,
      name,
      type: "file",
      icon: <HiDocumentText className="w-12 h-12 text-blue-500" />,
      size: "0 bytes",
      modified: "Just now",
      kind: "Text Document",
      content: "",
      parentId: parent,
      deletable: true,
    };
    setFiles((prev) => [...prev, file]);
    setShowCreateMenu(false);
    setTimeout(() => startRename(file.id, file.name), 0);
  };

  /* ----- Rename ----- */
  const startRename = (itemId: string, currentName: string) => {
    setRenamingItem(itemId);
    setNewName(currentName);
  };
  const finishRename = () => {
    if (renamingItem && newName.trim())
      setFiles((prev) =>
        prev.map((f) =>
          f.id === renamingItem
            ? { ...f, name: newName.trim(), modified: "Just now" }
            : f
        )
      );
    setRenamingItem(null);
    setNewName("");
  };
  useEffect(() => {
    if (renamingItem && renameInputRef.current) {
      const input = renameInputRef.current;
      requestAnimationFrame(() => {
        input.focus();
        input.select();
      });
    }
  }, [renamingItem]);

  /* ----- Popup actions ----- */
  const closeActions = () => setActionPopup({ open: false, itemId: null });
  const handleOpenFromPopup = () => {
    const id = actionPopup.itemId;
    if (!id) return closeActions();
    const item = files.find((f) => f.id === id);
    if (item) handleItemDoubleClick(item);
    closeActions();
  };
  const handleQuickLook = () => {
    const id = actionPopup.itemId;
    if (!id) return closeActions();
    const item = files.find((f) => f.id === id);
    if (item && item.type === "file" && item.imagePath && isImageKind(item.kind)) {
      setPreviewImage(item.imagePath);
      setShowImagePreview(true);
    }
    closeActions();
  };
  const handleDelete = () => {
    const id = actionPopup.itemId;
    if (!id) return closeActions();
    const item = files.find((f) => f.id === id);
    if (!item?.deletable) return closeActions();
    setConfirmDelete({ open: true, itemId: id });
    closeActions();
  };
  const confirmDeleteItem = () => {
    const id = confirmDelete.itemId;
    if (!id) return;
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setSelectedItems((prev) => prev.filter((x) => x !== id));
    setConfirmDelete({ open: false, itemId: null });
  };
  const cancelDelete = () => setConfirmDelete({ open: false, itemId: null });
  const beginRenameFromPopup = () => {
    const id = actionPopup.itemId;
    if (!id) return closeActions();
    const item = files.find((f) => f.id === id);
    if (item) startRename(id, item.name);
    closeActions();
  };

  /* ----- TipTap editor ----- */
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        TextStyle,
        FontFamily.configure({ types: ["textStyle"] }),
        Typography,
        Underline,
      ],
      content: editingText,
      onUpdate: ({ editor }) => setEditingText(editor.getHTML()),
      immediatelyRender: false,
    },
    []
  );

  useEffect(() => {
    if (editor && editingFile) editor.commands.setContent(editingFile.content || "");
  }, [editor, editingFile]);

  const stripHtml = (html: string) => (html ? html.replace(/<[^>]+>/g, "") : "");
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
  const hasUnsaved = () => normalize(editingText) !== normalize(originalText);

  const saveTextFile = () => {
    if (!editingFile) return;
    setFiles((prev) =>
      prev.map((f) =>
        f.id === editingFile.id
          ? {
              ...f,
              content: editingText,
              size: `${stripHtml(editingText).length} bytes`,
              modified: "Just now",
            }
          : f
      )
    );
    setOriginalText(editingText);
  };

  useEffect(() => {
    if (!showTextEditor) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveTextFile();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        attemptCloseEditor();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showTextEditor, editingText, editingFile]);

  const attemptCloseEditor = () => {
    if (hasUnsaved()) {
      setConfirmClose(true);
      return;
    }
    setShowTextEditor(false);
  };

  // Close create menu if clicked outside
  useEffect(() => {
    const outside = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node))
        setShowCreateMenu(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  // Lock body scroll while editor fullscreen
  useEffect(() => {
    if (showTextEditor && editorFull) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showTextEditor, editorFull]);

  const renderIcon = (item: FileItem) => {
    if (typeof item.icon === "string") {
      return (
        <Image
          src={item.icon}
          alt={item.name}
          width={24}
          height={24}
          className="w-6 h-6 object-contain"
        />
      );
    }
    // Ensure React components are properly rendered
    if (React.isValidElement(item.icon)) {
      return item.icon;
    }
    // Fallback for invalid icons
    return <HiDocument className="w-6 h-6 text-gray-500" />;
  };
  
  const renderGridIcon = (item: FileItem) => {
    if (typeof item.icon === "string") {
      return (
        <Image
          src={item.icon}
          alt={item.name}
          width={100}
          height={100}
          className="w-40 h-40 object-contain"
        />
      );
    }
    // Ensure React components are properly rendered
    if (React.isValidElement(item.icon)) {
      return item.icon;
    }
    // Fallback for invalid icons
    return <HiDocument className="w-40 h-40 text-gray-500" />;
  };

  /* ---------------- UI ---------------- */

  return (
    <div
      className="flex flex-col h-full bg-gray-900 text-white"
      onContextMenu={handleBackgroundContextMenu}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={navigateBack}
            disabled={currentPath.length <= 1}
            className="p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1 max-w-96 overflow-hidden">
            {currentPath.map((p, i) => (
              <React.Fragment key={i}>
                <span className="text-sm text-gray-400">{p}</span>
                {i < currentPath.length - 1 && (
                  <span className="text-sm text-gray-500">{">"}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${
              viewMode === "list" ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            <HiViewList className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${
              viewMode === "grid" ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            <HiViewGrid className="w-5 h-5" />
          </button>

          <div className="relative" ref={createMenuRef}>
            <button
              className="p-2 rounded hover:bg-gray-700"
              onClick={() => setShowCreateMenu(!showCreateMenu)}
            >
              <HiPlus className="w-5 h-5" />
            </button>
            {showCreateMenu && (
              <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
                <div className="p-2">
                  <button
                    onClick={createNewFolder}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-700 text-left"
                  >
                    <HiFolder className="w-5 h-5 text-blue-500" />
                    <span>New Folder</span>
                  </button>
                  <button
                    onClick={createNewTextFile}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-700 text-left"
                  >
                    <HiDocumentText className="w-5 h-5 text-blue-500" />
                    <span>New Text Document</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className="p-2 rounded hover:bg-gray-700"
            onClick={() => setShowInfoModal(true)}
          >
            <HiInformationCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{getCurrentFolderFiles().length} items</span>
          {selectedItems.length > 0 && (
            <span>• {selectedItems.length} selected</span>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 bg-gray-800 border-r border-gray-700 p-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Favourites
              </h3>
              <div className="space-y-1">
                <SidebarItem icon={<HiClock className="w-5 h-5 text-blue-400" />} label="Recents" />
                <SidebarItem icon={<HiCog className="w-5 h-5 text-blue-400" />} label="Applications" />
                <SidebarItem icon={<HiDocument className="w-5 h-5 text-blue-400" />} label="Documents" />
                <SidebarItem icon={<HiDesktopComputer className="w-5 h-5 text-blue-400" />} label="Desktop" />
                <SidebarItem icon={<HiDownload className="w-5 h-5 text-blue-400" />} label="Downloads" />
                <SidebarItem icon={<HiHome className="w-5 h-5 text-blue-400" />} label="harshbaldaniya" active />
                <SidebarItem icon={<HiFolder className="w-5 h-5 text-blue-400" />} label="MAMP" />
                <SidebarItem icon={<HiFolder className="w-5 h-5 text-blue-400" />} label="Public" />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                iCloud
              </h3>
              <div className="space-y-1">
                <SidebarItem icon={<HiCloud className="w-5 h-5 text-blue-400" />} label="iCloud Drive" />
                <SidebarItem icon={<HiUserGroup className="w-5 h-5 text-blue-400" />} label="Shared" />
              </div>
            </div>
          </div>
        </div>

        {/* Main area */}
        <div
          className="flex-1 flex flex-col bg-gray-900 overflow-hidden"
          onClick={() => setActionPopup({ open: false, itemId: null })}
        >
          {viewMode === "list" ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="flex items-center p-3 text-xs font-medium text-gray-400 border-b border-gray-700 bg-gray-800 flex-shrink-0">
                <div
                  className={`${nameCellWidth} flex-shrink-0 flex items-center cursor-pointer hover:text-white`}
                  onClick={() => handleSort("name")}
                >
                  Name<span className="ml-1">{getSortIcon("name")}</span>
                </div>
                <div
                  className="w-48 flex-shrink-0 cursor-pointer hover:text-white"
                  onClick={() => handleSort("date")}
                >
                  Date Modified<span className="ml-1">{getSortIcon("date")}</span>
                </div>
                <div
                  className="w-32 flex-shrink-0 cursor-pointer hover:text-white"
                  onClick={() => handleSort("size")}
                >
                  Size<span className="ml-1">{getSortIcon("size")}</span>
                </div>
                <div
                  className="w-40 flex-shrink-0 cursor-pointer hover:text-white"
                  onClick={() => handleSort("kind")}
                >
                  Kind<span className="ml-1">{getSortIcon("kind")}</span>
                </div>
              </div>

              {/* Rows */}
              <div className="flex-1 overflow-auto" onContextMenu={handleBackgroundContextMenu}>
                {getSortedFiles().map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center p-3 cursor-pointer hover:bg-gray-800 min-w-full group ${
                      selectedItems.includes(item.id) ? "bg-blue-600/20" : ""
                    }`}
                    onClick={(e) => handleItemClick(item.id, e)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    onContextMenu={(e) => handleItemRightClick(item.id, e)}
                  >
                    <div className="w-6 h-6 mr-3 flex items-center justify-center flex-shrink-0">
                      {renderIcon(item)}
                    </div>

                    <div className={`${nameCellWidth} flex-shrink-0`}>
                      {renamingItem === item.id ? (
                        <input
                          ref={renameInputRef}
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onKeyDown={(e) => {
                            const k = e.key.toLowerCase();
                            if (k === "enter" || ((e.ctrlKey || e.metaKey) && k === "s")) {
                              e.preventDefault();
                              finishRename();
                            } else if (k === "escape") {
                              setRenamingItem(null);
                              setNewName("");
                            }
                          }}
                          onBlur={finishRename}
                          className="bg-gray-700 text-white px-2 py-1 rounded-md text-sm border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full max-w-[200px] mr-3"
                        />
                      ) : (
                        <div className="font-medium text-white truncate">
                          <span className="truncate">{item.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="w-48 text-sm text-gray-400 flex-shrink-0">
                      {item.modified}
                    </div>
                    <div className="w-32 text-sm text-gray-400 flex-shrink-0">
                      {item.size || "—"}
                    </div>
                    <div className="w-40 text-sm text-gray-400 flex-shrink-0">
                      {item.kind}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-6" onContextMenu={handleBackgroundContextMenu}>
              <div className="grid grid-cols-4 gap-6 w-full">
                {getSortedFiles().map((item) => (
                  <div
                    key={item.id}
                    className={`flex flex-col items-center p-4 rounded cursor-pointer hover:bg-gray-800 ${
                      selectedItems.includes(item.id) ? "bg-blue-600/20" : ""
                    }`}
                    onClick={(e) => handleItemClick(item.id, e)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    onContextMenu={(e) => handleItemRightClick(item.id, e)}
                  >
                    <div className="w-16 h-16 mb-2 flex items-center justify-center">
                      {renderGridIcon(item)}
                    </div>
                    {renamingItem === item.id ? (
                      <input
                        ref={renameInputRef}
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                          const k = e.key.toLowerCase();
                          if (k === "enter" || ((e.ctrlKey || e.metaKey) && k === "s")) {
                            e.preventDefault();
                            finishRename();
                          } else if (k === "escape") {
                            setRenamingItem(null);
                            setNewName("");
                          }
                        }}
                        onBlur={finishRename}
                        className="bg-gray-700 text-white px-2 py-1 rounded-md text-sm border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full max-w-[140px] text-center"
                      />
                    ) : (
                      <>
                        <div className="font-medium text-white text-sm truncate max-w-full">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.type === "folder" ? "Folder" : item.size}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="p-2 text-xs text-gray-400 border-t border-gray-700 bg-gray-800">
        Users {">"} harshbaldaniya
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-start justify-center z-40 p-4 overflow-y-auto pt-8"
          onClick={() => setShowInfoModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-gray-900 rounded-xl w-full max-w-lg border border-gray-600 shadow-2xl backdrop-blur-sm max-h-[calc(100vh-4rem)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
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
                className="px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
              <p className="text-gray-300 leading-relaxed">
                Finder is the default file manager on macOS.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Image preview */}
      {showImagePreview && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-40 p-2"
          onClick={() => setShowImagePreview(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute top-2 right-2 w-9 h-9 bg-black/70 rounded-full text-white hover:bg-black/90"
            >
              ✕
            </button>
            <div className="w-full h-full flex items-center justify-center p-2">
              <Image
                src={previewImage}
                alt="Preview"
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                priority
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* ---------- Centered action popup ---------- */}
      {actionPopup.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setActionPopup({ open: false, itemId: null })}
          onContextMenu={(e) => e.preventDefault()}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="bg-gray-800 text-white w-full max-w-sm rounded-xl border border-gray-700 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-700 font-medium">
              {actionPopup.itemId ? "Item actions" : "New"}
            </div>
            <div className="py-2">
              {actionPopup.itemId ? (
                <>
                  <PopupItem icon={<HiViewBoards className="w-4 h-4" />} label="Open" onClick={handleOpenFromPopup} />
                  {(() => {
                    const it = files.find((f) => f.id === actionPopup.itemId);
                    return it && it.type === "file" && it.imagePath && isImageKind(it.kind)
                      ? <PopupItem icon={<HiPhotograph className="w-4 h-4" />} label="Quick Look" onClick={handleQuickLook} />
                      : null;
                  })()}
                  <PopupDivider />
                  <PopupItem icon={<HiPencil className="w-4 h-4" />} label="Rename" onClick={beginRenameFromPopup} />
                  <PopupItem icon={<HiArchive className="w-4 h-4" />} label="Delete" onClick={handleDelete} disabled={!files.find((f) => f.id === actionPopup.itemId)?.deletable} />
                  <PopupDivider />
                  <PopupItem icon={<HiInformationCircle className="w-4 h-4" />} label="Get Info" onClick={() => { setShowInfoModal(true); closeActions(); }} />
                  <PopupDivider />
                  <PopupItem icon={<HiFolder className="w-4 h-4" />} label="New Folder" onClick={() => { createNewFolder(); closeActions(); }} />
                  <PopupItem icon={<HiDocumentText className="w-4 h-4" />} label="New Text Document" onClick={() => { createNewTextFile(); closeActions(); }} />
                </>
              ) : (
                <>
                  <PopupItem icon={<HiFolder className="w-4 h-4" />} label="New Folder" onClick={() => { createNewFolder(); closeActions(); }} />
                  <PopupItem icon={<HiDocumentText className="w-4 h-4" />} label="New Text Document" onClick={() => { createNewTextFile(); closeActions(); }} />
                  <PopupDivider />
                  <PopupItem icon={<HiInformationCircle className="w-4 h-4" />} label="Get Info" onClick={() => { setShowInfoModal(true); closeActions(); }} />
                </>
              )}
            </div>
            <div className="px-4 py-2 border-t border-gray-700 text-right">
              <button
                className="px-3 py-1.5 text-sm rounded hover:bg-gray-700"
                onClick={() => setActionPopup({ open: false, itemId: null })}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ---------- Text editor (portal) + Save dialog ---------- */}
      {showTextEditor && editingFile && !editorMin &&
        createPortal(
          <>
            {/* Editor overlay */}
            <div
              className={`fixed inset-0 z-[60] ${editorFull ? "p-0" : "p-6"} bg-black/60 flex items-center justify-center`}
              onClick={() => attemptCloseEditor()}
            >
              <motion.div
                initial={{ scale: editorFull ? 1 : 0.97, opacity: 0, y: editorFull ? 0 : 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={`${editorDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"} ${editorFull ? "w-full h-full rounded-none border-0" : "w-full max-w-6xl h-[80vh] max-h-[90vh] rounded-xl border"} ${editorDark ? "border-gray-600" : "border-gray-300"} shadow-2xl backdrop-blur-sm flex flex-col min-h-0`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Title bar */}
                <div className={`flex items-center justify-between px-4 py-2 border-b ${editorDark ? "border-gray-700" : "border-gray-200"}`}>
                  <div className="flex items-center gap-2">
                    <button title="Close" onClick={() => attemptCloseEditor()} className="w-3.5 h-3.5 rounded-full" style={{ background: "#ff5f57" }} />
                    <button title="Minimize" onClick={() => setEditorMin(true)} className="w-3.5 h-3.5 rounded-full" style={{ background: "#ffbd2e" }} />
                    <button title={editorFull ? "Restore" : "Maximize"} onClick={() => setEditorFull((v) => !v)} className="w-3.5 h-3.5 rounded-full" style={{ background: "#28c840" }} />
                    <div className="ml-3 font-medium truncate max-w-[40vw]">{editingFile.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditorDark((v) => !v)}
                      className={`p-2 rounded ${editorDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                      title={editorDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                      {editorDark ? <HiSun className="w-4 h-4" /> : <HiMoon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Toolbar */}
                <div className={`px-4 py-2 border-b ${editorDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"} flex items-center gap-2 flex-wrap`}>
                  {editor && (
                    <>
                      <select
                        className={`px-3 py-1 rounded border ${editorDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"} text-sm focus:outline-none`}
                        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                        defaultValue="Inter"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Courier New">Courier New</option>
                      </select>

                      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive("bold") ? "bg-blue-500 text-white" : editorDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}><BiBold className="w-4 h-4" /></button>
                      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor.isActive("italic") ? "bg-blue-500 text-white" : editorDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}><BiItalic className="w-4 h-4" /></button>
                      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded ${editor.isActive("underline") ? "bg-blue-500 text-white" : editorDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}><BiUnderline className="w-4 h-4" /></button>

                      <div className="w-px h-6 mx-2" style={{ background: editorDark ? "#4b5563" : "#d1d5db" }} />
                      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor.isActive("bulletList") ? "bg-blue-500 text-white" : editorDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}><BiListUl className="w-4 h-4" /></button>
                      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded ${editor.isActive("orderedList") ? "bg-blue-500 text-white" : editorDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}><BiListOl className="w-4 h-4" /></button>

                      <div className="w-px h-6 mx-2" style={{ background: editorDark ? "#4b5563" : "#d1d5db" }} />
                      <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-2 rounded ${editor.isActive("code") ? "bg-blue-500 text-white" : editorDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}><BiCodeAlt className="w-4 h-4" /></button>

                      <div className="ml-auto flex gap-2">
                        <button onClick={saveTextFile} className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                          Save (⌘/Ctrl+S)
                        </button>
                        <button onClick={() => attemptCloseEditor()} className={`px-3 py-1.5 rounded text-sm ${editorDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}>
                          Close
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Editor area */}
                <div className="flex-1 min-h-0 p-4">
                  <div className={`w-full h-full rounded-lg border ${editorDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"} focus-within:ring-2 focus-within:ring-blue-500 flex flex-col min-h-0 overflow-hidden`}>
                    <div className="editor-scroll flex-1">
                      {editor ? (
                        <EditorContent
                          editor={editor}
                          className={`tiptap-content ${editorDark ? "text-white" : "text-gray-900"} p-4 focus:outline-none`}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Save dialog */}
            {confirmClose && (
              <div
                className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60"
                onClick={() => setConfirmClose(false)}
              >
                <div
                  className="bg-gray-800 text-white w-full max-w-sm rounded-xl border border-gray-700 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-700 font-medium">
                    Save changes?
                  </div>
                  <div className="px-4 py-3 text-sm text-gray-200">
                    You have unsaved changes in{" "}
                    <span className="font-semibold">{editingFile?.name}</span>.
                  </div>
                  <div className="px-4 py-3 flex gap-2 justify-end border-t border-gray-700">
                    <button
                      className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600"
                      onClick={() => setConfirmClose(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        setConfirmClose(false);
                        setShowTextEditor(false);
                      }}
                    >
                      Don’t Save
                    </button>
                    <button
                      className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        saveTextFile();
                        setConfirmClose(false);
                        setShowTextEditor(false);
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>,
          document.body
        )}

      {/* Minimized pill */}
      {showTextEditor && editingFile && editorMin && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`${
              editorDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            } border ${
              editorDark ? "border-gray-700" : "border-gray-300"
            } rounded-full shadow-xl flex items-center gap-3 px-4 py-2`}
          >
            <span className="text-sm truncate max-w-[40vw]">
              Text Editor — {editingFile.name}
            </span>
            <button
              className={`text-xs px-2 py-1 rounded ${
                editorDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
              onClick={() => setEditorMin(false)}
              title="Restore"
            >
              Restore
            </button>
            <button
              className={`text-xs px-2 py-1 rounded ${
                editorDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
              onClick={() => {
                saveTextFile();
                setShowTextEditor(false);
              }}
              title="Save & Close"
            >
              Save & Close
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete.open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60"
          onClick={cancelDelete}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="bg-gray-800 text-white w-full max-w-sm rounded-xl border border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-700 font-medium flex items-center gap-2">
              <HiArchive className="w-5 h-5 text-red-400" />
              Delete Item
            </div>
            <div className="px-4 py-4 text-sm text-gray-200">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {files.find((f) => f.id === confirmDelete.itemId)?.name}
              </span>
              ?
              <br />
              <span className="text-gray-400 text-xs mt-1 block">
                This action cannot be undone.
              </span>
            </div>
            <div className="px-4 py-3 flex gap-2 justify-end border-t border-gray-700">
              <button
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition-colors font-medium"
                onClick={confirmDeleteItem}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Global styles */}
      <style jsx global>{`
        .tiptap-content ul {
          list-style: disc;
          padding-left: 1.25rem;
          margin-left: 0.25rem;
        }
        .tiptap-content ol {
          list-style: decimal;
          padding-left: 1.25rem;
          margin-left: 0.25rem;
        }
        .tiptap-content li {
          margin: 0.25rem 0;
        }
        .editor-scroll {
          overflow-y: auto;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
          touch-action: pan-y;
          height: 100%;
        }
        .editor-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .editor-scroll::-webkit-scrollbar-track {
          background: rgba(107, 114, 128, 0.35);
          border-radius: 9999px;
        }
        .editor-scroll::-webkit-scrollbar-thumb {
          background: rgba(229, 231, 235, 0.5);
          border-radius: 9999px;
        }
        .editor-scroll .ProseMirror {
          min-height: 100%;
          outline: none;
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}

/* ---------- Small UI Helpers ---------- */

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-2 rounded ${
        active ? "bg-gray-700" : "hover:bg-gray-700"
      } cursor-pointer`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}

function PopupItem({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700"
      }`}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
function PopupDivider() {
  return <div className="my-1 h-px bg-gray-700" />;
}
