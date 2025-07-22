"use client";

import { useState } from "react";
import BootLoader from "@/components/loader/BootLoader";
import HomeScreen from "@/components/HomeScreen";
import { AnimatePresence } from "framer-motion";

export default function HomePage() {
  const [bootComplete, setBootComplete] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!bootComplete && (
          <BootLoader onComplete={() => setBootComplete(true)} />
        )}
      </AnimatePresence>

      <AnimatePresence>{bootComplete && <HomeScreen />}</AnimatePresence>
    </>
  );
}