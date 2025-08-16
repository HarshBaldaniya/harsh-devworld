"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  LuMail,
  LuSend,
  LuCheck,
  LuTriangleAlert,
  LuInbox,
  LuExternalLink,
  LuLoader,
  LuClock,
} from "react-icons/lu";

type Form = {
  fromEmail: string;
  subject: string;
  message: string;
};

type SentItem = Form & { id: string; ts: number };

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "owner@example.com";

const SUBJECT_PREFIX = "[Macbook_Clone - Portpolio] ";
const STORAGE_KEY = "mail_sent_items";
const MAIL_APP_STORAGE_KEY = "mail_app_data";

export default function MailApp() {
  const [tab, setTab] = useState<"compose" | "sent">("compose");
  const [form, setForm] = useState<Form>({
    fromEmail: "",
    subject: "",
    message: "",
  });
  const [touched, setTouched] = useState<{ [K in keyof Form]?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(
    null
  );
  const [sent, setSent] = useState<SentItem[]>([]);

  // Load sent items and app data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Load sent items
        const storedSent = localStorage.getItem(STORAGE_KEY);
        if (storedSent) {
          const parsed = JSON.parse(storedSent);
          if (Array.isArray(parsed)) {
            setSent(parsed);
          }
        }

        // Load app data (form state, tab, etc.)
        const storedAppData = localStorage.getItem(MAIL_APP_STORAGE_KEY);
        if (storedAppData) {
          const appData = JSON.parse(storedAppData);
          if (appData.form) {
            setForm(appData.form);
          }
          if (appData.tab) {
            setTab(appData.tab);
          }
        }
      } catch (error) {
        console.error("Failed to load data from localStorage:", error);
      }
    };

    // Load data immediately
    loadData();

    // Also load data when window gains focus (in case localStorage was cleared)
    const handleFocus = () => {
      loadData();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Save sent items to localStorage whenever sent state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sent));
    } catch (error) {
      console.error("Failed to save sent items to localStorage:", error);
    }
  }, [sent]);

  // Save app data to localStorage whenever form or tab changes
  useEffect(() => {
    try {
      const appData = {
        form,
        tab,
        timestamp: Date.now()
      };
      localStorage.setItem(MAIL_APP_STORAGE_KEY, JSON.stringify(appData));
    } catch (error) {
      console.error("Failed to save app data to localStorage:", error);
    }
  }, [form, tab]);

  // --- validation (quiet until a field is touched or submit fails) ---
  const emailOk =
    !form.fromEmail ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.fromEmail.trim());

  const subjectOk = form.subject.trim().length >= 3;
  const messageOk = form.message.trim().length >= 10;

  const canSend = emailOk && subjectOk && messageOk && !submitting;

  const subjectCount = form.subject.length;
  const messageCount = form.message.length;

  function update<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function markTouched<K extends keyof Form>(k: K) {
    setTouched((p) => ({ ...p, [k]: true }));
  }

  function clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(MAIL_APP_STORAGE_KEY);
      setSent([]);
      setForm({ fromEmail: "", subject: "", message: "" });
      setTab("compose");
      setTouched({});
      setStatus(null);
    } catch (error) {
      console.error("Failed to clear data:", error);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ fromEmail: true, subject: true, message: true });
    if (!canSend) return;

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        // Enhanced error handling with rate limiting
        let msg = "Sorry, something went wrong while sending your message.";
        
        if (data?.code === 429) {
          const limit = data?.limit || 10;
          msg = `Daily limit exceeded! Please try again tomorrow.`;
        } else if (data?.message) {
          msg = data.message;
        }
        
        setStatus({ ok: false, msg });
        
        // Auto-dismiss error notifications after 8 seconds
        setTimeout(() => {
          setStatus(null);
        }, 8000);
        
        return;
      }

      setStatus({ ok: true, msg: "Message sent. I’ll get back to you soon." });

      // record locally in Sent
      setSent((prev) => [
        { ...form, id: String(Date.now()), ts: Date.now() },
        ...prev,
      ]);

      // reset form
      setForm({ fromEmail: "", subject: "", message: "" });
      setTouched({});
      setTab("sent");
      
      // Auto-dismiss success notifications after 5 seconds
      setTimeout(() => {
        setStatus(null);
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  }

  function openMailAppPrefilled() {
    const subject = encodeURIComponent(SUBJECT_PREFIX + form.subject.trim());
    const body = encodeURIComponent(form.message.trim());
    const replyTo = form.fromEmail.trim();
    const extra = replyTo ? `&cc=${encodeURIComponent(replyTo)}` : "";
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}${extra}`;
  }

  const headerTitle = useMemo(
    () => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
          <LuMail className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-semibold text-zinc-50">Mail</div>
          <div className="text-[13px] text-zinc-400">
            Send a quick note to the site owner
          </div>
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="h-full w-full bg-[#0c0d0f] text-zinc-200 flex flex-col overflow-scroll">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        {headerTitle}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTab("compose")}
            className={`h-9 px-3 rounded-md text-sm font-medium transition ${
              tab === "compose"
                ? "bg-blue-500 text-white"
                : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
            }`}
          >
            Compose
          </button>
          <button
            onClick={() => setTab("sent")}
            className={`h-9 px-3 rounded-md text-sm font-medium transition ${
              tab === "sent"
                ? "bg-blue-500 text-white"
                : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <LuInbox className="w-4 h-4" />
              Sent ({sent.length})
            </span>
          </button>

          <a
            title="Open your system mail app"
            className="h-9 px-3 rounded-md text-sm font-medium transition bg-zinc-800 text-zinc-200 hover:bg-zinc-700 inline-flex items-center gap-2"
            onClick={openMailAppPrefilled}
            role="button"
          >
            <LuExternalLink className="w-4 h-4" />
            Open Mail App
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tab === "compose" ? (
          <form
            onSubmit={onSubmit}
            className="max-w-3xl mx-auto p-6 space-y-5"
            noValidate
          >
            {/* Professional toast notification */}
            {status && (
              <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4">
                <div className={`rounded-xl shadow-2xl border ${
                  status.ok
                    ? "bg-emerald-50 border-emerald-200 shadow-emerald-200/50"
                    : "bg-rose-50 border-rose-200 shadow-rose-200/50"
                }`}>
                  <div className="flex items-center p-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      status.ok 
                        ? "bg-emerald-500 text-white" 
                        : "bg-rose-500 text-white"
                    }`}>
                      {status.ok ? (
                        <LuCheck className="w-4 h-4" />
                      ) : (
                        <LuTriangleAlert className="w-4 h-4" />
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${
                        status.ok ? "text-emerald-900" : "text-rose-900"
                      }`}>
                        {status.msg}
                      </p>
                    </div>
                    <button
                      onClick={() => setStatus(null)}
                      className="ml-3 flex-shrink-0 w-6 h-6 rounded-full hover:bg-black/5 transition-colors flex items-center justify-center"
                    >
                      <span className={`text-lg font-light ${
                        status.ok ? "text-emerald-600" : "text-rose-600"
                      }`}>×</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reply address (optional) */}
            <div>
              <label className="block text-sm mb-2 text-zinc-400">
                Your Email (optional)
              </label>
              <input
                value={form.fromEmail}
                onChange={(e) => update("fromEmail", e.target.value)}
                onBlur={() => markTouched("fromEmail")}
                placeholder="you@domain.com"
                className={`w-full h-11 rounded-md px-3 bg-zinc-900 text-zinc-100 placeholder-zinc-500 border ${
                  !emailOk && touched.fromEmail
                    ? "border-red-500"
                    : "border-zinc-700 focus:border-blue-500"
                } outline-none`}
                type="email"
                autoComplete="email"
              />
              {!emailOk && touched.fromEmail && (
                <p className="mt-1 text-xs text-red-400">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-zinc-400">Subject *</label>
                <span className="text-xs text-zinc-500">{subjectCount}/150</span>
              </div>
              <input
                value={form.subject}
                onChange={(e) =>
                  update("subject", e.target.value.slice(0, 150))
                }
                onBlur={() => markTouched("subject")}
                placeholder="Briefly describe your message"
                className={`w-full h-11 rounded-md px-3 bg-zinc-900 text-zinc-100 placeholder-zinc-500 border ${
                  !subjectOk && touched.subject
                    ? "border-red-500"
                    : "border-zinc-700 focus:border-blue-500"
                } outline-none`}
              />
              {!subjectOk && touched.subject && (
                <p className="mt-1 text-xs text-red-400">
                  Subject should be at least 3 characters.
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm mb-2 text-zinc-400">
                Message *
              </label>
              <textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                onBlur={() => markTouched("message")}
                rows={8}
                placeholder="Write your message..."
                className={`w-full rounded-md p-3 bg-zinc-900 text-zinc-100 placeholder-zinc-500 border ${
                  !messageOk && touched.message
                    ? "border-red-500"
                    : "border-zinc-700 focus:border-blue-500"
                } outline-none resize-y`}
              />
              {!messageOk && touched.message && (
                <p className="mt-1 text-xs text-red-400">
                  Please share at least 10 characters.
                </p>
              )}
            </div>

            {/* Footer actions (unified height) */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={openMailAppPrefilled}
                className="h-10 px-3 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm inline-flex items-center gap-2"
              >
                <LuExternalLink className="w-4 h-4" />
                Open Mail App
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm({ fromEmail: "", subject: "", message: "" });
                    setTouched({});
                    setStatus(null);
                  }}
                  className="h-10 px-3 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm"
                >
                  Reset Form
                </button>

                <button
                  type="button"
                  onClick={clearAllData}
                  className="h-10 px-3 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm"
                  title="Clear all data including sent messages"
                >
                  Clear All
                </button>

                <button
                  type="submit"
                  disabled={!canSend || submitting}
                  className={`h-10 px-4 rounded-md text-sm font-medium inline-flex items-center gap-2 transition-all ${
                    canSend && !submitting
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                  }`}
                >
                  {submitting ? (
                    <>
                      <LuLoader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <LuSend className="w-4 h-4" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Note (moved to bottom, minimal wording) */}
            <p className="pt-2 text-xs text-zinc-500 mb-10">
              Messages go directly to the site owner. We include basic context
              (like browser and page) to help with follow-up.
            </p>
          </form>
        ) : (
          <div className="max-w-4xl mx-auto p-6 space-y-4">
            {sent.length === 0 ? (
              <div className="rounded-lg border border-zinc-800 p-8 text-center">
                <LuInbox className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">No messages yet.</p>
                <button
                  onClick={() => setTab("compose")}
                  className="mt-4 h-9 px-3 rounded-md bg-blue-500 text-white text-sm"
                >
                  Compose a message
                </button>
              </div>
            ) : (
              sent.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-zinc-800 p-5 bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-50">
                        {m.subject}
                      </h3>
                      {m.fromEmail && (
                        <p className="text-sm text-zinc-400 mt-1">
                          Reply-to: {m.fromEmail}
                        </p>
                      )}
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(m.ts).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setForm({
                          fromEmail: m.fromEmail,
                          subject: m.subject,
                          message: m.message,
                        });
                        setTab("compose");
                        setStatus(null);
                      }}
                      className="h-9 px-3 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors"
                    >
                      Send again
                    </button>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-zinc-200">
                    {m.message}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
