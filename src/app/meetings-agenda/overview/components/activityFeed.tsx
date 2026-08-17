"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAppDispatch } from "@/core/hook";
import { selected } from "@/core/slices/meetings-slice";
import type { Meeting } from "@/models/response/base-response";

/** FR-MTG-09 — who changed an agenda, when, and what changed. */
export default function ActivityFeed({ meetings }: { meetings: Meeting[] }) {
  const dispatch = useAppDispatch();

  const entries = useMemo(
    () =>
      meetings
        .flatMap((meeting) => meeting.history.map((change) => ({ meeting, change })))
        .sort((a, b) => b.change.at.localeCompare(a.change.at))
        .slice(0, 8),
    [meetings],
  );

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
          Recent agenda changes
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          Across every sitting
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          Nothing has been changed yet.
        </p>
      ) : (
        <ol className="mt-4 space-y-3.5">
          {entries.map(({ meeting, change }) => (
            <li key={`${meeting.id}-${change.id}`} className="flex gap-3">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-state-500"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {change.summary}
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {change.at.replace("T", " ")} · {change.by} ·{" "}
                  <Link
                    href="/meetings-agenda/all-meetings"
                    onClick={() => dispatch(selected(meeting.id))}
                    className="hover:text-state-700 dark:hover:text-state-400"
                  >
                    {meeting.id}
                  </Link>
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
