"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  HiChevronLeft, HiChevronRight, HiRefresh, HiBookmark, HiPlus, HiX,
  HiStar, HiSearch, HiClock, HiDownload, HiPhotograph, HiMicrophone,
  HiShieldExclamation, HiPlay
} from "react-icons/hi";
import { BiStar } from "react-icons/bi";
import { secureStore } from "@/lib/secureStore";

/* ──────────────────────────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────────────────────────── */
type SearchType = "all" | "images" | "videos";

type Tab = {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading: boolean;
  isBookmarked: boolean;
  isSearchPane?: boolean;
  blockedEmbed?: boolean;
  readerMode?: boolean;
  readerHtml?: string;
  // NEW: real per-tab navigation
  history: string[];
  historyIndex: number;
};

type Bookmark = { id: string; title: string; url: string; favicon?: string };
type HistoryItem = { id: string; title: string; url: string; favicon?: string; ts: number };

/* ──────────────────────────────────────────────────────────────────────────────
   Config & helpers
────────────────────────────────────────────────────────────────────────────── */

const HAS_SERP = !!process.env.NEXT_PUBLIC_SERPAPI_KEY;
const HOME_URL = "about:home";
const STORAGE_KEY = "chrome.v1";

function normalizeInput(input: string): { mode: "url" | "query"; value: string } {
  const s = input.trim();
  if (!s) return { mode: "query", value: "" };
  const looksLikeUrl =
    /^(https?:\/\/)/i.test(s) ||
    (/^[\w.-]+\.[a-z]{2,}$/i.test(s) && !s.includes(" "));
  return looksLikeUrl
    ? { mode: "url", value: s.startsWith("http") ? s : `https://${s}` }
    : { mode: "query", value: s };
}

function faviconFor(u: string) {
  try { return `https://${new URL(u).hostname}/favicon.ico`; } catch { return undefined; }
}
function hostTitle(u: string) {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; }
}
function computeCanGo(tab: Tab) {
  return {
    canGoBack: tab.historyIndex > 0,
    canGoForward: tab.historyIndex < tab.history.length - 1,
  };
}

// Turn known video pages into embeddable players
function toEmbeddableUrl(u: string): string | null {
  try {
    const url = new URL(u);
    const h = url.hostname.replace(/^www\./, "").toLowerCase();

    // YouTube long URL
    if (h.endsWith("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}?autoplay=1&rel=0`;
      const mShort = url.pathname.match(/^\/shorts\/([^/]+)/);
      if (mShort?.[1]) return `https://www.youtube-nocookie.com/embed/${mShort[1]}?autoplay=1&rel=0`;
    }
    // youtu.be/ID
    if (h === "youtu.be") {
      const id = url.pathname.replace(/^\//, "");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    }
    // Vimeo
    if (h.endsWith("vimeo.com")) {
      const m = url.pathname.match(/\/(\d+)/);
      if (m?.[1]) return `https://player.vimeo.com/video/${m[1]}`;
    }
    return null;
  } catch { return null; }
}

// Reader proxy fallback for CSP-blocked pages
const readerProxyUrl = (u: string) => `https://r.jina.ai/${u}`;
const READER_CSS = `
  body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.6;margin:0;padding:16px;max-width:900px}
  img,video{max-width:100%;height:auto} pre,code{white-space:pre-wrap;word-wrap:break-word}
  a{color:#2563eb;text-decoration:none}a:hover{text-decoration:underline}
`;

// Debounce for persistence
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let t: NodeJS.Timeout | undefined;
  return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ──────────────────────────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────────────────────────── */

export default function ChromeApp() {
  const [tabs, setTabs] = useState<Tab[]>([{
    id: "t1",
    title: "New Tab",
    url: HOME_URL,
    favicon: undefined,
    isLoading: false,
    isBookmarked: false,
    isSearchPane: false,
    blockedEmbed: false,
    readerMode: false,
    readerHtml: undefined,
    history: [HOME_URL],
    historyIndex: 0,
  }]);
  const [activeId, setActiveId] = useState("t1");
  const [address, setAddress] = useState("");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [zoom, setZoom] = useState(100);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);

  // Results UI
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [inlineQuery, setInlineQuery] = useState<string>("");

  // Error banners
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [planError, setPlanError]   = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const addressRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = useMemo(() => tabs.find(t => t.id === activeId)!, [tabs, activeId]);
  const { canGoBack, canGoForward } = computeCanGo(activeTab);

  /* ── Load persisted snapshot ─────────────────────────────────────────────── */
  useEffect(() => {
    const snap = secureStore.get<{
      tabs?: Tab[];
      activeId?: string;
      address?: string;
      bookmarks?: Bookmark[];
      history?: HistoryItem[];
      zoom?: number;
      searchType?: SearchType;
      inlineQuery?: string;
    }>(STORAGE_KEY);
    if (!snap) return;
    const {
      tabs: t, activeId: a, address: adr, bookmarks: bm, history: hs, zoom: z,
      searchType: st, inlineQuery: iq
    } = snap;
    if (Array.isArray(t) && t.length) setTabs(t);
    if (a) setActiveId(a);
    if (typeof adr === "string") setAddress(adr);
    if (Array.isArray(bm)) setBookmarks(bm);
    if (Array.isArray(hs)) setHistory(hs);
    if (typeof z === "number") setZoom(z);
    if (st) setSearchType(st);
    if (typeof iq === "string") setInlineQuery(iq);
  }, []);

  /* ── Persist on change (debounced) ───────────────────────────────────────── */
  const persist = useRef(debounce((payload: {
    tabs: Tab[];
    activeId: string;
    address: string;
    bookmarks: Bookmark[];
    history: HistoryItem[];
    zoom: number;
    searchType: SearchType;
    inlineQuery: string;
  }) => {
    try { secureStore.set(STORAGE_KEY, payload); } catch {}
  }, 250)).current;

  useEffect(() => {
    persist({ tabs, activeId, address, bookmarks, history, zoom, searchType, inlineQuery });
  }, [tabs, activeId, address, bookmarks, history, zoom, searchType, inlineQuery, persist]);

  /* Tabs */

  const createTab = (url?: string, fromQuery?: string) => {
    const id = `t${Date.now()}`;
    const initialUrl = url ?? HOME_URL;
    const t: Tab = {
      id,
      title: fromQuery ? `Search: ${fromQuery}` : "New Tab",
      url: initialUrl,
      favicon: url ? faviconFor(url) : undefined,
      isLoading: !!url && !initialUrl.startsWith("about:"),
      isBookmarked: false,
      isSearchPane: false,
      blockedEmbed: false,
      readerMode: false,
      readerHtml: undefined,
      history: [initialUrl],
      historyIndex: 0,
    };
    setTabs(prev => [...prev, t]);
    setActiveId(id);
    setAddress(url ? url : "");
  };

  const closeTab = (id: string) => {
    setTabs(prev => {
      if (prev.length === 1) return prev;
      const idx = prev.findIndex(t => t.id === id);
      const next = prev.filter(t => t.id !== id);
      if (activeId === id) {
        const newActive = next[Math.min(idx, next.length - 1)];
        setActiveId(newActive.id);
        setAddress(newActive.url.startsWith("about:home") ? "" : (newActive.isSearchPane ? "" : newActive.url));
      }
      return next;
    });
  };

  const switchTab = (id: string) => {
    const t = tabs.find(x => x.id === id);
    if (!t) return;
    setActiveId(id);
    setAddress(t.isSearchPane || t.url.startsWith("about:home") ? "" : t.url);
  };

  /* Navigation & Search */

  function pushToTabHistory(tab: Tab, newUrl: string): Tab {
    const trimmed = tab.history.slice(0, tab.historyIndex + 1);
    trimmed.push(newUrl);
    const idx = trimmed.length - 1;
    return { ...tab, history: trimmed, historyIndex: idx };
  }

  const navigate = (input: string) => {
    setQuotaError(null);
    setPlanError(null);
    setSearchError(null);
    const { mode, value } = normalizeInput(input);

    // Google search pages won't embed – route to internal home/search
    if (mode === "url") {
      try {
        const h = new URL(value).hostname;
        if (/google\./i.test(h)) {
          setTabs(prev => prev.map(t => t.id === activeId ? ({
            ...t, url: HOME_URL, isSearchPane: false, isLoading: false, title: "New Tab",
            blockedEmbed: false, readerMode: false, readerHtml: undefined,
            history: [HOME_URL], historyIndex: 0
          }) : t));
          setAddress("");
          return;
        }
      } catch {}
    }

    if (mode === "url") {
      // Try to rewrite to an embeddable player
      const embed = toEmbeddableUrl(value);
      const finalUrl = embed || value;

      setTabs(prev => prev.map(t => {
        if (t.id !== activeId) return t;
        const pushed = pushToTabHistory(t, finalUrl);
        return {
          ...pushed,
          url: finalUrl,
          title: hostTitle(value),
          favicon: faviconFor(value),
          isLoading: !finalUrl.startsWith("about:"),
          isSearchPane: false,
          blockedEmbed: false,
          readerMode: false,
          readerHtml: undefined,
        };
      }));
      setAddress(value);
    } else {
      // Native search pane
      const about = `about:search#${encodeURIComponent(value)}`;
      setTabs(prev => prev.map(t => {
        if (t.id !== activeId) return t;
        const pushed = pushToTabHistory(t, about);
        return {
          ...pushed,
          title: `Search: ${value}`,
          url: about,
          isLoading: false,
          isSearchPane: true,
          blockedEmbed: false,
          readerMode: false,
          readerHtml: undefined,
        };
      }));
      setAddress(value);
      setInlineQuery(value);
      runSearch(value, searchType);
    }
  };

  const goHome = () => {
    setTabs(prev => prev.map(t => {
      if (t.id !== activeId) return t;
      const pushed = pushToTabHistory(t, HOME_URL);
      return { ...pushed, url: HOME_URL, isSearchPane: false, isLoading: false, title: "New Tab",
        blockedEmbed: false, readerMode: false, readerHtml: undefined };
    }));
    setAddress("");
    setInlineQuery("");
  };

  const goBack = () => {
    const t = tabs.find(x => x.id === activeId);
    if (!t || t.historyIndex <= 0) return;
    const idx = t.historyIndex - 1;
    const url = t.history[idx];
    setTabs(prev => prev.map(x => x.id === activeId ? ({
      ...x,
      historyIndex: idx,
      url,
      isLoading: !url.startsWith("about:"),
      isSearchPane: url.startsWith("about:search#"),
      blockedEmbed: false, readerMode: false, readerHtml: undefined,
      title: url.startsWith("about:search#") ? `Search: ${decodeURIComponent(url.split("#")[1] || "")}` : hostTitle(url),
      favicon: faviconFor(url),
    }) : x));
    setAddress(url.startsWith("about:home") || url.startsWith("about:search#") ? "" : url);
  };

  const goForward = () => {
    const t = tabs.find(x => x.id === activeId);
    if (!t || t.historyIndex >= t.history.length - 1) return;
    const idx = t.historyIndex + 1;
    const url = t.history[idx];
    setTabs(prev => prev.map(x => x.id === activeId ? ({
      ...x,
      historyIndex: idx,
      url,
      isLoading: !url.startsWith("about:"),
      isSearchPane: url.startsWith("about:search#"),
      blockedEmbed: false, readerMode: false, readerHtml: undefined,
      title: url.startsWith("about:search#") ? `Search: ${decodeURIComponent(url.split("#")[1] || "")}` : hostTitle(url),
      favicon: faviconFor(url),
    }) : x));
    setAddress(url.startsWith("about:home") || url.startsWith("about:search#") ? "" : url);
  };

  const refresh = () => {
    setTabs(prev => prev.map(t => t.id === activeId ? ({
      ...t, isLoading: !t.url.startsWith("about:"), blockedEmbed: false, readerMode: false, readerHtml: undefined
    }) : t));
  };

  /* Bookmarks & global history */

  const toggleBookmark = () => {
    const t = activeTab;
    if (!t) return;
    if (t.isBookmarked) {
      setBookmarks(prev => prev.filter(b => b.url !== t.url));
      setTabs(prev => prev.map(x => x.id === activeId ? ({ ...x, isBookmarked: false }) : x));
    } else {
      setBookmarks(prev => [...prev, { id: `b${Date.now()}`, title: t.title || hostTitle(t.url), url: t.url, favicon: t.favicon }]);
      setTabs(prev => prev.map(x => x.id === activeId ? ({ ...x, isBookmarked: true }) : x));
    }
  };

  const pushHistory = (t: Tab) => {
    if (t.url.startsWith("about:")) return;
    setHistory(prev => [
      { id: `h${Date.now()}`, title: t.title || hostTitle(t.url), url: t.url, favicon: t.favicon, ts: Date.now() },
      ...prev,
    ].slice(0, 300));
  };

  /* Shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const k = e.key.toLowerCase();
        if (k === "l") { e.preventDefault(); addressRef.current?.focus(); addressRef.current?.select(); }
        if (k === "t") { e.preventDefault(); createTab(); }
        if (k === "w") { e.preventDefault(); closeTab(activeId); }
        if (k === "r") { e.preventDefault(); refresh(); }
        if (k === "d") { e.preventDefault(); toggleBookmark(); }
        if (k === "h") { e.preventDefault(); goHome(); }
        if (k === "[" || (k === "arrowleft" && e.altKey)) { e.preventDefault(); goBack(); }
        if (k === "]" || (k === "arrowright" && e.altKey)) { e.preventDefault(); goForward(); }
        if (k === "+" || k === "=") { e.preventDefault(); setZoom(z => Math.min(z + 10, 200)); }
        if (k === "-") { e.preventDefault(); setZoom(z => Math.max(z - 10, 50)); }
        if (k === "0") { e.preventDefault(); setZoom(100); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeId]);

  /* Iframe load detection + reader fallback */
  useEffect(() => {
    const t = activeTab;
    if (!t || t.isSearchPane || t.url.startsWith("about:")) return;
    if (!t.isLoading) return;

    let done = false;

    const onLoad = () => {
      if (done) return;
      done = true;
      setTabs(prev => prev.map(x => x.id === activeId ? ({
        ...x,
        isLoading: false,
        blockedEmbed: false,
        readerMode: false,
        readerHtml: undefined,
        title: x.title || hostTitle(x.url),
      }) : x));
      const next = tabs.find(x => x.id === activeId);
      if (next) pushHistory({ ...next, isLoading: false });
    };

    const el = iframeRef.current;
    el?.addEventListener("load", onLoad);

    const guard = window.setTimeout(async () => {
      if (done) return;
      try {
        const res = await fetch(readerProxyUrl(t.url), { cache: "no-store" });
        const text = await res.text();
        const html = `<!doctype html><html><head><meta charset="utf-8"><style>${READER_CSS}</style></head><body>${text}</body></html>`;
        setTabs(prev => prev.map(x => x.id === activeId ? ({
          ...x,
          isLoading: false,
          blockedEmbed: true,
          readerMode: true,
          readerHtml: html,
        }) : x));
      } catch {
        setTabs(prev => prev.map(x => x.id === activeId ? ({
          ...x,
          isLoading: false,
          blockedEmbed: true,
          readerMode: false,
          readerHtml: undefined,
        }) : x));
      }
    }, 2500);

    return () => {
      el?.removeEventListener("load", onLoad);
      window.clearTimeout(guard);
    };
  }, [activeId, activeTab.url, activeTab.isLoading, activeTab.isSearchPane, tabs]);

  /* Search (via API route) */

  const [searchResults, setSearchResults] = useState<Array<{
    title: string;
    url: string;
    snippet: string;
    site: string;
  }>>([]);
  const [imageResults, setImageResults] = useState<Array<{
    thumbnail: string;
    original: string;
    link: string;
    source: string;
    title: string;
  }>>([]);
  const [videoResults, setVideoResults] = useState<Array<{
    title: string;
    url: string;
    thumbnail: string;
    source: string;
    snippet: string;
    duration?: string;
  }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  function extractDuration(exts?: string[] | undefined): string | undefined {
    if (!exts) return undefined;
    return exts.find(e => /^\d{1,2}:\d{2}(:\d{2})?$/.test(e));
  }

  async function runSearch(query: string, type: SearchType) {
    setSearchLoading(true);
    setQuotaError(null);
    setPlanError(null);
    setSearchError(null);
    setSearchResults([]);
    setImageResults([]);
    setVideoResults([]);

    try {
      if (!HAS_SERP) {
        setSearchError("Search API is not configured.");
        return;
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`, { cache: "no-store" });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        setQuotaError(data?.message || "You’ve reached today’s free search limit. Try again tomorrow.");
        return;
      }
      if (res.status === 402) {
        const data = await res.json().catch(() => ({}));
        setPlanError(data?.message || "Your SerpAPI plan limit has been reached.");
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (type === "images") {
        const items = (json.images_results || []).map((r: { thumbnail: string; original: string; link: string; title: string }) => ({
          thumbnail: r.thumbnail, original: r.original, link: r.link, source: hostTitle(r.link), title: r.title
        }));
        setImageResults(items);
      } else if (type === "videos") {
        const items = (json.video_results || []).map((r: { 
          title: string; 
          link: string; 
          thumbnail?: { static?: string } | string; 
          source?: string; 
          snippet?: string; 
          description?: string;
          rich_snippet?: { top?: { extensions?: string[] } };
        }) => ({
          title: r.title,
          url: r.link,
          thumbnail: typeof r.thumbnail === 'object' ? r.thumbnail?.static || '' : r.thumbnail || '',
          source: r.source || hostTitle(r.link),
          snippet: r.snippet || r.description || '',
          duration: extractDuration(r?.rich_snippet?.top?.extensions),
        }));
        setVideoResults(items);
      } else {
        const items = (json.organic_results || []).map((r: { title: string; link: string; snippet: string }) => ({
          title: r.title, url: r.link, snippet: r.snippet, site: hostTitle(r.link)
        }));
        setSearchResults(items);
      }
    } catch (e: any) {
      setSearchError(e?.message || "Failed to fetch");
    } finally {
      setSearchLoading(false);
    }
  }

  // When switching between All/Images/Videos, run again with same query
  useEffect(() => {
    const t = activeTab;
    if (!t?.isSearchPane) return;
    const q = inlineQuery || (address && !t.url.startsWith("about:search#")
      ? address
      : decodeURIComponent((t.url.split("#")[1] || "").trim()));
    if (q) runSearch(q, searchType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchType]);

  /* Render */

  return (
    <div className="w-full h-full flex flex-col bg-white text-gray-900">
      {/* Toolbar (Chrome-like) */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-0.5">
          <button onClick={goBack}    disabled={!canGoBack} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50" title="Back"><HiChevronLeft className="w-5 h-5" /></button>
          <button onClick={goForward} disabled={!canGoForward} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50" title="Forward"><HiChevronRight className="w-5 h-5" /></button>
          <button onClick={refresh} className="p-2 rounded-full hover:bg-gray-100" title="Reload"><HiRefresh className={`w-5 h-5 ${activeTab.isLoading ? "animate-spin" : ""}`} /></button>
          <button onClick={goHome} className="p-2 rounded-full hover:bg-gray-100" title="Home">🏠</button>
        </div>

        {/* Omnibox */}
        <div className="flex-1">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={addressRef}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(address); }}
              placeholder={"Search Google or type a URL"}
              className="w-full pl-9 pr-12 py-2.5 bg-gray-50 rounded-full border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none text-sm"
            />
            <HiMicrophone className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <button onClick={toggleBookmark} className={`p-2 rounded-full hover:bg-gray-100 ${activeTab.isBookmarked ? "text-yellow-500" : ""}`} title="Bookmark">
            {activeTab.isBookmarked ? <HiStar className="w-5 h-5" /> : <BiStar className="w-5 h-5" />}
          </button>
          <button onClick={() => setShowBookmarks(s => !s)} className="p-2 rounded-full hover:bg-gray-100" title="Bookmarks"><HiBookmark className="w-5 h-5" /></button>
          <button onClick={() => setShowHistory(s => !s)}   className="p-2 rounded-full hover:bg-gray-100" title="History"><HiClock className="w-5 h-5" /></button>
          <button onClick={() => setShowDownloads(s => !s)} className="p-2 rounded-full hover:bg-gray-100" title="Downloads"><HiDownload className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Tabs row */}
      <div className="flex items-center bg-gray-50 border-b border-gray-200">
        <div className="flex items-center flex-1 overflow-x-auto">
          {tabs.map(tab => (
            <div key={tab.id} className={`flex items-center gap-2 px-4 py-2 min-w-0 max-w-48 cursor-pointer border-r border-gray-200 ${activeId === tab.id ? "bg-white shadow-sm" : "hover:bg-gray-100"}`} onClick={() => switchTab(tab.id)} title={tab.url}>
              {tab.favicon ? <img src={tab.favicon} className="w-4 h-4" alt="" /> : <span className="w-4 h-4 rounded bg-gray-300" />}
              <span className="text-sm truncate flex-1">{tab.title || hostTitle(tab.url)}</span>
              <button onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }} className="w-5 h-5 rounded-full hover:bg-gray-300 flex items-center justify-center"><HiX className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
        <button onClick={() => createTab()} className="p-2 hover:bg-gray-200 rounded-full" title="New tab"><HiPlus className="w-5 h-5" /></button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {(showBookmarks || showHistory || showDownloads) && (
          <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
            <div className="p-3 border-b border-gray-200 font-semibold text-sm">
              {showBookmarks ? "Bookmarks" : showHistory ? "History" : "Downloads"}
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {showBookmarks && (
                <div className="space-y-1">
                  {bookmarks.length === 0 && <div className="text-xs text-gray-500 px-2 py-4">No bookmarks yet</div>}
                  {bookmarks.map(b => (
                    <button key={b.id} onClick={() => { setShowBookmarks(false); setAddress(b.url); navigate(b.url); }} className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-200 text-left">
                      {b.favicon ? <img src={b.favicon} className="w-4 h-4" alt="" /> : <div className="w-4 h-4 bg-gray-300 rounded" />}
                      <div className="min-w-0">
                        <div className="text-sm truncate">{b.title}</div>
                        <div className="text-[11px] text-gray-500 truncate">{b.url}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showHistory && (
                <div className="space-y-1">
                  {history.length === 0 && <div className="text-xs text-gray-500 px-2 py-4">No history yet</div>}
                  {history.map(h => (
                    <button key={h.id} onClick={() => { setShowHistory(false); setAddress(h.url); navigate(h.url); }} className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-200 text-left">
                      {h.favicon ? <img src={h.favicon} className="w-4 h-4" alt="" /> : <div className="w-4 h-4 bg-gray-300 rounded" />}
                      <div className="min-w-0">
                        <div className="text-sm truncate">{h.title}</div>
                        <div className="text-[11px] text-gray-500 truncate">{h.url}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showDownloads && (
                <div className="text-xs text-gray-500 px-2 py-4 flex flex-col items-center">
                  <HiDownload className="w-8 h-8 mb-2 opacity-60" />
                  No downloads in this demo
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 relative overflow-hidden">
          {/* HOME */}
          {activeTab.url.startsWith("about:home") ? (
            <div className="absolute inset-0 overflow-auto">
              <div className="max-w-xl mx-auto p-10 text-center">
                <div className="text-3xl font-semibold mb-6">Google Chrome</div>
                <div className="flex shadow-sm rounded-full border border-gray-200 overflow-hidden">
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") navigate(address); }}
                    placeholder="Search Google or type a URL"
                    className="flex-1 px-5 py-3 outline-none"
                  />
                  <button onClick={() => navigate(address)} className="px-5 bg-blue-600 text-white">Search</button>
                </div>
                <div className="text-xs text-gray-500 mt-3">Powered by Google • Some websites can’t be shown inside this window due to their security settings.</div>
              </div>
            </div>
          ) : activeTab.isSearchPane ? (
            // SEARCH RESULTS (All | Images | Videos) + INLINE SEARCH BAR
            <div className="absolute inset-0 overflow-auto">
              <div className="max-w-4xl mx-auto p-4">
                {/* Inline search (Chrome-like) */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 relative">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={inlineQuery}
                      onChange={(e) => setInlineQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && inlineQuery.trim()) {
                          const q = inlineQuery.trim();
                          setAddress(q);
                          setTabs(prev => prev.map(t => {
                            if (t.id !== activeId) return t;
                            const about = `about:search#${encodeURIComponent(q)}`;
                            const pushed = pushToTabHistory(t, about);
                            return { ...pushed, title: `Search: ${q}`, url: about, isSearchPane: true, isLoading: false };
                          }));
                          runSearch(q, searchType);
                        }
                      }}
                      placeholder="Search Google"
                      className="w-full pl-9 pr-12 py-2.5 bg-white rounded-full border border-gray-200 focus:border-blue-500 focus:outline-none text-sm"
                    />
                    <HiMicrophone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>

                  {/* Tabs: All / Images / Videos */}
                  <div className="flex items-center gap-1 rounded-full border border-gray-200 p-1 bg-white">
                    <button onClick={() => setSearchType("all")} className={`px-3 py-1 text-sm rounded-full ${searchType === "all" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}>All</button>
                    <button onClick={() => setSearchType("images")} className={`px-3 py-1 text-sm rounded-full ${searchType === "images" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}><div className="flex items-center gap-1"><HiPhotograph className="w-4 h-4" />Images</div></button>
                    <button onClick={() => setSearchType("videos")} className={`px-3 py-1 text-sm rounded-full ${searchType === "videos" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}><div className="flex items-center gap-1"><HiPlay className="w-4 h-4" />Videos</div></button>
                  </div>
                </div>

                {/* Error banners */}
                {quotaError && (
                  <div className="mt-2 mb-3 flex items-start gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-900">
                    <div className="mt-0.5"><HiShieldExclamation className="w-5 h-5" /></div>
                    <div className="text-sm">
                      <div className="font-medium">Daily limit reached</div>
                      <div className="opacity-90">You’ve reached today’s free search limit. Try again tomorrow.</div>
                    </div>
                  </div>
                )}
                {planError && (
                  <div className="mt-2 mb-3 flex items-start gap-3 p-3 rounded-xl border border-purple-200 bg-purple-50 text-purple-900">
                    <div className="mt-0.5"><HiShieldExclamation className="w-5 h-5" /></div>
                    <div className="text-sm">
                      <div className="font-medium">Plan limit reached</div>
                      <div className="opacity-90">Your SerpAPI plan limit has been reached.</div>
                    </div>
                  </div>
                )}

                {/* Loading skeleton */}
                {searchLoading && (
                  <div className="mt-6 space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-full" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Fetch error */}
                {searchError && !searchLoading && !quotaError && !planError && (
                  <div className="mt-6 p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm">
                    {searchError}
                  </div>
                )}

                {/* Results */}
                {!searchLoading && !searchError && !quotaError && !planError && (
                  <>
                    {searchType === "all" && (
                      <div className="space-y-6 mt-4">
                        {searchResults.length === 0 && <div className="text-sm text-gray-500">No results</div>}
                        {searchResults.map((r, i) => (
                          <div key={i} className="group">
                            <button onClick={() => { setAddress(r.url); navigate(r.url); }} className="text-blue-600 hover:underline text-lg text-left">
                              {r.title}
                            </button>
                            <div className="text-xs text-gray-500">{r.site}</div>
                            <div className="text-sm text-gray-700 mt-1">{r.snippet}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchType === "images" && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {imageResults.length === 0 && <div className="text-sm text-gray-500">No images</div>}
                        {imageResults.map((img, i) => (
                          <a key={i} href={img.link} target="_blank" rel="noreferrer" className="block group">
                            <img src={img.thumbnail || img.original} alt={img.title || ""} className="w-full h-28 object-cover rounded-lg border border-gray-200 group-hover:opacity-90" />
                            <div className="mt-1 text-[11px] text-gray-500 truncate">{img.source}</div>
                          </a>
                        ))}
                      </div>
                    )}

                    {searchType === "videos" && (
                      <div className="mt-4 space-y-4">
                        {videoResults.length === 0 && <div className="text-sm text-gray-500">No videos</div>}
                        {videoResults.map((v, i) => (
                          <div key={i} className="flex gap-3">
                            <button
                              onClick={() => { setAddress(v.url); navigate(v.url); }}
                              className="relative w-48 shrink-0 group"
                              title="Play"
                            >
                              <img src={v.thumbnail} alt="" className="w-48 h-28 object-cover rounded-lg border border-gray-200" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="p-2 rounded-full bg-black/50 text-white opacity-90 group-hover:scale-105 transition"><HiPlay className="w-5 h-5" /></div>
                              </div>
                              {v.duration && (
                                <div className="absolute bottom-1 right-1 text-[11px] px-1.5 py-0.5 rounded bg-black/70 text-white">
                                  {v.duration}
                                </div>
                              )}
                            </button>
                            <div className="min-w-0">
                              <button onClick={() => { setAddress(v.url); navigate(v.url); }} className="text-blue-600 hover:underline text-base text-left">
                                {v.title}
                              </button>
                              <div className="text-xs text-gray-500">{v.source}</div>
                              {v.snippet && <div className="text-sm text-gray-700 mt-1 line-clamp-2">{v.snippet}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            // WEBVIEW
            <div className="absolute inset-0 bg-white">
              {activeTab.readerMode && activeTab.readerHtml ? (
                <>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 text-[11px] px-2 py-1 bg-amber-100 border border-amber-200 rounded shadow">
                    Reader view (site blocks embedding).{" "}
                    <a href={activeTab.url} target="_blank" rel="noreferrer" className="underline text-blue-600">Open original</a>
                  </div>
                  <div className="w-full h-full">
                    <iframe className="w-full h-full border-0 bg-white" srcDoc={activeTab.readerHtml} sandbox="" />
                  </div>
                </>
              ) : activeTab.blockedEmbed ? (
                <div className="w-full h-full flex items-center justify-center p-6">
                  <div className="max-w-md text-center">
                    <div className="text-3xl mb-2">🔒</div>
                    <h3 className="text-lg font-semibold mb-2">This site blocks embedding</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      We can’t display <span className="font-mono">{hostTitle(activeTab.url)}</span> inside this window because of the site’s security policy.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <a href={activeTab.url} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Open original
                      </a>
                      <button
                        className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                        onClick={async () => {
                          try {
                            const res = await fetch(readerProxyUrl(activeTab.url), { cache: "no-store" });
                            const text = await res.text();
                            const html = `<!doctype html><html><head><meta charset="utf-8"><style>${READER_CSS}</style></head><body>${text}</body></html>`;
                            setTabs(prev => prev.map(x => x.id === activeId ? ({ ...x, readerMode: true, readerHtml: html }) : x));
                          } catch {}
                        }}
                      >
                        Try reader view
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  key={activeTab.url + String(activeTab.isLoading)}
                  src={activeTab.url}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                />
              )}

              {activeTab.isLoading && (
                <div className="absolute top-2 right-2 px-3 py-1.5 text-xs bg-white/90 border border-gray-200 rounded shadow flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Loading…
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <span>{activeTab.title || hostTitle(activeTab.url)}</span>
        <span>Zoom: {zoom}%</span>
      </div>
    </div>
  );
}
