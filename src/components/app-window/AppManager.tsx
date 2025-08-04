"use client";

import React, { useState } from "react";
import AppWindow from "./AppWindow";
import FinderApp from "./FinderApp";

export interface AppState {
  id: string;
  name: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  lastState: 'normal' | 'maximized' | 'minimized';
}

const APPS = {
  finder: {
    id: "finder",
    name: "Finder",
    icon: "/images/dock/finder.png",
  },
};

export default function AppManager() {
  const [apps, setApps] = useState<Record<string, AppState>>({});
  const [maxZIndex, setMaxZIndex] = useState(50);

  // Expose openApp function globally
  React.useEffect(() => {
    (window as Window & { openApp?: (appId: string) => void }).openApp = (appId: string) => {
      setApps(prev => ({
        ...prev,
        [appId]: {
          ...APPS[appId as keyof typeof APPS],
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: maxZIndex + 1,
          position: { x: 100 + (Object.keys(prev).length * 50), y: 100 + (Object.keys(prev).length * 30) },
          size: { width: 800, height: 600 },
          lastState: 'normal',
        }
      }));
      setMaxZIndex(prev => prev + 1);
    };

    (window as Window & { bringToFront?: (appId: string) => void }).bringToFront = (appId: string) => {
      setApps(prev => ({
        ...prev,
        [appId]: {
          ...prev[appId],
          zIndex: maxZIndex + 1,
        }
      }));
      setMaxZIndex(prev => prev + 1);
    };
  }, [maxZIndex]);



  const closeApp = (appId: string) => {
    setApps(prev => {
      const newApps = { ...prev };
      // Remove the app completely when closed
      delete newApps[appId];
      return newApps;
    });
  };

  const minimizeApp = (appId: string) => {
    setApps(prev => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        isMinimized: true,
        lastState: prev[appId].isMaximized ? 'maximized' : 'normal',
      }
    }));
  };

  const maximizeApp = (appId: string) => {
    setApps(prev => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        isMaximized: !prev[appId].isMaximized,
        lastState: !prev[appId].isMaximized ? 'maximized' : 'normal',
      }
    }));
  };



  const renderAppContent = (appId: string) => {
    switch (appId) {
      case "finder":
        return <FinderApp />;
      default:
        return <div>App not found</div>;
    }
  };

  return (
    <>
      {Object.entries(apps).map(([appId, app]) => (
        <AppWindow
          key={appId}
          id={app.id}
          title={app.name}
          icon={app.icon}
          isOpen={app.isOpen === true && !app.isMinimized}
          onClose={() => closeApp(appId)}
          onMinimize={() => minimizeApp(appId)}
          onMaximize={() => maximizeApp(appId)}
          zIndex={app.zIndex}
          position={app.position}
          size={app.size}
        >
          {renderAppContent(appId)}
        </AppWindow>
      ))}
    </>
  );
} 