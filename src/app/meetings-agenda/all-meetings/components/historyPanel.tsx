"use client";

import { LuHistory } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import type { Meeting } from "@/models/response/base-response";

/**
 * FR-MTG-09 — who changed the agenda, when, and what changed. Entries are
 * appended by the store on every mutation and are never edited or removed.
 */
export default function HistoryPanel({ meeting }: { meeting: Meeting }) {
  if (meeting.history.length === 0) {
    return (
      <EmptyState
        icon={LuHistory}
        title="No changes recorded yet"
        description="Every change to this meeting and its agenda is written here automatically, with the person who made it and when."
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {meeting.history.length} change
        {meeting.history.length === 1 ? "" : "s"} recorded. Newest first; entries
        cannot be edited or removed.
      </p>

      <ol className="relative space-y-4 border-l border-neutral-200 pl-5 dark:border-neutral-800">
        {meeting.history.map((entry) => (
          <li key={entry.id} className="relative">
            <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-state-500 dark:border-neutral-950" />
            <p className="text-sm text-neutral-800 dark:text-neutral-200">
              {entry.summary}
            </p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {entry.by} · {entry.at.replace("T", " ")}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
