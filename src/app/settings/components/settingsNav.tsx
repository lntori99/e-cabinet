import Link from "next/link";
import {
  FiBell,
  FiGlobe,
  FiInfo,
  FiLock,
  FiMonitor,
  FiSun,
  FiUser,
} from "react-icons/fi";
import type { IconType } from "react-icons";

export const SECTIONS = [
  { id: "profile", label: "Profile", icon: FiUser, blurb: "Who you are on the platform" },
  { id: "security", label: "Security", icon: FiLock, blurb: "Password, factors and step-up" },
  {
    id: "sessions",
    label: "Sessions and devices",
    icon: FiMonitor,
    blurb: "Where you are signed in",
  },
  { id: "notifications", label: "Notifications", icon: FiBell, blurb: "What reaches you, and how" },
  { id: "appearance", label: "Appearance", icon: FiSun, blurb: "Theme and contrast" },
  {
    id: "regional",
    label: "Language and region",
    icon: FiGlobe,
    blurb: "Time zone, dates and language",
  },
  { id: "about", label: "About this session", icon: FiInfo, blurb: "Environment and build" },
] as const satisfies readonly {
  id: string;
  label: string;
  icon: IconType;
  blurb: string;
}[];

export type SectionId = (typeof SECTIONS)[number]["id"];

export function isSection(value: string): value is SectionId {
  return SECTIONS.some((s) => s.id === value);
}

/**
 * The section lives in the URL rather than in client state: it keeps each
 * section linkable, and it means a form that posts back — the password change —
 * returns the reader to the panel they were standing in.
 */
export default function SettingsNav({ current }: { current: SectionId }) {
  return (
    <nav aria-label="Settings" className="space-y-1">
      {SECTIONS.map((section) => {
        const active = section.id === current;
        return (
          <Link
            key={section.id}
            href={`/settings?section=${section.id}`}
            aria-current={active ? "page" : undefined}
            className={`flex items-start gap-3 rounded-lg border p-3 transition ${
              active
                ? "border-state-500 bg-state-50 dark:border-state-700 dark:bg-state-900/20"
                : "border-transparent hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-800 dark:hover:bg-neutral-900"
            }`}
          >
            <section.icon
              size={16}
              className={`mt-0.5 shrink-0 ${
                active
                  ? "text-state-600 dark:text-state-400"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span
                className={`block text-sm font-medium ${
                  active
                    ? "text-state-700 dark:text-state-400"
                    : "text-neutral-900 dark:text-neutral-100"
                }`}
              >
                {section.label}
              </span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                {section.blurb}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
