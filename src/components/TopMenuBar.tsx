import {
  FaApple,
  FaWifi,
  FaBatteryThreeQuarters,
  FaPlug,
  FaToggleOn,
} from "react-icons/fa";
import { useEffect, useState } from "react";

export default function TopMenuBar() {
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
          const battery: any = await (navigator as any).getBattery();

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
      {/* Left menu */}
      <div className="flex items-center gap-4">
        <FaApple className="text-lg" />
        <span>Finder</span>
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Go</span>
        <span>Window</span>
        <span>Help</span>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span>{displayLevel}%</span>
          {displayCharging ? (
            <FaPlug className="text-base" title="Charging" />
          ) : (
            <FaBatteryThreeQuarters className="text-base" title="Battery" />
          )}
        </span>

        <FaWifi className="text-base" />
        <FaToggleOn className="text-base" title="Toggle" />
        <span>{currentTime}</span>
      </div>
    </div>
  );
}