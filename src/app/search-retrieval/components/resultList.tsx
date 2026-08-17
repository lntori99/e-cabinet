"use client";

import type { ReactNode } from "react";
import { FiAlertTriangle, FiCalendar, FiFileText, FiLayers } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { StatusBadge, classificationTone } from "@/common/ui";
import { KIND_TONE, highlight, lowConfidenceScan, type Hit } from "./searchEngine";

/**
 * One result, written the same way on every archive screen. A hit found only in
 * the body is labelled as such — FR-SCH-03 is the reason the archive finds
 * things a title search would miss, and the reader is owed the reason a record
 * they did not expect is in the list.
 */
export default function ResultList({
  hits,
  query,
  emptyTitle,
  emptyDescription,
  footer,
}: {
  hits: Hit[];
  query: string;
  emptyTitle: string;
  emptyDescription: string;
  footer?: ReactNode;
}) {
  if (hits.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={FiFileText}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hits.map(({ record, snippet, fullTextOnly }) => (
        <article
          key={`${record.kind}-${record.id}`}
          className="rounded-lg border border-neutral-200 bg-white p-5 transition-colors hover:border-state-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-state-700"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {record.id}
                {record.meetingId ? ` · ${record.meetingId}` : ""}
                {record.meetingTitle ? ` · ${record.meetingTitle}` : ""}
              </p>
              <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                <Marked text={record.title} query={query} />
              </h3>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <StatusBadge tone={KIND_TONE[record.kind]}>{record.kind}</StatusBadge>
              <span className={`stamp ${classificationTone(record.classification)}`}>
                {record.classification}
              </span>
            </div>
          </div>

          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Marked text={snippet} query={query} />
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <FiCalendar size={11} aria-hidden="true" />
              {record.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiLayers size={11} aria-hidden="true" />
              {record.ministry}
            </span>
            <span>{record.status}</span>
            {record.pages !== undefined && <span>{record.pages} pages</span>}

            {fullTextOnly && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5"
                style={{ borderColor: "var(--viz-1)", color: "var(--viz-1)" }}
              >
                <FiFileText size={11} aria-hidden="true" />
                Matched in the text, not the title
              </span>
            )}

            {record.ocr && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5"
                style={{
                  borderColor: lowConfidenceScan(record)
                    ? "var(--viz-warning)"
                    : "var(--viz-grid)",
                  color: lowConfidenceScan(record)
                    ? "var(--viz-warning)"
                    : undefined,
                }}
              >
                {lowConfidenceScan(record) && (
                  <FiAlertTriangle size={11} aria-hidden="true" />
                )}
                Scanned · text recovered at{" "}
                {Math.round(record.ocr.confidence * 100)}%
              </span>
            )}
          </div>
        </article>
      ))}

      {footer}
    </div>
  );
}

/** Marks the search terms without letting the mark carry the meaning alone. */
function Marked({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlight(text, query).map((part, index) =>
        typeof part === "string" ? (
          <span key={index}>{part}</span>
        ) : (
          <mark
            key={index}
            className="rounded-sm bg-amber-100 px-0.5 text-neutral-900 dark:bg-amber-900/40 dark:text-neutral-100"
          >
            {part.hit}
          </mark>
        ),
      )}
    </>
  );
}
