// /src/lib/secureStore.ts
// Lightweight, SSR-safe, obfuscated localStorage wrapper.
// NOTE: this is "privacy-by-obfuscation", not bank-grade crypto.

// In-memory fallback for SSR / when localStorage is unavailable
const MEM: Record<string, string> = {};

function getLS() {
  if (typeof window === "undefined") return null;
  try {
    const t = "__ss_probe__";
    window.localStorage.setItem(t, t);
    window.localStorage.removeItem(t);
    return window.localStorage;
  } catch {
    return null;
  }
}

const ls = getLS();

function getSecret() {
  if (typeof window === "undefined") return "ssr-secret";
  const envSecret = process.env.NEXT_PUBLIC_SECURE_STORE_SECRET;
  if (envSecret && envSecret.length >= 8) return envSecret;
  // Per-browser fallback secret (random once)
  const k = "__ss_secret__";
  let s = ls?.getItem(k) || MEM[k];
  if (!s) {
    s =
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2);
    if (ls) ls.setItem(k, s);
    else MEM[k] = s;
  }
  return s;
}

const SECRET = getSecret();
const PREFIX = "__ss_v1__:";

function b64e(s: string) {
  if (typeof window === "undefined")
    return Buffer.from(s, "utf-8").toString("base64");
  // encodeURIComponent/unescape for UTF-8 safety in the browser
  return btoa(unescape(encodeURIComponent(s)));
}
function b64d(s: string) {
  if (typeof window === "undefined")
    return Buffer.from(s, "base64").toString("utf-8");
  return decodeURIComponent(escape(atob(s)));
}

// simple XOR obfuscation with base64
function obf(str: string, key: string) {
  let out = "";
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    out += String.fromCharCode(c);
  }
  return b64e(out);
}
function deobf(enc: string, key: string) {
  const raw = b64d(enc);
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    out += String.fromCharCode(c);
  }
  return out;
}

function _set(k: string, v: string) {
  const key = PREFIX + k;
  if (ls) ls.setItem(key, v);
  else MEM[key] = v;
}
function _get(k: string) {
  const key = PREFIX + k;
  return ls ? ls.getItem(key) : MEM[key] ?? null;
}
function _rm(k: string) {
  const key = PREFIX + k;
  if (ls) ls.removeItem(key);
  else delete MEM[key];
}

export const secureStore = {
  set<T>(key: string, value: T) {
    const payload = JSON.stringify({ t: Date.now(), v: value });
    _set(key, obf(payload, SECRET));
  },
  get<T = any>(key: string): T | null {
    try {
      const enc = _get(key);
      if (!enc) return null;
      const dec = deobf(enc, SECRET);
      const obj = JSON.parse(dec);
      return (obj?.v as T) ?? null;
    } catch {
      return null;
    }
  },
  remove(key: string) {
    _rm(key);
  },
};

export default secureStore;
