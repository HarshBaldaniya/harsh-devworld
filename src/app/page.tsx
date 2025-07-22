"use client";

import { useState } from "react";
import BootLoader from "@/components/loader/BootLoader";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const [bootComplete, setBootComplete] = useState(false);

  return (
    <>
      {/* Bootloader Animation */}
      <AnimatePresence>
        {!bootComplete && (
          <BootLoader onComplete={() => setBootComplete(true)} />
        )}
      </AnimatePresence>

      {/* Main Home Content with smooth fade-in */}
      <AnimatePresence>
        {bootComplete && (
          <motion.main
            className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-semibold mb-4">
                Hello, Harsh! 👋
              </h1>
              <p className="text-lg sm:text-xl text-gray-400">
                Welcome to your macOS-style Portfolio 🚀
              </p>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
}
