"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/core/store";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectTheme,
  themeHydrated,
  themeSet,
  themeToggled,
  type Theme,
} from "@/core/slices/ui-slice";

export function Providers({ children }: { children: ReactNode }) {
  // One store per client. A module-level singleton would be shared across
  // requests on the server.
  const storeRef = useRef<AppStore | null>(null);
  storeRef.current ??= makeStore();

  return (
    <Provider store={storeRef.current}>
      <ThemeSync />
      {children}
    </Provider>
  );
}

/**
 * The store holds the theme and the DOM class follows it. The no-flash script
 * in `layout.tsx` sets the class before React runs, so the first pass reads
 * back out of the DOM rather than overwriting it.
 */
function ThemeSync() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const hydrated = useRef(false);

  useEffect(() => {
    dispatch(
      themeHydrated(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      ),
    );
    hydrated.current = true;
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated.current) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
}

/**
 * Theme state plus the toggle, for the console header.
 *
 * Persistence happens here and nowhere else: writing localStorage on hydration
 * would record a preference the operator never expressed, permanently pinning
 * the console to whatever their OS happened to be set to on their first visit.
 */
export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    dispatch(themeToggled());
    try {
      localStorage.setItem("ecab-theme", next);
    } catch {}
  };

  /**
   * Chosen outright, which is what the settings screen offers. "System" is the
   * absence of a preference rather than a third value: the stored key is
   * cleared and the OS setting is read back, so the console follows the machine
   * from then on.
   */
  const setTheme = (next: ThemePreference) => {
    if (next === "system") {
      try {
        localStorage.removeItem("ecab-theme");
      } catch {}
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      dispatch(themeSet(dark ? "dark" : "light"));
      return;
    }

    dispatch(themeSet(next));
    try {
      localStorage.setItem("ecab-theme", next);
    } catch {}
  };

  return { theme, toggleTheme, setTheme };
}

export type ThemePreference = Theme | "system";

/** What is actually stored — client-side only, so read it in an effect. */
export function readThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem("ecab-theme");
    return stored === "dark" || stored === "light" ? stored : "system";
  } catch {
    return "system";
  }
}
