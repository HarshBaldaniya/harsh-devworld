"use client";

import { useState, useRef, useEffect } from "react";
import BootLoader from "@/components/loader/BootLoader";
import HomeScreen from "@/components/HomeScreen";
import MainTopBar from "@/components/topbar/MainTopBar";
import LockScreen from "@/components/LockScreen";
import { AnimatePresence, motion } from "framer-motion";

export default function HomePage() {
  const [initialBoot, setInitialBoot] = useState(true);
  const [bootComplete, setBootComplete] = useState(false);
  const [lock, setLock] = useState(false);
  const [shutdown, setShutdown] = useState(false);
  const [showBoot, setShowBoot] = useState(false);
  const [shutdownDone, setShutdownDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [lockKey, setLockKey] = useState(0);

  useEffect(() => {
    if (initialBoot) {
      setBootComplete(false);
    }
  }, [initialBoot]);

  const lockScreen = () => {
    setLock(false);
    setTimeout(() => {
      setLock(true);
      setLockKey((k) => k + 1);
      setShutdown(false);
      setShowBoot(false);
      setShutdownDone(false);
    }, 0);
  };

  const handleAppleMenuAction = (action: "restart" | "shutdown" | "lock") => {
    if (action === "restart") {
      window.location.reload();
      return;
    } else if (action === "shutdown") {
      setShutdown(true);
      setLock(false);
      setShowBoot(false);
      setShutdownDone(false);
      setTimeout(() => {
        setShutdownDone(true);
      }, 1800);
    } else if (action === "lock") {
      lockScreen();
    }
  };

  const handleShutdownClick = () => {
    setShutdown(false);
    setShutdownDone(false);
    setShowBoot(true);
    audioRef.current?.play();
    setTimeout(() => {
      setShowBoot(false);
      setBootComplete(true);
      setLock(false);
      setShutdown(false);
      setShutdownDone(false);
    }, 2500);
  };

  return (
    <>
      <audio ref={audioRef} src="/sounds/apple-boot.mp3" preload="auto" />
      <AnimatePresence>
        {initialBoot && !bootComplete && !showBoot && (
          <BootLoader onComplete={() => { setBootComplete(true); setInitialBoot(false); }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!initialBoot && !bootComplete && !showBoot && (
          <BootLoader onComplete={() => setBootComplete(true)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {bootComplete && !lock && !shutdown && !showBoot && !shutdownDone && (
          <div>
            <MainTopBar onAppleMenuAction={handleAppleMenuAction} />
            <HomeScreen />
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {lock && (
          <LockScreen
            key={lockKey}
            onUnlock={() => window.location.reload()}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {shutdown && !shutdownDone && (
          <motion.div
            key="shutdown"
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* No Apple logo, just a black screen */}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {shutdownDone && (
          <motion.div
            key="shutdown-done"
            className="fixed inset-0 z-[201] flex items-center justify-center bg-black cursor-pointer"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            onClick={handleShutdownClick}
          >
            {/* Blank screen, no logo */}
          </motion.div>
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