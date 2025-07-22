"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface BootLoaderProps {
  onComplete: () => void;
}

export default function BootLoader({ onComplete }: BootLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(interval);
          setDone(true);
          setTimeout(onComplete, 800); // wait before unmounting
        }
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Apple logo */}
          <div className="w-16 sm:w-20 h-auto mb-10 invert">
            <Image
              src="/apple-logo.svg"
              alt="Apple Logo"
              width={80}
              height={80}
              priority
              draggable={false}
              style={{ height: "auto" }} // fixes the warning
            />
          </div>

          {/* macOS-style progress bar */}
          <div className="w-[160px] sm:w-[220px] h-[5px] bg-[#333] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.2 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
