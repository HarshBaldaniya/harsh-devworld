"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BackgroundContextType {
  currentBackground: string;
  setCurrentBackground: (image: string) => void;
  currentLockScreen: string;
  setCurrentLockScreen: (image: string) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [currentBackground, setCurrentBackground] = useState("/mac-wallpaper-1.jpg");
  const [currentLockScreen, setCurrentLockScreen] = useState("/lock-screen.jpg");

  // Load saved backgrounds from localStorage
  useEffect(() => {
    const savedBackground = localStorage.getItem("macbook-background");
    const savedLockScreen = localStorage.getItem("macbook-lock-screen");
    
    if (savedBackground) {
      setCurrentBackground(savedBackground);
    }
    if (savedLockScreen) {
      setCurrentLockScreen(savedLockScreen);
    }
  }, []);

  // Save background changes to localStorage
  const handleBackgroundChange = (image: string) => {
    setCurrentBackground(image);
    localStorage.setItem("macbook-background", image);
  };

  const handleLockScreenChange = (image: string) => {
    setCurrentLockScreen(image);
    localStorage.setItem("macbook-lock-screen", image);
  };

  return (
    <BackgroundContext.Provider
      value={{
        currentBackground,
        setCurrentBackground: handleBackgroundChange,
        currentLockScreen,
        setCurrentLockScreen: handleLockScreenChange,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
}
