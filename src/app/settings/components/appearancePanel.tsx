"use client";

import { useEffect, useState } from "react";
import { FiCheck, FiMonitor, FiMoon, FiSun } from "react-icons/fi";
import {
  readThemePreference,
  useTheme,
  type ThemePreference,
} from "@/core/providers";
import SettingsCard from "./settingsCard";

const OPTIONS: {
  id: ThemePreference;
  label: string;
  detail: string;
  icon: typeof FiSun;
}[] = [
  { id: "light", label: "Light", detail: "Always light, whatever the machine is set to", icon: FiSun },
  { id: "dark", label: "Dark", detail: "Always dark — easier in a darkened Cabinet Room", icon: FiMoon },
  {
    id: "system",
    label: "Match the machine",
    detail: "Follow the operating system setting as it changes",
    icon: FiMonitor,
  },
];

export default function AppearancePanel() {
  const { setTheme } = useTheme();
  const [preference, setPreference] = useState<ThemePreference | null>(null);

  // Read after mount: the stored preference lives in localStorage, and the
  // no-flash script in the root layout has already applied it to the document.
  useEffect(() => setPreference(readThemePreference()), []);

  function choose(next: ThemePreference) {
    setTheme(next);
    setPreference(next);
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Theme"
        description="Applied before the first paint, so the console never flashes the wrong way round on load."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {OPTIONS.map((option) => {
            const active = preference === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => choose(option.id)}
                aria-pressed={active}
                className={`rounded-lg border p-4 text-left transition ${
                  active
                    ? "border-state-500 bg-state-50 dark:border-state-700 dark:bg-state-900/20"
                    : "border-neutral-200 hover:border-state-300 dark:border-neutral-800"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <option.icon
                    size={18}
                    className={
                      active
                        ? "text-state-600 dark:text-state-400"
                        : "text-neutral-400 dark:text-neutral-500"
                    }
                    aria-hidden="true"
                  />
                  {active && (
                    <FiCheck
                      size={15}
                      className="text-state-600 dark:text-state-400"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span className="mt-3 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                  {option.detail}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          Charts carry a separate palette for each theme rather than inverting one
          — the dark steps are chosen against the dark surface, so a figure reads
          the same either way.
        </p>
      </SettingsCard>

      <SettingsCard
        title="Motion and contrast"
        description="Taken from the operating system rather than set here, so one accessibility choice covers every application on the machine."
      >
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2.5">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-state-500"
              aria-hidden="true"
            />
            <span>
              <span className="block font-medium text-neutral-900 dark:text-neutral-100">
                Reduced motion
              </span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                With &ldquo;reduce motion&rdquo; on, transitions are cut to
                effectively nothing across the console.
              </span>
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-state-500"
              aria-hidden="true"
            />
            <span>
              <span className="block font-medium text-neutral-900 dark:text-neutral-100">
                Forced colours
              </span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                In a high-contrast mode, charts fall back to texture and labels so
                nothing depends on hue alone.
              </span>
            </span>
          </li>
        </ul>
      </SettingsCard>
    </div>
  );
}
