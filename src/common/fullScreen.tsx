"use client";

import { useEffect, useState } from "react";
import { HiArrowsPointingIn, HiArrowsPointingOut } from "react-icons/hi2";

/** Useful when the console is driven from an IMAGO room display. */
export default function FullScreen() {
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const sync = () => setIsFull(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggle = () => {
    // Rejects when the browser blocks it outside a user gesture — nothing to do.
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFull ? "Exit full screen" : "Enter full screen"}
      aria-pressed={isFull}
      className="-m-1.5 hidden rounded-full p-1.5 text-neutral-500 transition hover:text-state-600 dark:text-neutral-400 dark:hover:text-state-400 sm:block"
    >
      {isFull ? (
        <HiArrowsPointingIn className="h-5 w-5" aria-hidden="true" />
      ) : (
        <HiArrowsPointingOut className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
