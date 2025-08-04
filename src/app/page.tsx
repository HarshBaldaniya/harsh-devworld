"use client";

import { useState, useRef } from "react";
import BootLoader from "@/components/loader/BootLoader";
import HomeScreen from "@/components/HomeScreen";
import MainTopBar from "@/components/topbar/MainTopBar";
import LockScreen from "@/components/LockScreen";
import Dock from "@/components/Dock";
import AppManager from "@/components/app-window/AppManager";
import { AnimatePresence, motion } from "framer-motion";
import type { AppleMenuAction } from "@/components/topbar/TopBarLeft";

export default function HomePage() {
  const [bootComplete, setBootComplete] = useState(false);
  const [shutdown, setShutdown] = useState(false);
  const [showBoot, setShowBoot] = useState(false);
  const [lock, setLock] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAppleMenuAction = (action: AppleMenuAction) => {
    if (action === "shutdown") {
      setShutdown(true);
    } else if (action === "lock") {
      setLock(true);
    }
  };

  const handleShutdownClick = () => {
    setShutdown(false);
    setShowBoot(true);
    audioRef.current?.play();
    setTimeout(() => {
      setShowBoot(false);
      setBootComplete(true);
    }, 2500);
  };

  const handleAppClick = (appId: string) => {
    if ((window as any).openApp) {
      (window as any).openApp(appId);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/sounds/apple-boot.mp3" preload="auto" />
      <AnimatePresence>
        {!bootComplete && !showBoot && (
          <BootLoader onComplete={() => setBootComplete(true)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {bootComplete && !shutdown && !showBoot && !lock && (
          <>
            <MainTopBar onAppleMenuAction={handleAppleMenuAction} />
            <HomeScreen />
            <Dock onAppClick={handleAppClick} />
            <AppManager />
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {shutdown && (
          <motion.div
            key="shutdown"
            className="fixed inset-0 z-[201] flex items-center justify-center bg-black cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            onClick={handleShutdownClick}
          >
            <img
              src="/apple-logo.svg"
              alt="Apple Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 invert"
              style={{ width: "auto", height: "auto", maxWidth: "128px", maxHeight: "128px" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {lock && (
          <LockScreen onUnlock={() => setLock(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showBoot && (
          <BootLoader onComplete={() => setShowBoot(false)} />
        )}
      </AnimatePresence>
    </>
  );
}