import Link from "next/link";
import { SITE } from "@/core/app-constants";

interface LogoProps {
  compact?: boolean;
  /** Where the mark links to. Defaults to the console. */
  href?: string;
  /** "inverse" for placement on the dark state-green panel. */
  tone?: "default" | "inverse";
}

export default function Logo({
  compact = false,
  href = "/welcome",
  tone = "default",
}: LogoProps) {
  const inverse = tone === "inverse";

  return (
    <Link
      href={href}
      className="group flex items-center gap-3"
      aria-label={`${SITE.name} console`}
    >
      {/* Seal mark: document within a keyed ring */}
      <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
        <circle
          cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeWidth="1.4"
          className={inverse ? "text-state-300" : "text-state-600 dark:text-state-400"}
        />
        <circle
          cx="20" cy="20" r="14.5" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 3"
          className={inverse ? "text-state-300/60" : "text-state-600/60 dark:text-state-400/60"}
        />
        <rect
          x="14" y="12" width="12" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4"
          className={inverse ? "text-state-50" : "text-neutral-800 dark:text-neutral-200"}
        />
        <path
          d="M16.5 17h7M16.5 20h7M16.5 23h4.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"
          className={inverse ? "text-state-300" : "text-state-600 dark:text-state-400"}
        />
      </svg>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-lg font-bold tracking-tight">e-Cabinet</span>
          <span
            className={`block font-mono text-[9px] uppercase tracking-[0.22em] ${
              inverse ? "text-state-300" : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            Republic of Malawi
          </span>
        </span>
      )}
    </Link>
  );
}
