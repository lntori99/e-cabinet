"use client";

import { FiAlertTriangle, FiBookmark, FiFlag, FiMessageSquare } from "react-icons/fi";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectAnnotations, selectComments, selectFlags } from "@/core/slices/review-slice";
import type { ReadingItem } from "@/models/response/base-response";
import { progress, readingState } from "./readingStatus";

export default function ReadingList({
  items,
  selectedId,
  onSelect,
  emptyMessage,
}: {
  items: ReadingItem[];
  selectedId: string;
  onSelect: (documentId: string) => void;
  emptyMessage: string;
}) {
  const annotations = useAppSelector(selectAnnotations);
  const comments = useAppSelector(selectComments);
  const flags = useAppSelector(selectFlags);

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const active = item.documentId === selectedId;
        const state = readingState(item);
        const percent = progress(item);
        const noteCount = annotations.filter(
          (a) => a.documentId === item.documentId,
        ).length;
        const commentCount = comments.filter(
          (c) => c.documentId === item.documentId,
        ).length;
        const flagCount = flags.filter(
          (f) => f.documentId === item.documentId && f.status !== "Resolved",
        ).length;

        return (
          <li key={item.documentId}>
            <button
              type="button"
              onClick={() => onSelect(item.documentId)}
              aria-current={active ? "true" : undefined}
              className={`w-full rounded-lg border p-3 text-left transition ${
                active
                  ? "border-state-500 bg-state-50 dark:border-state-700 dark:bg-state-900/20"
                  : "border-neutral-200 bg-white hover:border-state-300 dark:border-neutral-800 dark:bg-neutral-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {item.documentId}
                </span>
                <StatusBadge tone={state.tone}>{state.label}</StatusBadge>
              </div>

              <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
                {item.documentTitle}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {item.agendaItemTitle}
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
                  role="img"
                  aria-label={`${percent}% read`}
                >
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${percent}%`, background: "var(--viz-ramp-4)" }}
                  />
                </span>
                <span className="shrink-0 font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                  {item.pagesRead}/{item.pages}pp
                </span>
              </div>

              <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                <span className={`stamp ${classificationTone(item.classification)}`}>
                  {item.classification}
                </span>
                {noteCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <FiBookmark size={10} aria-hidden="true" /> {noteCount}
                  </span>
                )}
                {commentCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <FiMessageSquare size={10} aria-hidden="true" /> {commentCount}
                  </span>
                )}
                {flagCount > 0 && (
                  <span
                    className="inline-flex items-center gap-1"
                    style={{ color: "var(--viz-warning)" }}
                  >
                    <FiFlag size={10} aria-hidden="true" /> {flagCount}
                  </span>
                )}
                {item.supersededByVersionId && (
                  <span
                    className="inline-flex items-center gap-1"
                    style={{ color: "var(--viz-critical)" }}
                  >
                    <FiAlertTriangle size={10} aria-hidden="true" /> Superseded
                  </span>
                )}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
