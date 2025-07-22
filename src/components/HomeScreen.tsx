"use client";

import MacBackground from "./MacBackground";
import TopMenuBar from "./TopMenuBar";
import { motion } from "framer-motion";

export default function HomeScreen() {
  return (
    <motion.div
      className="relative min-h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Background */}
      <MacBackground />

      {/* Top menu bar */}
      <TopMenuBar />

      {/* Home text */}
      <div className="relative z-10 flex items-center justify-center h-screen text-white">
        <h1 className="text-3xl sm:text-5xl font-bold backdrop-blur-sm bg-black/30 px-6 py-4 rounded-lg">
          Hello Harsh 👋 – Your MacBook Portfolio
        </h1>
      </div>
    </motion.div>
  );
}