"use client";

import type { ReactNode } from "react";
import type { TooltipContentProps } from "recharts";

export interface SeriesKey {
  label: string;
  /** A CSS colour — always a `--viz-*` token, never a raw hex. */
  color: string;
}

/**
 * Every chart on this page sits in the same frame: a title that says what is
 * plotted, a key, the plot, and the numbers underneath.
 *
 * The numbers are not decoration. Three of the light-mode series steps sit below
 * 3:1 against the card, so the reader is owed a route to the values that does
 * not depend on telling two fills apart — that route is the table.
 */
export default function ChartFrame({
  title,
  subtitle,
  keys,
  children,
  table,
}: {
  title: string;
  subtitle: string;
  keys?: SeriesKey[];
  children: ReactNode;
  table: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <header>
        <h2 className="font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {subtitle}
        </p>
      </header>

      {keys && keys.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {keys.map((key) => (
            <li
              key={key.label}
              className="inline-flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ background: key.color }}
                aria-hidden="true"
              />
              {key.label}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">{children}</div>

      <details className="mt-4 border-t border-neutral-200 pt-3 dark:border-neutral-800">
        <summary className="cursor-pointer text-xs font-medium text-neutral-600 marker:text-neutral-400 hover:text-state-700 dark:text-neutral-300 dark:hover:text-state-400">
          Show the numbers
        </summary>
        <div className="mt-3">{table}</div>
      </details>
    </section>
  );
}

/** Value first, series name second — the reader already has the category. */
export function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  const rows = payload.filter((entry) => Number(entry.value) > 0);
  if (rows.length === 0) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
      <p className="font-medium text-neutral-900 dark:text-neutral-100">{label}</p>
      <ul className="mt-1.5 space-y-1">
        {rows.map((entry) => (
          <li key={String(entry.dataKey)} className="flex items-center gap-2">
            <span
              className="h-0.5 w-3 shrink-0 rounded-full"
              style={{ background: entry.color }}
              aria-hidden="true"
            />
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {entry.value}
            </span>
            <span className="text-neutral-500 dark:text-neutral-400">
              {entry.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
