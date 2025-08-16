import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useBackground } from "@/contexts/BackgroundContext";

const AVATAR = "/hb-logo.jpg";

function getFormattedDate() {
  const now = new Date();
  return now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getFormattedTime() {
  const now = new Date();
  return now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { currentLockScreen } = useBackground();
  const [date, setDate] = useState(getFormattedDate());
  const [time, setTime] = useState(getFormattedTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(getFormattedDate());
      setTime(getFormattedTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        key="lockscreen"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/80"
        style={{
          backgroundImage: `url(${currentLockScreen})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        <div className="w-full flex flex-col items-center mt-24 select-none">
          <div className="text-white/90 text-lg font-medium mb-2 drop-shadow-lg">
            {date}
          </div>
          <div className="text-white text-8xl font-extrabold drop-shadow-lg tracking-tight mb-12">
            {time}
          </div>
        </div>
        <div className="flex flex-col items-center mb-16 select-none">
          <Image
            src={AVATAR}
            alt="User Avatar"
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover border-2 border-white/70 shadow mb-2"
            style={{ background: "#fff" }}
          />
          <div className="text-white text-lg font-semibold mb-1 drop-shadow">Harsh Baldaniya</div>
          <div className="text-white/80 text-sm mb-6 drop-shadow">Touch ID or Enter Password</div>
          <motion.button
            className="px-8 py-3 rounded-full bg-white/30 text-white text-lg font-semibold shadow hover:bg-white/50 transition-all backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/60"
            whileTap={{ scale: 0.96 }}
            onClick={onUnlock}
          >
            Unlock
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 