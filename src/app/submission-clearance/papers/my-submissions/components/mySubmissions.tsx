"use client";

import { useMemo, useState } from "react";
import { FiLock, FiSearch } from "react-icons/fi";
import { LuFileStack } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { controlCls } from "@/common/field";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectMinistrySubmissions } from "@/core/slices/submissions-slice";
import { addComment } from "@/core/thunks-submissions";
import PaperDetail from "../../../components/paperDetail";
import PaperList from "../../../components/paperList";
import { SUBMITTER } from "../../../components/subStatus";

const FILTERS = [
  "All",
  "In clearance",
  "Returned for amendment",
  "Cleared",
  "Rejected",
] as const;

export default function MySubmissions({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  // FR-SUB-05 — the scope is applied by the selector, not by the screen.
  const selector = useMemo(
    () => selectMinistrySubmissions(SUBMITTER.ministry),
    [],
  );
  const mine = useAppSelector(selector);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [selectedId, setSelectedId] = useState(mine[0]?.id ?? "");

  const needle = query.trim().toLowerCase();
  const visible = mine
    .filter((s) => s.status !== "Draft")
    .filter((s) => filter === "All" || s.status === filter)
    .filter(
      (s) =>
        !needle ||
        [s.id, s.title, s.metadata.subject, s.metadata.meetingId].some((field) =>
          field.toLowerCase().includes(needle),
        ),
    );

  const selected = mine.find((s) => s.id === selectedId) ?? visible[0] ?? null;

  return (
    <div className="space-y-6">
      <p className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
        <FiLock size={14} className="shrink-0 text-neutral-400" aria-hidden="true" />
        Scoped to{" "}
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {SUBMITTER.ministry}
        </span>
        . You are signed in as {SUBMITTER.name}, {SUBMITTER.role}.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <FiSearch
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
            size={15}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search your submissions"
            placeholder="Search by title, reference or meeting"
            className={`${controlCls} pl-9`}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                filter === f
                  ? "border-state-600 bg-state-600 text-white"
                  : "border-neutral-300 text-neutral-600 hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            {visible.length} paper{visible.length === 1 ? "" : "s"}
          </p>
          <PaperList
            submissions={visible}
            selectedId={selected?.id ?? ""}
            onSelect={setSelectedId}
            emptyMessage="Nothing matches this filter."
          />
        </div>

        <div className="min-w-0">
          {selected ? (
            <PaperDetail
              submission={selected}
              now={now}
              onReply={(body, replyToId) =>
                dispatch(
                  addComment({
                    submissionId: selected.id,
                    stage: "Submission",
                    body,
                    role: SUBMITTER.role,
                    replyToId,
                  }),
                )
              }
            />
          ) : (
            <EmptyState
              icon={LuFileStack}
              title="No paper selected"
              description="Choose a submission to see its clearance position, its comment thread and every version behind it."
            />
          )}
        </div>
      </div>
    </div>
  );
}
