"use client";

import { useMemo } from "react";
import { FiClock } from "react-icons/fi";
import { useAppSelector } from "@/core/hook";
import { selectUpdatesFor } from "@/core/slices/decision-slice";
import { stamp } from "@/common/time";

/**
 * FR-DEC-07 — narrative progress, in order. A status flag on its own tells the
 * Secretariat that something moved but not what happened, which is the half
 * that matters when an action is late.
 */
export default function UpdateTrail({ actionId }: { actionId: string }) {
  const selector = useMemo(() => selectUpdatesFor(actionId), [actionId]);
  const updates = useAppSelector(selector);

  if (updates.length === 0) {
    return (
      <p className="border-t border-neutral-200 px-5 py-3.5 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        No progress has been reported against this action.
      </p>
    );
  }

  return (
    <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
      <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
        Progress reported
      </p>
      <ol className="mt-3 space-y-3 border-l border-neutral-200 pl-5 dark:border-neutral-800">
        {updates.map((update) => (
          <li key={update.id} className="relative">
            <span
              className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full"
              style={{
                background:
                  update.by === "System" ? "var(--viz-warning)" : "var(--viz-axis)",
              }}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {update.by}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                <FiClock size={11} aria-hidden="true" />
                {stamp(update.at)}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              {update.narrative}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
