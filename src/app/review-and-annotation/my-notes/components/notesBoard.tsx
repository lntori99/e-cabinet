"use client";

import { useState } from "react";
import { FiAlertTriangle, FiEyeOff, FiSearch, FiX } from "react-icons/fi";
import { LuNotebookPen } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { controlCls } from "@/common/field";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectAnnotations, selectReading } from "@/core/slices/review-slice";
import { removeAnnotation } from "@/core/thunks-review";
import { ANNOTATION_TONE } from "../../components/readingStatus";

const KINDS = ["All", "Note", "Highlight", "Bookmark"] as const;

export default function NotesBoard() {
  const dispatch = useAppDispatch();
  const annotations = useAppSelector(selectAnnotations);
  const reading = useAppSelector(selectReading);

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("All");

  const needle = query.trim().toLowerCase();
  const visible = annotations
    .filter((note) => kind === "All" || note.kind === kind)
    .filter(
      (note) =>
        !needle ||
        [note.body, note.anchorText ?? "", note.documentTitle].some((field) =>
          field.toLowerCase().includes(needle),
        ),
    );

  if (annotations.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuNotebookPen}
          title="No notes yet"
          description="Annotate a passage while reading and it appears here, searchable across every pack you can reach."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
        <FiEyeOff size={15} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        Private to you. No other user — including a platform administrator — can
        read these, and they are excluded from routine administrative access by
        design rather than by permission.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <FiSearch
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
            size={15}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search your notes"
            placeholder="Search your notes and the passages they hang off"
            className={`${controlCls} pl-9`}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setKind(option)}
              aria-pressed={kind === option}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                kind === option
                  ? "border-state-600 bg-state-600 text-white"
                  : "border-neutral-300 text-neutral-600 hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          {visible.length} of {annotations.length}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          Nothing of yours matches that.
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((note) => {
            const item = reading.find((r) => r.documentId === note.documentId);
            const stale =
              item?.supersededByVersionId && item.versionId === note.versionId;

            return (
              <li
                key={note.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={ANNOTATION_TONE[note.kind]}>
                        {note.kind}
                      </StatusBadge>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {note.documentTitle}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        page {note.page} · {note.versionId}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {note.meetingId} · {stamp(note.createdAt)}
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={() => dispatch(removeAnnotation(note.id))}
                    aria-label="Delete this note"
                    className="shrink-0 rounded p-1.5 text-neutral-400 transition hover:text-seal-500"
                  >
                    <FiX size={16} />
                  </button>
                </div>

                {note.anchorText && (
                  <p className="mt-3 border-l-2 border-signal-400 pl-3 text-sm italic text-neutral-600 dark:text-neutral-300">
                    “{note.anchorText}”
                  </p>
                )}

                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                  {note.body}
                </p>

                {stale && (
                  <p
                    className="mt-3 flex items-center gap-2 text-xs"
                    style={{ color: "var(--viz-critical)" }}
                  >
                    <FiAlertTriangle size={12} aria-hidden="true" />
                    This note is against {note.versionId}, which has been replaced by{" "}
                    {item?.supersededByVersionId}. It is kept where you made it.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
