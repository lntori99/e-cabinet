"use client";

import { HiMoon, HiSun } from "react-icons/hi2";
import { useTheme } from "@/core/providers";

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="-m-1.5 rounded-full p-1.5 text-neutral-500 transition hover:text-state-600 dark:text-neutral-400 dark:hover:text-state-400"
    >
      {theme === "dark" ? (
        <HiSun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <HiMoon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
