import {
  FaApple,
  FaWifi,
  FaBatteryThreeQuarters,
  FaPlug,
  FaToggleOn,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import TopBarLeft, { AppleMenuAction } from "./TopBarLeft";
import TopBarRight from "./TopBarRight";

// Replace 'any' with a minimal BatteryManager type
type BatteryManager = {
  level: number;
  charging: boolean;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};

export default function MainTopBar({ onAppleMenuAction }: { onAppleMenuAction?: (action: AppleMenuAction) => void }) {
  const [currentTime, setCurrentTime] = useState("");
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [batterySupported, setBatterySupported] = useState<boolean>(true);

  // Time updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const weekday = now.toLocaleString("en-GB", { weekday: "short" });
      const day = now.getDate().toString().padStart(2, "0");
      const month = now.toLocaleString("en-GB", { month: "short" });
      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentTime(`${weekday} ${day} ${month}, ${time}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Battery API
  useEffect(() => {
    const fetchBatteryStatus = async () => {
      if ("getBattery" in navigator) {
        try {
          const battery: BatteryManager = await (navigator as unknown as { getBattery: () => Promise<BatteryManager> }).getBattery();

          const updateBatteryInfo = () => {
            setBatteryLevel(Math.floor(battery.level * 100));
            setIsCharging(battery.charging);
          };

          updateBatteryInfo();

          battery.addEventListener("chargingchange", updateBatteryInfo);
          battery.addEventListener("levelchange", updateBatteryInfo);

          return () => {
            battery.removeEventListener("chargingchange", updateBatteryInfo);
            battery.removeEventListener("levelchange", updateBatteryInfo);
          };
        } catch {
          setBatterySupported(false);
        }
      } else {
        setBatterySupported(false);
      }
    };

    fetchBatteryStatus();
  }, []);

  // Fallback values
  const displayLevel = batterySupported ? batteryLevel ?? 85 : 85; // Default to 85%
  const displayCharging = batterySupported ? isCharging : false;

  return (
    <div className="fixed top-0 inset-x-0 z-50 h-8 px-4 flex justify-between items-center bg-black/30 backdrop-blur-sm text-white text-sm font-medium">
      <TopBarLeft onAppleMenuAction={onAppleMenuAction} />
      <TopBarRight displayLevel={displayLevel} displayCharging={displayCharging} currentTime={currentTime} />
    </div>
  );
}