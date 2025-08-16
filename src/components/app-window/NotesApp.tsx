"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

/* TipTap */
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";


/* Icons */
import {
  LuPlus,
  LuSearch,
  LuPanelLeftOpen,
  LuPanelLeftClose,
  LuSun,
  LuMoon,
  LuBold,
  LuItalic,
  LuUnderline,
  LuTrash2,
  LuTag,
  LuBookmark,
  LuX,
  LuCheck,
} from "react-icons/lu";

/* ────────────── tiny, SSR-safe local store (lightly obfuscated) ───────────── */
const __mem: Record<string, string> = {};
const PREFIX = "__simple_notes_v1__:";
const b64e = (s: string) => {
  try {
    if (typeof window === "undefined") {
      return Buffer.from(s, "utf8").toString("base64");
    } else {
      // Use a more robust encoding approach for browser
      const encoder = new TextEncoder();
      const bytes = encoder.encode(s);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
  } catch (error) {
    console.warn('Base64 encoding failed, using fallback:', error);
    return btoa(s);
  }
};

const b64d = (s: string) => {
  try {
    if (typeof window === "undefined") {
      return Buffer.from(s, "base64").toString("utf8");
    } else {
      // Use a more robust decoding approach for browser
      const binary = atob(s);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    }
  } catch (error) {
    console.warn('Base64 decoding failed, using fallback:', error);
    return atob(s);
  }
};
const xor = (s: string, k: string) =>
  Array.from(s)
    .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ k.charCodeAt(i % k.length)))
    .join("");

const ls =
  typeof window === "undefined"
    ? null
    : (() => {
        try {
          const t = "__probe__";
          window.localStorage.setItem(t, t);
          window.localStorage.removeItem(t);
          return window.localStorage;
        } catch {
          return null;
        }
      })();

const SECRET =
  typeof window === "undefined"
    ? "ssr"
    : (() => {
        const k = "__simple_notes_secret__";
        let s = ls?.getItem(k) || __mem[k];
        if (!s) {
          s = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
          if (ls) ls.setItem(k, s);
          else __mem[k] = s;
        }
        return s;
      })();

const store = {
  set<T>(k: string, v: T) {
    try {
      const raw = JSON.stringify({ v, t: Date.now() });
      
      // Check if the data is too large for localStorage (usually 5-10MB limit)
      const dataSize = new Blob([raw]).size;
      if (dataSize > 4 * 1024 * 1024) { // 4MB limit
        console.warn(`Data for key "${k}" is too large (${Math.round(dataSize / 1024 / 1024)}MB), truncating...`);
        // For notes, we might want to truncate the content
        if (k === "notes" && Array.isArray(v)) {
          const truncatedNotes = (v as any[]).map(note => ({
            ...note,
            content: note.content && note.content.length > 50000 ? 
              note.content.substring(0, 50000) + "... [Content truncated due to size limit]" : 
              note.content
          }));
          const truncatedRaw = JSON.stringify({ v: truncatedNotes, t: Date.now() });
          const enc = b64e(xor(truncatedRaw, SECRET));
          const key = PREFIX + k;
          if (ls) ls.setItem(key, enc);
          else __mem[key] = enc;
          return;
        }
      }
      
      const enc = b64e(xor(raw, SECRET));
      const key = PREFIX + k;
      if (ls) ls.setItem(key, enc);
      else __mem[key] = enc;
    } catch (error) {
      console.warn(`Failed to save data for key "${k}":`, error);
    }
  },
  get<T>(k: string, fallback: T): T {
    try {
      const enc = ls ? ls.getItem(PREFIX + k) : __mem[PREFIX + k];
      if (!enc) return fallback;
      const dec = xor(b64d(enc), SECRET);
      const obj = JSON.parse(dec);
      return (obj?.v as T) ?? fallback;
    } catch (error) {
      console.warn(`Failed to load data for key "${k}":`, error);
      return fallback;
    }
  },
};

/* ──────────────────────────────────────────────────────────────────────────── */
type Theme = "light" | "dark";
type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  isDefault?: boolean; // cannot delete; content never persisted
  tags?: string[];
  category?: string;
  isPublic?: boolean;
  isArchived?: boolean;
  wordCount?: number;
  readingTime?: number;
};





const EditorContent = dynamic(() => import("@tiptap/react").then(m => m.EditorContent), {
  ssr: false,
  loading: () => <div className="min-h-[280px] rounded-lg border var-bd bg-[var(--panel)] animate-pulse" />,
});

/* Default "About me" note (non-deletable & non-persisted edits) */
const DEFAULT_DOC = `
<h1>Harsh Baldaniya</h1>

<p>Hi, I'm Harsh Baldaniya, a passionate Full Stack Developer and UI/UX Designer based in India. I specialize in creating modern, responsive web applications with a focus on user experience and clean code architecture.</p>

<p><strong>Professional Background:</strong></p>
<p>I have experience working on various projects ranging from small business websites to complex enterprise applications. My journey in web development started with a curiosity to build things that people actually use and love.</p>

<p><strong>What I Do:</strong></p>
<p>I love building innovative applications that solve real-world problems. My passion lies in creating intuitive user interfaces and seamless user experiences. I enjoy exploring new technologies and staying up-to-date with the latest trends in web development.</p>

<p><strong>Projects & Achievements:</strong></p>
<ul>
  <li>Built responsive web applications for various clients</li>
  <li>Developed custom CMS solutions</li>
  <li>Created mobile-first designs</li>
  <li>Optimized applications for performance and SEO</li>
  <li>Mentored junior developers</li>
</ul>

<p><strong>Personal Interests & Hobbies:</strong></p>
<p>When I'm not coding, I have a variety of interests that keep me engaged and inspired:</p>
<ul>
  <li><strong>Gaming:</strong> I love playing PC games, especially strategy games and RPGs. Gaming helps me think creatively and solve complex problems in different ways.</li>
  <li><strong>Music:</strong> I enjoy listening to different genres of music while working. It helps me stay focused and creative during long coding sessions.</li>
  <li><strong>Learning:</strong> I'm always eager to learn new things, whether it's a new programming language, framework, or even non-tech skills.</li>
  <li><strong>Reading:</strong> I love reading tech blogs, programming books, and staying updated with the latest industry trends.</li>
  <li><strong>Open Source:</strong> Contributing to open-source projects and sharing knowledge with the developer community.</li>
</ul>

<p><strong>Beyond Technology:</strong></p>
<p>I believe in maintaining a good work-life balance. When I take breaks from coding, I enjoy exploring new places, trying different cuisines, and spending time with friends and family. These experiences often inspire new ideas and perspectives that I bring back to my work.</p>

<p><strong>Contact & Social:</strong></p>
<p>I'm always open to discussing new opportunities, interesting projects, or just having a chat about technology, gaming, or music. Feel free to reach out if you'd like to collaborate or learn more about my work.</p>
`;

/* Helpers */
const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
function ordinal(n: number) {
  const s = ["th","st","nd","rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function formatHumanDate(ts: number) {
  const d = new Date(ts);
  return `${ordinal(d.getDate())} ${months[d.getMonth()]}, ${d.getFullYear()}`;
}
function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function calculateWordCount(content: string): number {
  const text = stripHtml(content);
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
}

function extractTags(content: string): string[] {
  const tagRegex = /#(\w+)/g;
  const matches = content.match(tagRegex);
  return matches ? [...new Set(matches.map(tag => tag.slice(1)))] : [];
}

function categorizeNote(content: string): string {
  const categories = {
    'work': ['meeting', 'project', 'deadline', 'task', 'work'],
    'personal': ['family', 'friend', 'home', 'personal', 'life'],
    'study': ['study', 'learn', 'course', 'book', 'research'],
    'ideas': ['idea', 'concept', 'thought', 'brainstorm', 'creative'],
  };
  
  const text = stripHtml(content).toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  return 'general';
}

/* ──────────────────────────────────────────────────────────────────────────── */
export default function NotesApp() {
  const rootRef = useRef<HTMLDivElement>(null);

  /* UI */
  const [theme, setTheme] = useState<Theme>(store.get<Theme>("ui_theme", "dark"));
  const [collapsed, setCollapsed] = useState<boolean>(store.get("ui_collapsed", false));
  const [search, setSearch] = useState("");
  const [showNoteStats, setShowNoteStats] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'warning' | 'error', message: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  /* Data */
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = store.get<Note[]>("notes", []);
    if (saved.length) return saved;
    const now = Date.now();
    return [
      {
        id: "default-1",
        title: "About Me",
        content: DEFAULT_DOC,
        createdAt: now,
        updatedAt: now,
        isDefault: true,
      },
    ];
  });

  const [activeId, setActiveId] = useState<string>(store.get("active", notes[0].id));
  const active = useMemo(() => notes.find(n => n.id === activeId) || notes[0], [notes, activeId]);

  /* Persist + theme class (never persist edits to default note) */
  useEffect(() => store.set("ui_theme", theme), [theme]);
  useEffect(() => store.set("ui_collapsed", collapsed), [collapsed]);
  useEffect(() => {
    const safe = notes.map(n => (n.isDefault ? { ...n, content: DEFAULT_DOC } : n));
    store.set("notes", safe);
  }, [notes]);
  useEffect(() => active && store.set("active", active.id), [active?.id]);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.classList.remove("light", "dark");
    el.classList.add(theme);
  }, [theme]);

  /* TipTap */
  const lastSaved = useRef<{ id?: string; html?: string }>({});
  const rafId = useRef<number | null>(null);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          bulletList: { 
            keepMarks: true, 
            keepAttributes: true,
            HTMLAttributes: {
              class: 'list-disc pl-6',
            },
          },
          orderedList: { 
            keepMarks: true, 
            keepAttributes: true,
            HTMLAttributes: {
              class: 'list-decimal pl-6',
            },
          },
          listItem: {
            HTMLAttributes: {
              class: 'my-1',
            },
          },
          paragraph: {
            HTMLAttributes: {
              class: 'my-2',
            },
          },
          hardBreak: false,
          horizontalRule: false,
        }),
        Underline,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Placeholder.configure({ placeholder: "Write your note…" }),
      ],
      content: active?.content || "<p></p>",
      immediatelyRender: false,
      autofocus: "end",
      editorProps: {
        handleKeyDown: (view, event) => {
          // Ensure single spacebar press works correctly
          if (event.key === ' ') {
            const { state } = view;
            const { selection } = state;
            const { $from } = selection;
            
            // Insert a single space at cursor position
            const tr = state.tr.insertText(' ');
            view.dispatch(tr);
            return true; // Prevent default behavior
          }
          return false;
        },
      },

      onUpdate: ({ editor }) => {
        if (!active) return;
        const html = editor.getHTML();
        if (lastSaved.current.id === active.id && lastSaved.current.html === html) return;
        
        // Check character limit (5000 characters)
        const textContent = stripHtml(html);
        const CHARACTER_LIMIT = 500;
        const WARNING_THRESHOLD = Math.floor(CHARACTER_LIMIT * 0.9); // 90% of limit
        
        // Show warning notification at 90% of limit
        if (textContent.length >= WARNING_THRESHOLD && textContent.length < CHARACTER_LIMIT) {
          const remaining = CHARACTER_LIMIT - textContent.length;
          setNotification({
            type: 'warning',
            message: `Approaching limit: ${remaining} characters remaining`
          });
          // Auto-hide warning after 3 seconds
          setTimeout(() => setNotification(null), 3000);
        }
        
        if (textContent.length > CHARACTER_LIMIT) {
          setNotification({
            type: 'error',
            message: 'Character limit exceeded! Content will be truncated.'
          });
          // Auto-hide error after 4 seconds
          setTimeout(() => setNotification(null), 4000);
          // Revert to previous content
          editor.commands.setContent(lastSaved.current.html || "<p></p>", { emitUpdate: false });
          return;
        }
        
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
          const wordCount = calculateWordCount(html);
          const readingTime = calculateReadingTime(wordCount);
          const tags = extractTags(html);
          const category = categorizeNote(html);
          
          setNotes(prev => prev.map(n => (n.id === active.id ? { 
            ...n, 
            content: html, 
            updatedAt: Date.now(),
            wordCount,
            readingTime,
            tags,
            category,
          } : n)));
          lastSaved.current = { id: active.id, html };
        });
      },
    },
    [], // keep deps stable
  );

  useEffect(() => {
    if (!editor || !active) return;
    editor.commands.setContent(active.content || "<p></p>", { emitUpdate: false });
    lastSaved.current = { id: active.id, html: active.content };
  }, [editor, active?.id, active?.content]);

  /* Actions */
  const createNote = () => {
    const now = Date.now();
    const n: Note = { id: "n_" + now, title: "Untitled", content: "<p></p>", createdAt: now, updatedAt: now };
    setNotes(prev => [n, ...prev]);
    setActiveId(n.id);
    setTimeout(() => (document.getElementById("title-input") as HTMLInputElement | null)?.focus(), 0);
  };

  const deleteNote = (id: string) => {
    const target = notes.find(n => n.id === id);
    if (target?.isDefault) return; // cannot delete default note
    
    // Show confirmation modal
    setNoteToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!noteToDelete) return;
    
    const rest = notes.filter(n => n.id !== noteToDelete);
    if (rest.length === 0) {
      const now = Date.now();
      const fresh: Note = { id: "n_" + now, title: "Untitled", content: "<p></p>", createdAt: now, updatedAt: now };
      setNotes([fresh]);
      setActiveId(fresh.id);
    } else {
      setNotes(rest);
      if (activeId === noteToDelete) setActiveId(rest[0].id);
    }
    
    // Close modal and reset
    setShowDeleteModal(false);
    setNoteToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setNoteToDelete(null);
  };

  const rename = (id: string, title: string) =>
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, title: title || "Untitled", updatedAt: Date.now() } : n)));

  const addTag = (noteId: string, tag: string) => {
    if (!tag.trim()) return;
    setNotes(prev => prev.map(n => {
      if (n.id === noteId) {
        const currentTags = n.tags || [];
        const newTags = [...new Set([...currentTags, tag.trim()])];
        return { ...n, tags: newTags, updatedAt: Date.now() };
      }
      return n;
    }));
    setNewTagInput("");
  };

  const removeTag = (noteId: string, tagToRemove: string) => {
    setNotes(prev => prev.map(n => {
      if (n.id === noteId) {
        const currentTags = n.tags || [];
        const newTags = currentTags.filter(tag => tag !== tagToRemove);
        return { ...n, tags: newTags, updatedAt: Date.now() };
      }
      return n;
    }));
  };

  /* Derived (filter + sort) */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? notes.filter(n => n.title.toLowerCase().includes(q)) : notes;
    return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, search]);

  /* Button that never steals selection (fixes list/bold/italic jumping) */
  const ToolBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = "", ...rest }) => (
    <button
      {...rest}
      onMouseDown={(e) => e.preventDefault()} // <-- keep caret/selection
      className={`btn ${className}`}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <div ref={rootRef} className="notes-root">
      {/* App header – always visible */}
      <header className="topbar">
        <div className="left">
          <button
            className="chip"
            onClick={() => setCollapsed(v => !v)}
            title={collapsed ? "Show sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <LuPanelLeftOpen className="ic" /> : <LuPanelLeftClose className="ic" />}
            <img src="/images/dock/note.png" alt="" className="w-4 h-4" />
            <span className="hide-sm">Notes</span>
          </button>
        </div>
        <div className="right">
          <button
            className="chip"
            onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          >
            {theme === "dark" ? <LuSun className="ic" /> : <LuMoon className="ic" />}
            <span className="hide-sm">{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </div>
      </header>

      {/* Main layout – only editor body scrolls */}
      <main className="layout" style={{ gridTemplateColumns: collapsed ? "64px 1fr" : "300px 1fr" }}>
        {/* Sidebar */}
        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          <div className="sidebar-top">
            <button className="primary" onClick={createNote} title="New note">
              <LuPlus className="ic" />
            </button>
            {!collapsed && (
              <div className="search">
                <LuSearch className="ic muted" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title…" />
              </div>
            )}
          </div>

          <div className="list">
            {filtered.map(n => (
              <button
                key={n.id}
                onClick={() => setActiveId(n.id)}
                className={`row ${active?.id === n.id ? "active" : ""}`}
                title={n.title || "Untitled"}
              >
                <div className="docicon" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M7 3h7l5 5v13H7V3z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

                {!collapsed && (
                  <div className="meta">
                    <div className="title truncate">
                      {n.title || "Untitled"}{n.isDefault ? "  · Default" : ""}
                    </div>
                    <div className="stamp">{formatHumanDate(n.updatedAt)}</div>
                    {n.tags && n.tags.length > 0 && (
                      <div className="tags-container">
                        {n.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="tag">
                            #{tag.toUpperCase()}
                          </span>
                        ))}
                        {n.tags.length > 2 && (
                          <span className="tag-more">+{n.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                    <div className="preview">{stripHtml(n.content).slice(0, 120)}</div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Editor pane */}
        <section className="pane">
          {active ? (
            <div className="surface">
              {/* Row 1: Toolbar (non-scrolling) */}
              <div className="toolbar">
                <ToolBtn
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={editor?.isActive("bold") ? "on" : ""}
                  title="Bold"
                  disabled={!editor}
                >
                  <LuBold className="ic" />
                </ToolBtn>

                <ToolBtn
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={editor?.isActive("italic") ? "on" : ""}
                  title="Italic"
                  disabled={!editor}
                >
                  <LuItalic className="ic" />
                </ToolBtn>

                <ToolBtn
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={editor?.isActive("underline") ? "on" : ""}
                  title="Underline"
                  disabled={!editor}
                >
                  <LuUnderline className="ic" />
                </ToolBtn>

                <div className="sep" />

                <ToolBtn
                  onClick={() => deleteNote(active.id)}
                  className={`danger ${active.isDefault ? "disabled" : ""}`}
                  title={active.isDefault ? "Default note can't be deleted" : "Delete note"}
                  disabled={active.isDefault}
                >
                  <LuTrash2 className="ic" />
                </ToolBtn>

                <ToolBtn
                  onClick={() => setShowTagModal(true)}
                  title="Manage Tags"
                >
                  <LuTag className="ic" />
                </ToolBtn>

                <ToolBtn
                  onClick={() => setShowNoteStats(!showNoteStats)}
                  className={showNoteStats ? "on" : ""}
                  title="Show Note Statistics"
                >
                  <LuBookmark className="ic" />
                </ToolBtn>

                <div className="sep" />
                <div className="ml-auto stamp">{formatHumanDate(active.updatedAt)}</div>
              </div>

              {/* Row 2: Titlebar (non-scrolling) */}
              <div className="titlebar">
                <input
                  id="title-input"
                  value={active.title}
                  onChange={e => rename(active.id, e.target.value)}
                  className="title-input"
                  placeholder="Untitled"
                />
                <div className="created">Created {formatHumanDate(active.createdAt)}</div>
                
                {showNoteStats && (
                  <div className="note-stats">
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-content">
                          <div className="stat-value">{active.wordCount || 0}</div>
                          <div className="stat-label">Words</div>
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-icon">⏱️</div>
                        <div className="stat-content">
                          <div className="stat-value">{active.readingTime || 0}</div>
                          <div className="stat-label">Min Read</div>
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-icon">🏷️</div>
                        <div className="stat-content">
                          <div className="stat-value">{active.tags?.length || 0}</div>
                          <div className="stat-label">Tags</div>
                        </div>
                      </div>
                    </div>
                    {active.tags && active.tags.length > 0 && (
                      <div className="stats-tags-section">
                        <div className="stats-tags-title">Tags</div>
                        <div className="stats-tags-grid">
                          {active.tags.map(tag => (
                            <span key={tag} className="stats-tag">#{tag.toUpperCase()}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Row 3: ONLY this scrolls */}
              <div className="doc-scroll">
                {editor && <EditorContent editor={editor} className="doc" />}
              </div>
            </div>
          ) : (
            <div className="empty">No note selected</div>
          )}
        </section>
      </main>

      {/* Professional Tag Modal */}
      {showTagModal && active && (
        <div className="modal-overlay" onClick={() => setShowTagModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Manage Tags</h3>
              <button 
                className="modal-close"
                onClick={() => setShowTagModal(false)}
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="tag-input-section">
                <div className="input-group">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Enter new tag..."
                    className="tag-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag(active.id, newTagInput);
                      }
                    }}
                  />
                  <button
                    onClick={() => addTag(active.id, newTagInput)}
                    className="add-tag-btn"
                    disabled={!newTagInput.trim()}
                  >
                    <LuPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="current-tags-section">
                <h4 className="section-title">Current Tags</h4>
                {active.tags && active.tags.length > 0 ? (
                  <div className="tags-grid">
                    {active.tags.map(tag => (
                      <div key={tag} className="tag-item">
                        <span className="tag-text">#{tag.toUpperCase()}</span>
                        <button
                          onClick={() => removeTag(active.id, tag)}
                          className="remove-tag-btn"
                        >
                          <LuX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-tags">No tags added yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification System */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === 'warning' ? '⚠️' : '❌'}
            </div>
            <div className="notification-message">
              {notification.message}
            </div>
            <button 
              className="notification-close"
              onClick={() => setNotification(null)}
            >
              <LuX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🗑️ Delete Note</h3>
              <button 
                className="modal-close"
                onClick={cancelDelete}
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="delete-content">
                <div className="delete-icon">⚠️</div>
                <h4 className="delete-title">Delete this note?</h4>
                <p className="delete-message">
                  This action cannot be undone.
                </p>
                <div className="delete-note-info">
                  <div className="note-preview">
                    {notes.find(n => n.id === noteToDelete)?.title || 'Untitled'}
                  </div>
                  <div className="note-stats">
                    Created {noteToDelete && notes.find(n => n.id === noteToDelete) ? formatHumanDate(notes.find(n => n.id === noteToDelete)!.createdAt) : ''}
                  </div>
                </div>
                <div className="delete-actions">
                  <button 
                    className="delete-cancel-btn"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </button>
                  <button 
                    className="delete-confirm-btn"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx global>{`
        .notes-root {
          --topbar-h: 52px;
          --bg: #0a0a0f;
          --text: #ffffff;
          --muted: #8b8b8b;
          --panel: #1a1a2e;
          --panel2: #16213e;
          --bd: rgba(255,255,255,.15);
          --bd-subtle: rgba(255,255,255,.1);
          --accent: #4f46e5;
          --accent-glow: rgba(79, 70, 229, 0.3);
          --danger: #ef4444;
          --success: #10b981;
          --warning: #f59e0b;
          /* fullscreen-safe height */
          height: 100vh;
          height: 100dvh;
          width: 100%;
          color: var(--text);
          background: linear-gradient(135deg, var(--bg) 0%, #1a1a2e 100%);
          display: flex; flex-direction: column;
          overflow: hidden;
          position: relative;
        }
        .notes-root.light {
          --bg: #f8fafc;
          --text: #1e293b;
          --muted: #64748b;
          --panel: #ffffff;
          --panel2: #f1f5f9;
          --bd: rgba(0,0,0,.15);
          --bd-subtle: rgba(0,0,0,.08);
          --accent: #3b82f6;
          --accent-glow: rgba(59, 130, 246, 0.2);
          --danger: #dc2626;
          --success: #059669;
          --warning: #d97706;
          background: linear-gradient(135deg, var(--bg) 0%, #e2e8f0 100%);
        }
        .var-bd { border-color: var(--bd); }

        .topbar {
          height: var(--topbar-h);
          display:flex; align-items:center; justify-content:space-between;
          padding:12px 20px; 
          border-bottom:1px solid var(--bd);
          background: color-mix(in oklab, var(--panel) 95%, transparent);
          backdrop-filter: blur(20px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          position: sticky; top: 0; z-index: 50;
        }
        .chip {
          display:inline-flex; align-items:center; gap:.5rem;
          border:1px solid var(--bd); 
          background: color-mix(in oklab, var(--panel) 40%, transparent);
          padding:.5rem .8rem; 
          border-radius:.8rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        .chip:hover { 
          background: color-mix(in oklab, var(--panel) 60%, transparent);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .ic { width:18px; height:18px }
        .hide-sm { display:none } @media (min-width:640px){ .hide-sm{display:inline} }

        /* fullscreen-safe inner height */
        .layout { 
          display:grid; 
          height: calc(100vh - var(--topbar-h));
          height: calc(100dvh - var(--topbar-h));
          overflow: hidden; 
        }

        .sidebar { 
          border-right:1px solid var(--bd); 
          background: var(--panel2);
          overflow:hidden;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
        }
        .sidebar-top { 
          display:flex; gap:12px; align-items:center; padding:16px; 
          border-bottom:1px solid var(--bd);
          background: color-mix(in oklab, var(--panel) 20%, transparent);
          backdrop-filter: blur(10px);
        }
        .primary { 
          width:40px; height:40px; 
          display:grid; place-items:center; 
          border-radius:12px; 
          background: linear-gradient(135deg, var(--accent) 0%, #6366f1 100%);
          color:#fff; 
          border:none;
          box-shadow: 0 4px 12px var(--accent-glow);
          transition: all 0.3s ease;
        }
        .primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--accent-glow);
        }
        .search { position:relative; flex:1; min-width:0 }
        .search .ic { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--muted) }
        .search input {
          width:100%; 
          padding:12px 16px 12px 40px; 
          border-radius:12px;
          background: color-mix(in oklab, var(--panel) 30%, transparent);
          border:1px solid var(--bd-subtle); 
          color:var(--text); 
          outline:none;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .search input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-glow);
          background: color-mix(in oklab, var(--panel) 50%, transparent);
        }

        .list { height:calc(100% - 72px); overflow:auto }
        .row { 
          display:flex; gap:12px; align-items:center; width:100%; text-align:left;
          padding:16px; 
          border-bottom:1px solid var(--bd-subtle); 
          background:transparent;
          color:inherit;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .row:hover { 
          background: color-mix(in oklab, var(--panel) 40%, transparent);
          transform: translateX(4px);
        }
        .row.active { 
          background: linear-gradient(135deg, var(--accent-glow) 0%, rgba(79, 70, 229, 0.1) 100%);
          border-left: 3px solid var(--accent);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }

        .docicon { 
          width:38px; height:38px; 
          border-radius:10px; 
          display:grid; place-items:center;
          background: color-mix(in oklab, var(--panel) 30%, transparent);
          border:1px solid var(--bd-subtle); 
          color:var(--muted); 
          flex:0 0 auto;
          backdrop-filter: blur(10px);
        }

        .meta { min-width:0 }
        .meta .title { font-weight:600; max-width:100% }
        .truncate { overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
        .stamp { color:var(--muted); font-size:11px }
        .preview { color:var(--muted); font-size:12px; margin-top:2px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden }

        .pane { 
          overflow:hidden; 
          position: relative; 
          min-height: 0;
          background: var(--panel);
        }
        /* KEY CHANGE: grid so only the last row scrolls */
        .surface { 
          height:100%; 
          display:grid; 
          grid-template-rows: auto auto 1fr; /* toolbar, title, editor */
          background: transparent;
          overflow:hidden; 
          position: relative; 
          min-height: 0; 
          max-height: 100vh;
        }

        /* Bars are regular blocks now (no sticky needed). They never scroll,
           because only the third row is scrollable. */
        .toolbar {
          display:flex; align-items:center; gap:10px; padding:16px 20px;
          border-bottom:1px solid var(--bd);
          background: color-mix(in oklab, var(--panel) 95%, transparent);
          backdrop-filter: blur(20px);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          min-height: 60px;
          flex-shrink: 0;
          position: relative;
          z-index: 10;
        }
        .btn {
          display:inline-grid; place-items:center; width:38px; height:38px;
          border:1px solid var(--bd); 
          border-radius:8px;
          background: color-mix(in oklab, var(--panel) 40%, transparent);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }
        .btn:hover { 
          background: color-mix(in oklab, var(--panel) 60%, transparent);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .btn.on { 
          background: linear-gradient(135deg, var(--accent-glow) 0%, rgba(79, 70, 229, 0.2) 100%);
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-glow), 0 4px 12px rgba(79, 70, 229, 0.3);
        }
        .btn:disabled { opacity:.5; cursor:not-allowed }
        .btn.danger { 
          color: var(--danger);
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
        }
        .btn.danger:hover {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
        }
        .btn.disabled { opacity:.45; cursor:not-allowed }
        .sep { width:1px; height:24px; background:var(--bd); margin:0 2px }
        .ml-auto { margin-left:auto }

        .titlebar {
          padding:20px 24px; 
          border-bottom:1px solid var(--bd);
          background: color-mix(in oklab, var(--panel) 90%, transparent);
          backdrop-filter: blur(15px);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          min-height: 90px;
          flex-shrink: 0;
          position: relative;
          z-index: 10;
        }
        .title-input {
          width:100%; 
          background:transparent; 
          border:none; 
          outline:none; 
          color:var(--text);
          font-weight:700; 
          font-size:clamp(20px, 3.5vw, 32px);
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .created { color:var(--muted); font-size:12px; margin-top:6px }

        /* ONLY the editor body can scroll */
        .doc-scroll { 
          min-height: 0;
          height: 300px;
          overflow: hidden; 
          padding: 0; 
          scroll-behavior: smooth;
          display: flex;
          justify-content: center;
          position: relative;
          background: transparent;
          border: none;
          border-radius: 0;
          margin: 0;
          box-shadow: none;
        }
        .doc { 
          color:var(--text); 
          line-height:1.65;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
          max-width: 800px;
          width: 100%;
          background: transparent;
          border-radius: 0;
          padding: 32px;
          border: none;
          box-shadow: none;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .doc h1,.doc h2,.doc h3 { font-weight:700; margin:1.1em 0 .6em }
        .doc h1 { font-size:1.9rem }
        .doc h2 { font-size:1.5rem }
        .doc h3 { font-size:1.25rem }
        .doc p { margin:.6em 0 }
        .doc ul { list-style: disc; padding-left:1.25rem; margin:.35rem 0 }
        .doc ol { list-style: decimal; padding-left:1.25rem; margin:.35rem 0 }
        .doc li { margin:.25rem 0; position: relative }
        .doc li:empty { min-height: 1.2em }
        .doc .ProseMirror-listitem { margin: .25rem 0 }
        .doc a { color: var(--accent); text-decoration: underline }
         
        /* ProseMirror editor content wrapping */
        .doc .ProseMirror {
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
          line-height: 1.65;
          outline: none;
          border: none;
          background: transparent;
          min-height: 200px;
          max-height: none;
          overflow: visible;
          word-spacing: normal;
          letter-spacing: normal;
          font-family: inherit;
          text-rendering: optimizeLegibility;
        }
        
        /* Ensure spaces are preserved */
        .doc .ProseMirror p {
          white-space: pre-wrap;
          word-break: normal;
          overflow-wrap: break-word;
        }
         
        .doc .ProseMirror p {
          margin: 0.6em 0;
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-spacing: normal;
          letter-spacing: normal;
          white-space: pre-wrap;
          word-break: normal;
        }

        /* Prevent TipTap from affecting the main layout */
        .doc .ProseMirror:focus {
          outline: none;
        }

        /* Ensure TipTap editor doesn't cause layout shifts */
        .doc .ProseMirror .is-editor-empty:first-child::before {
          color: var(--muted);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        /* Preserve whitespace and spaces */
        .doc .ProseMirror * {
          white-space: inherit;
        }
        
        /* Ensure text nodes preserve spaces */
        .doc .ProseMirror p br {
          display: inline;
        }
        
        /* Fix space rendering issues */
        .doc .ProseMirror p {
          white-space: pre-wrap !important;
        }
        
        /* Ensure spaces are not collapsed */
        .doc .ProseMirror .ProseMirror-content {
          white-space: pre-wrap;
        }

        .empty { height:100%; display:grid; place-items:center; color:var(--muted) }

        .list::-webkit-scrollbar { width:8px }
        .list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .list::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Enhanced scrollbar for doc */
        .doc::-webkit-scrollbar {
          width: 6px;
        }
        .doc::-webkit-scrollbar-track {
          background: transparent;
        }
        .doc::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .doc::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Tag System Styles */
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin: 4px 0;
        }
        .tag {
          background: color-mix(in oklab, var(--accent) 20%, transparent);
          color: var(--accent);
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
          border: 1px solid color-mix(in oklab, var(--accent) 30%, transparent);
        }
        .tag-more {
          background: color-mix(in oklab, var(--muted) 20%, transparent);
          color: var(--muted);
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: var(--panel);
          border: 1px solid var(--bd);
          border-radius: 12px;
          width: 90%;
          max-width: 480px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--bd);
        }
        .modal-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }
        .modal-close {
          background: transparent;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .modal-close:hover {
          background: color-mix(in oklab, var(--muted) 10%, transparent);
          color: var(--text);
        }
        .modal-body {
          padding: 24px;
        }
        .tag-input-section {
          margin-bottom: 24px;
        }
        .input-group {
          display: flex;
          gap: 8px;
        }
        .tag-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid var(--bd);
          border-radius: 8px;
          background: var(--panel2);
          color: var(--text);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .tag-input:focus {
          border-color: var(--accent);
        }
        .add-tag-btn {
          padding: 12px 16px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .add-tag-btn:hover:not(:disabled) {
          background: color-mix(in oklab, var(--accent) 90%, black);
        }
        .add-tag-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .current-tags-section {
          margin-top: 20px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 12px 0;
        }
        .tags-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tag-item {
          display: flex;
          align-items: center;
          gap: 6px;
          background: color-mix(in oklab, var(--accent) 15%, transparent);
          color: var(--accent);
          padding: 8px 12px;
          border-radius: 20px;
          border: 1px solid color-mix(in oklab, var(--accent) 25%, transparent);
        }
        .tag-text {
          font-size: 13px;
          font-weight: 500;
        }
        .remove-tag-btn {
          background: transparent;
          border: none;
          color: var(--accent);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .remove-tag-btn:hover {
          background: color-mix(in oklab, var(--accent) 20%, transparent);
        }
        .no-tags {
          color: var(--muted);
          font-size: 14px;
          text-align: center;
          padding: 20px;
          background: color-mix(in oklab, var(--panel2) 50%, transparent);
          border-radius: 8px;
          border: 1px dashed var(--bd);
        }

        /* Note Statistics Styles */
        .note-stats {
          margin-top: 16px;
          padding: 16px;
          background: color-mix(in oklab, var(--panel2) 80%, transparent);
          border: 1px solid var(--bd-subtle);
          border-radius: 12px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: var(--panel);
          border: 1px solid var(--bd-subtle);
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        .stat-card:hover {
          border-color: var(--accent);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .stat-icon {
          font-size: 20px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: color-mix(in oklab, var(--accent) 15%, transparent);
          border-radius: 8px;
        }
        .stat-content {
          flex: 1;
        }
        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          line-height: 1;
        }
        .stat-label {
          font-size: 11px;
          color: var(--muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }
        .stats-tags-section {
          border-top: 1px solid var(--bd-subtle);
          padding-top: 16px;
        }
        .stats-tags-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .stats-tags-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .stats-tag {
          background: color-mix(in oklab, var(--accent) 20%, transparent);
          color: var(--accent);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          border: 1px solid color-mix(in oklab, var(--accent) 30%, transparent);
        }

        /* Character Limit Modal Styles */
        .limit-modal {
          max-width: 500px;
        }
        .limit-content {
          text-align: center;
          padding: 20px 0;
        }
        .limit-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .limit-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 12px 0;
        }
        .limit-message {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.5;
          margin: 0 0 20px 0;
        }
        .limit-suggestions {
          background: color-mix(in oklab, var(--panel2) 80%, transparent);
          border: 1px solid var(--bd-subtle);
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          text-align: left;
        }
        .limit-suggestions h5 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 8px 0;
        }
        .limit-suggestions ul {
          margin: 0;
          padding-left: 20px;
        }
        .limit-suggestions li {
          color: var(--muted);
          font-size: 13px;
          margin: 4px 0;
        }
        .limit-btn {
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 16px;
        }
        .limit-btn:hover {
          background: color-mix(in oklab, var(--accent) 90%, black);
          transform: translateY(-1px);
        }

        /* Character Warning Modal Styles */
        .warning-modal {
          max-width: 500px;
        }
        .warning-content {
          text-align: center;
          padding: 20px 0;
        }
        .warning-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .warning-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--warning);
          margin: 0 0 12px 0;
        }
        .warning-message {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.5;
          margin: 0 0 20px 0;
        }
        .warning-progress {
          margin: 20px 0;
        }
        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--warning) 0%, #fbbf24 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .progress-text {
          font-size: 12px;
          color: var(--muted);
          font-weight: 500;
        }
        .warning-suggestions {
          background: color-mix(in oklab, var(--warning) 10%, transparent);
          border: 1px solid color-mix(in oklab, var(--warning) 20%, transparent);
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          text-align: left;
        }
        .warning-suggestions h5 {
          font-size: 14px;
          font-weight: 600;
          color: var(--warning);
          margin: 0 0 8px 0;
        }
        .warning-suggestions ul {
          margin: 0;
          padding-left: 20px;
        }
        .warning-suggestions li {
          color: var(--muted);
          font-size: 13px;
          margin: 4px 0;
        }
        .warning-btn {
          background: var(--warning);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 16px;
        }
        .warning-btn:hover {
          background: color-mix(in oklab, var(--warning) 90%, black);
          transform: translateY(-1px);
        }

        /* Professional Notification System Styles */
        .notification {
          position: fixed;
          top: 100px;
          right: 24px;
          z-index: 1000;
          max-width: 380px;
          animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          border-radius: 16px;
          overflow: hidden;
        }
        
        .notification.warning {
          background: rgba(26, 26, 46, 0.95);
          border: 1px solid rgba(245, 158, 11, 0.3);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(245, 158, 11, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
        }
        
        .notification.error {
          background: rgba(26, 26, 46, 0.95);
          border: 1px solid rgba(239, 68, 68, 0.3);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(239, 68, 68, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
        }
        
        .notification-content {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          position: relative;
        }
        
        .notification-content::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, var(--warning) 0%, #fbbf24 100%);
        }
        
        .notification.error .notification-content::before {
          background: linear-gradient(180deg, var(--danger) 0%, #dc2626 100%);
        }
        
        .notification-icon {
          font-size: 24px;
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .notification-message {
          flex: 1;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.5;
          color: var(--text);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .notification-close {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 8px;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          backdrop-filter: blur(10px);
        }
        
        .notification-close:hover {
          background: rgba(255, 255, 255, 0.2);
          color: var(--text);
          transform: scale(1.05);
          border-color: rgba(255, 255, 255, 0.3);
        }
        
        @keyframes slideInRight {
          0% {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateX(-10px) scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        /* Delete Confirmation Modal Styles */
        .delete-modal {
          max-width: 360px;
        }
        .delete-content {
          text-align: center;
          padding: 16px 0;
        }
        .delete-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }
        .delete-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--danger);
          margin: 0 0 8px 0;
        }
        .delete-message {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.4;
          margin: 0 0 16px 0;
        }
        .delete-note-info {
          background: color-mix(in oklab, var(--panel2) 60%, transparent);
          border: 1px solid var(--bd-subtle);
          border-radius: 8px;
          padding: 12px;
          margin: 16px 0;
          text-align: left;
        }
        .note-preview {
          font-size: 14px;
          color: var(--text);
          margin-bottom: 4px;
          font-weight: 500;
        }
        .note-stats {
          font-size: 12px;
          color: var(--muted);
        }
        .delete-actions {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-top: 16px;
        }
        .delete-cancel-btn {
          background: color-mix(in oklab, var(--panel2) 60%, transparent);
          color: var(--text);
          border: 1px solid var(--bd);
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 80px;
        }
        .delete-cancel-btn:hover {
          background: color-mix(in oklab, var(--panel2) 40%, transparent);
          border-color: var(--accent);
          transform: translateY(-1px);
        }
        .delete-confirm-btn {
          background: linear-gradient(135deg, var(--danger) 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 90px;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
        }
        .delete-confirm-btn:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  );
}
