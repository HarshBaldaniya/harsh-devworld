import { FaApple } from "react-icons/fa";
import { FiFolder, FiHome, FiDownload, FiCloud, FiShare2, FiEdit2, FiTag, FiSearch, FiChevronRight } from "react-icons/fi";
import React, { useState } from "react";

const APPLE_MENU = [
  { label: "About This Mac", bold: true },
  { type: "separator" as const },
  { label: "System Settings..." },
  { label: "App Store" },
  { type: "separator" as const },
  { label: "Recent Items", rightIcon: <FiChevronRight /> },
  { type: "separator" as const },
  { label: "Force Quit...", shortcut: "⌥⌘⎋", disabled: true },
  { type: "separator" as const },
  { label: "Sleep", disabled: false },
  { label: "Restart...", disabled: false },
  { label: "Shut Down...", disabled: false },
  { type: "separator" as const },
  { label: "Lock Screen", shortcut: "⌃⌘Q", disabled: false },
  { label: "Log Out Harsh Baldaniya...", shortcut: "⇧⌘Q", disabled: true },
];

const MENU = [
  {
    label: "Finder",
    active: true,
    submenu: [
      { label: "About Finder", bold: true },
      { type: "separator" as const },
      { label: "Settings...", shortcut: "⌘ ,", disabled: false },
      { label: "Empty Bin...", shortcut: "⇧⌘⌫", disabled: false },
      { type: "separator" as const },
      { label: "Hide Finder", shortcut: "⌘ H", disabled: false },
    ],
  },
  {
    label: "File",
    submenu: [
      { label: "New Finder Window", shortcut: "⌘ N", bold: true },
      { label: "New Folder", shortcut: "⇧⌘ N", bold: true },
      { type: "separator" as const },
      { label: "Get Info", shortcut: "⌘ I", bold: true },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { label: "Undo Rename", shortcut: "⌘ Z", bold: true },
      { label: "Redo", shortcut: "⇧⌘ Z", disabled: true },
      { type: "separator" as const },
      { label: "Show Clipboard", disabled: false },
    ],
  },
  {
    label: "Go",
    submenu: [
      { label: "Recents", shortcut: "⇧⌘ F", disabled: false },
      { label: "Documents", icon: <FiFolder />, shortcut: "⇧⌘ O", disabled: false },
      { label: "Downloads", icon: <FiDownload />, shortcut: "⇧⌘ L", disabled: false },
    ],
  },
  {
    label: "Window",
    submenu: [
      { label: "Minimise", shortcut: "⌘ M", disabled: true },
      { label: "Cycle Through Windows", shortcut: "⌘ `", disabled: false },
    ],
  },
  {
    label: "Help",
    submenu: [
      { type: "search" as const },
      { label: "Mac User Guide", disabled: false },
    ],
  },
];

type MenuItem = {
  label?: string;
  bold?: boolean;
  shortcut?: string;
  disabled?: boolean;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
  type?: "separator" | "search";
};

function renderSubMenu(submenu: MenuItem[], setOpenMenu: (v: string | null) => void) {
  return (
    <div className="absolute left-0 top-full mt-1 min-w-[210px] bg-white/90 backdrop-blur-2xl text-black rounded-sm shadow-lg border border-white/20 z-50 overflow-hidden py-1" style={{fontWeight: 500, background: 'rgba(30,30,30,0.82)'}}>
      {submenu.map((item, idx) => {
        const menuItem = item as MenuItem;
        if ('type' in menuItem && menuItem.type === "separator") {
          return <div key={"sep-" + idx} className="my-1 border-t border-white/30" />;
        }
        if ('type' in menuItem && menuItem.type === "search") {
          return (
            <div key="search" className="px-2 py-1">
              <input
                className="w-full rounded bg-white/60 px-2 py-1 text-black placeholder-black/40 outline-none border border-white/30 focus:border-gray-400"
                placeholder="Search"
                autoFocus
                style={{fontWeight: 400}}
              />
            </div>
          );
        }
        return (
          <div
            key={menuItem.label}
            className={`flex items-center justify-between px-3 py-1 text-[15px] leading-tight transition-all select-none
              ${menuItem.bold ? "font-bold" : ""}
              ${menuItem.disabled ? "opacity-60 cursor-not-allowed font-normal" : "hover:bg-black/10 cursor-pointer"}
              ${menuItem.active ? "bg-white/30" : ""}
              text-white
            `}
            tabIndex={menuItem.disabled ? -1 : 0}
            aria-disabled={menuItem.disabled}
            onClick={menuItem.disabled ? undefined : () => setOpenMenu(null)}
          >
            <span className="flex items-center gap-2">
              {menuItem.icon ? <span className="text-base opacity-80">{menuItem.icon}</span> : null}
              {menuItem.label}
            </span>
            <span className="flex flex-col items-end min-w-[40px]">
              {menuItem.shortcut ? menuItem.shortcut.split(' ').map((key, i) => (
                <span key={i} className="text-xs tabular-nums opacity-80 ml-2 text-right">{key}</span>
              )) : null}
              {menuItem.rightIcon ? <span>{menuItem.rightIcon}</span> : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export type AppleMenuAction = 'restart' | 'shutdown' | 'lock';

interface TopBarLeftProps {
  onAppleMenuAction?: (action: AppleMenuAction) => void;
}

export default function TopBarLeft({ onAppleMenuAction }: TopBarLeftProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuMode, setMenuMode] = useState<'click' | 'hover'>("click");
  const [appleOpen, setAppleOpen] = useState(false);

  // When a menu is clicked, switch to hover mode for subsequent interactions
  const handleMenuClick = (label: string) => {
    if (openMenu === label) {
      setOpenMenu(null);
      setMenuMode("click");
    } else {
      setOpenMenu(label);
      setMenuMode("hover");
    }
  };

  const handleAppleClick = () => {
    if (appleOpen) {
      setAppleOpen(false);
      setMenuMode("click");
    } else {
      setAppleOpen(true);
      setOpenMenu(null);
      setMenuMode("hover");
    }
  };

  // When user clicks outside, reset to click mode
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.mac-menu-bar')) {
        setOpenMenu(null);
        setMenuMode("click");
        setAppleOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  function renderAppleSubMenu(submenu: MenuItem[], setOpenMenu: (v: string | null) => void) {
    return (
      <div className="absolute left-0 top-full mt-1 min-w-[210px] bg-white/90 backdrop-blur-2xl text-black rounded-sm shadow-lg border border-white/20 z-50 overflow-hidden py-1" style={{fontWeight: 500, background: 'rgba(30,30,30,0.82)'}}>
        {submenu.map((item, idx) => {
          const menuItem = item as MenuItem;
          if ('type' in menuItem && menuItem.type === "separator") {
            return <div key={"sep-" + idx} className="my-1 border-t border-white/30" />;
          }
          if ('type' in menuItem && menuItem.type === "search") {
            return (
              <div key="search" className="px-2 py-1">
                <input
                  className="w-full rounded bg-white/60 px-2 py-1 text-black placeholder-black/40 outline-none border border-white/30 focus:border-gray-400"
                  placeholder="Search"
                  autoFocus
                  style={{fontWeight: 400}}
                />
              </div>
            );
          }
          // Button for all menu items except separators
          let onClick = undefined;
          if (menuItem.label === 'Restart...') {
            onClick = () => { setOpenMenu(null); if (onAppleMenuAction) onAppleMenuAction('restart'); console.log('Clicked Apple menu: Restart...'); };
          } else if (menuItem.label === 'Shut Down...') {
            onClick = () => { setOpenMenu(null); if (onAppleMenuAction) onAppleMenuAction('shutdown'); console.log('Clicked Apple menu: Shut Down...'); };
          } else if (menuItem.label === 'Lock Screen' || menuItem.label === 'Sleep') {
            onClick = () => { setOpenMenu(null); if (onAppleMenuAction) onAppleMenuAction('lock'); console.log(`Clicked Apple menu: ${menuItem.label}`); };
          } else if (!menuItem.disabled && !('type' in menuItem)) {
            onClick = () => { setOpenMenu(null); console.log(`Clicked Apple menu: ${menuItem.label}`); };
          }
          return (
            <button
              key={menuItem.label}
              className={`w-full flex items-center justify-between px-3 py-1 text-[15px] leading-tight transition-all select-none
                ${menuItem.bold ? "font-bold" : ""}
                ${menuItem.disabled ? "opacity-60 cursor-not-allowed font-normal" : "hover:bg-black/10 cursor-pointer"}
                ${menuItem.active ? "bg-white/30" : ""}
                text-white
              `}
              tabIndex={menuItem.disabled ? -1 : 0}
              aria-disabled={menuItem.disabled}
              onClick={menuItem.disabled ? undefined : onClick}
              disabled={menuItem.disabled}
              type="button"
            >
              <span className="flex items-center gap-2">
                {menuItem.icon ? <span className="text-base opacity-80">{menuItem.icon}</span> : null}
                {menuItem.label}
              </span>
              <span className="flex flex-col items-end min-w-[40px]">
                {menuItem.shortcut ? menuItem.shortcut.split(' ').map((key, i) => (
                  <span key={i} className="text-xs tabular-nums opacity-80 ml-2 text-right">{key}</span>
                )) : null}
                {menuItem.rightIcon ? <span>{menuItem.rightIcon}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 relative select-none mac-menu-bar">
      <div
        className="relative h-full flex items-center"
        onClick={handleAppleClick}
        onMouseEnter={() => {
          if (menuMode === "hover" && (openMenu || appleOpen)) {
            setAppleOpen(true);
            setOpenMenu(null);
          }
        }}
      >
        <span
          className={`px-2 py-1 rounded-sm transition-all font-semibold cursor-pointer ${
            appleOpen ? "bg-white/40 text-black shadow-inner" : "text-white"
          }`}
        >
          <FaApple className="text-lg" />
        </span>
        {appleOpen && renderAppleSubMenu(APPLE_MENU, () => setAppleOpen(false))}
      </div>
      {MENU.map((menu) => (
        <div
          key={menu.label}
          className={`relative h-full flex items-center`}
          onClick={() => handleMenuClick(menu.label)}
          onMouseEnter={() => {
            if (menuMode === "hover" && (openMenu || appleOpen)) {
              setOpenMenu(menu.label);
              setAppleOpen(false);
            }
          }}
        >
          <span
            className={`px-2 py-1 rounded-sm transition-all font-semibold
              ${openMenu === menu.label
                ? "bg-white/40 text-black shadow-inner"
                : menu.active
                ? "text-white"
                : "text-white/90"
            }`}
          >
            {menu.label}
          </span>
          {openMenu === menu.label && renderSubMenu(menu.submenu, setOpenMenu)}
        </div>
      ))}
    </div>
  );
}