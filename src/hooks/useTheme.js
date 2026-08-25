import { useState, useEffect } from "react";

export const PRESET_ACCENT_COLORS = [
  { name: 'Orange', color: '#f5a623' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Purple', color: '#8b5cf6' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Rose', color: '#f43f5e' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Cyan', color: '#06b6d4' },
  { name: 'Indigo', color: '#6366f1' },
];

function hexToRgba(hex, alpha = 1) {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return `rgba(245, 166, 35, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function adjustBrightness(hex, percent) {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return hex;
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
      return localStorage.getItem("theme");
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  });

  const [primaryColor, setPrimaryColor] = useState(() => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("primary_color")) {
      return localStorage.getItem("primary_color");
    }
    return "#f5a623";
  });

  // Apply Theme Mode (Dark/Light)
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);

    // Update Chrome browser top navigation / status bar theme color
    const themeColor = theme === "dark" ? "#000000" : "#faf6f1";
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeColor);
    } else {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      metaThemeColor.content = themeColor;
      document.head.appendChild(metaThemeColor);
    }
  }, [theme]);

  // Apply Primary Accent Color
  useEffect(() => {
    const root = window.document.documentElement;
    const hoverColor = adjustBrightness(primaryColor, -10);
    const lightColor = hexToRgba(primaryColor, 0.18);

    root.style.setProperty('--color-primary-orange', primaryColor);
    root.style.setProperty('--color-primary-orange-hover', hoverColor);
    root.style.setProperty('--color-primary-orange-light', lightColor);

    localStorage.setItem("primary_color", primaryColor);
  }, [primaryColor]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return {
    theme,
    toggleTheme,
    primaryColor,
    setPrimaryColor,
    PRESET_ACCENT_COLORS
  };
}
