import React from "react";

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-2xl transition-all">
      <div className="flex flex-col items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center shadow-lg border-4 border-white/30">
          {/* Placeholder for user avatar */}
          <span className="text-5xl text-white/80">👤</span>
        </div>
        <div className="text-white text-2xl font-semibold drop-shadow">Harsh Baldaniya</div>
        <button
          className="mt-4 px-8 py-2 rounded-full bg-white/20 text-white text-lg font-medium shadow hover:bg-white/30 transition-all backdrop-blur"
          onClick={onUnlock}
        >
          Click to Unlock
        </button>
      </div>
    </div>
  );
} 