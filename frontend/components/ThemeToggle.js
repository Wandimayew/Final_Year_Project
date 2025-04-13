"use client";

import { useTheme } from "@/lib/theme/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggleTheme("light")}
        className={`px-3 py-1 rounded-md ${theme === "light" ? "bg-primary text-white" : "bg-secondary"}`}
      >
        Light
      </button>
      <button
        onClick={() => toggleTheme("dark")}
        className={`px-3 py-1 rounded-md ${theme === "dark" ? "bg-primary text-white" : "bg-secondary"}`}
      >
        Dark
      </button>
      <button
        onClick={() => toggleTheme("night")}
        className={`px-3 py-1 rounded-md ${theme === "night" ? "bg-primary text-white" : "bg-secondary"}`}
      >
        Night
      </button>
    </div>
  );
}