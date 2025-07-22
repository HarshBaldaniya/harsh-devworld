import { FaWifi, FaBatteryThreeQuarters, FaPlug, FaToggleOn } from "react-icons/fa";

interface TopBarRightProps {
  displayLevel: number;
  displayCharging: boolean | null;
  currentTime: string;
}

export default function TopBarRight({ displayLevel, displayCharging, currentTime }: TopBarRightProps) {
  return (
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
  );
} 