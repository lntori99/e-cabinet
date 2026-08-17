"use client";

import { useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiBookmark,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiEdit3,
  FiFlag,
  FiMessageSquare,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { controlCls } from "@/common/field";
import { stamp } from "@/common/time";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectAnnotations, opened, pageRead } from "@/core/slices/review-slice";
import { acknowledgePaper, removeAnnotation } from "@/core/thunks-review";
import { PAGE_TEXT, READER } from "@/data/review";
import type { ReadingItem } from "@/models/response/base-response";
import { ANNOTATION_TONE, progress } from "./readingStatus";
import { AnnotateModal, CommentModal, FlagModal } from "./reviewModals";

/** Body text for a page, falling back to a stated placeholder rather than lorem. */
function pageBody(documentId: string, page: number): string {
  const pages = PAGE_TEXT[documentId];
  if (pages && pages[page - 1]) return pages[page - 1];
  return "This page is not reproduced in the demonstration build. In the deployed platform the rendered page is served from the document store with the reader's watermark composited into it.";
}

/**
 * FR-REV-01 / 02 — the reading view. Navigation by agenda item and paper is the
 * list on the left; navigation by page and search within the pack are here.
 *
 * The watermark is drawn in the page rather than over it, because that is how it
 * arrives in the deployed platform: composited server-side, with nothing on the
 * client to switch off.
 */
export default function PaperReader({
  items,
  activeId,
  now,
}: {
  items: ReadingItem[];
  activeId: string;
  now: string;
}) {
  const dispatch = useAppDispatch();
  const annotations = useAppSelector(selectAnnotations);

  const item = items.find((i) => i.documentId === activeId) ?? items[0];
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [annotating, setAnnotating] = useState<{ anchorText?: string } | null>(null);
  const [commenting, setCommenting] = useState(false);
  const [flagging, setFlagging] = useState(false);

  /** FR-REV-02 — search runs across every paper in the pack, not just this one. */
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 3) return [];
    const found: { documentId: string; documentTitle: string; page: number; text: string }[] = [];
    for (const candidate of items) {
      const pages = PAGE_TEXT[candidate.documentId] ?? [];
      pages.forEach((text, index) => {
        if (text.toLowerCase().includes(needle)) {
          found.push({
            documentId: candidate.documentId,
            documentTitle: candidate.documentTitle,
            page: index + 1,
            text,
          });
        }
      });
    }
    return found;
  }, [query, items]);

  if (!item) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        No paper is open.
      </p>
    );
  }

  const pageNotes = annotations.filter(
    (a) => a.documentId === item.documentId && a.page === page,
  );
  const body = pageBody(item.documentId, page);

  function go(next: number) {
    const bounded = Math.min(Math.max(next, 1), item.pages);
    setPage(bounded);
    dispatch(pageRead({ documentId: item.documentId, page: bounded }));
  }

  function openResult(documentId: string, resultPage: number) {
    dispatch(opened(documentId));
    setQuery("");
    setPage(resultPage);
  }

  return (
    <div className="space-y-4">
      {/* Search within the pack — FR-REV-02 */}
      <div className="relative">
        <FiSearch
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
          size={15}
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search within this pack"
          placeholder="Search within the pack — every paper, every page"
          className={`${controlCls} pl-9`}
        />
        {query.trim().length >= 3 && (
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            {results.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                Nothing in this pack matches “{query.trim()}”.
              </p>
            ) : (
              <ul className="max-h-64 space-y-1 overflow-y-auto">
                {results.map((result) => (
                  <li key={`${result.documentId}-${result.page}`}>
                    <button
                      type="button"
                      onClick={() => openResult(result.documentId, result.page)}
                      className="w-full rounded-lg px-2 py-1.5 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {result.documentTitle} · page {result.page}
                      </span>
                      <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">
                        {result.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              {item.documentId} · {item.versionId}
            </p>
            <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
              {item.documentTitle}
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {item.agendaItemTitle} · {item.meetingTitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`stamp ${classificationTone(item.classification)}`}>
              {item.classification}
            </span>
            {item.acknowledgedAt && <StatusBadge tone="green">Acknowledged</StatusBadge>}
          </div>
        </header>

        {item.supersededByVersionId && (
          <p
            className="mx-5 mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm"
            style={{ borderColor: "var(--viz-critical)" }}
          >
            <FiAlertTriangle
              size={15}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--viz-critical)" }}
              aria-hidden="true"
            />
            <span className="text-neutral-700 dark:text-neutral-300">
              You are reading {item.versionId}, which has been superseded by{" "}
              {item.supersededByVersionId}. Your notes stay against this version —
              open the replacement before the sitting.
            </span>
          </p>
        )}

        {/* The page itself */}
        <div className="px-5 py-6">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-lg border border-neutral-200 bg-white px-8 py-10 dark:border-neutral-700 dark:bg-neutral-950">
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <p className="-rotate-[24deg] text-center font-mono text-base font-semibold uppercase leading-relaxed tracking-[0.2em] text-seal-500/10">
                {item.classification}
                <span className="mt-1 block text-sm tracking-[0.16em]">
                  {READER.name} · {stamp(now)}
                </span>
                <span className="mt-1 block text-sm tracking-[0.16em]">
                  {item.meetingId} · {item.versionId}
                </span>
              </p>
            </div>

            <div className="relative">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                Page {page} of {item.pages}
              </p>
              <p className="mt-4 text-lg leading-relaxed text-neutral-800 dark:text-neutral-200">
                {body}
              </p>

              {/* FR-REV-03 — the annotation surface for this page */}
              <button
                type="button"
                onClick={() => setAnnotating({ anchorText: body.slice(0, 72) })}
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:border-state-400 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300"
              >
                <FiEdit3 size={14} aria-hidden="true" />
                Annotate this passage
              </button>
            </div>
          </div>

          {/* Page navigation */}
          <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(page - 1)}
              disabled={page === 1}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"
            >
              <FiChevronLeft size={15} aria-hidden="true" />
              Previous
            </button>

            <span className="flex items-center gap-2">
              {Array.from({ length: item.pages }, (_, index) => index + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => go(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === page ? "page" : undefined}
                  className={`h-1.5 w-5 rounded-full transition ${
                    n === page
                      ? "bg-state-600"
                      : n <= item.pagesRead
                        ? "bg-state-300 dark:bg-state-800"
                        : "bg-neutral-200 dark:bg-neutral-700"
                  }`}
                />
              ))}
            </span>

            <button
              type="button"
              onClick={() => go(page + 1)}
              disabled={page === item.pages}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"
            >
              Next
              <FiChevronRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Notes on this page */}
        {pageNotes.length > 0 && (
          <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              Your notes on this page
            </h3>
            <ul className="mt-2 space-y-2">
              {pageNotes.map((note) => (
                <li
                  key={note.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={ANNOTATION_TONE[note.kind]}>
                        {note.kind}
                      </StatusBadge>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {stamp(note.createdAt)}
                      </span>
                    </span>
                    {note.anchorText && (
                      <span className="mt-2 block border-l-2 border-signal-400 pl-3 text-sm italic text-neutral-600 dark:text-neutral-300">
                        “{note.anchorText}”
                      </span>
                    )}
                    <span className="mt-2 block text-sm text-neutral-700 dark:text-neutral-300">
                      {note.body}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => dispatch(removeAnnotation(note.id))}
                    aria-label="Delete this note"
                    className="shrink-0 rounded p-1.5 text-neutral-400 transition hover:text-seal-500"
                  >
                    <FiX size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            {item.acknowledgedAt
              ? `Acknowledged ${stamp(item.acknowledgedAt)}`
              : `${progress(item)}% read — acknowledge when you have finished with it`}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setAnnotating({})}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
            >
              <FiBookmark size={14} aria-hidden="true" />
              Private note
            </button>
            <button
              type="button"
              onClick={() => setCommenting(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
            >
              <FiMessageSquare size={14} aria-hidden="true" />
              Comment
            </button>
            <button
              type="button"
              onClick={() => setFlagging(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
            >
              <FiFlag size={14} aria-hidden="true" />
              Flag
            </button>
            {!item.acknowledgedAt && (
              <button
                type="button"
                onClick={() => dispatch(acknowledgePaper(item))}
                className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700"
              >
                <FiCheck size={15} aria-hidden="true" />
                Acknowledge as read
              </button>
            )}
          </div>
        </footer>
      </div>

      {annotating && (
        <AnnotateModal
          item={item}
          page={page}
          anchorText={annotating.anchorText}
          onClose={() => setAnnotating(null)}
        />
      )}
      {commenting && (
        <CommentModal item={item} page={page} onClose={() => setCommenting(false)} />
      )}
      {flagging && <FlagModal item={item} onClose={() => setFlagging(false)} />}
    </div>
  );
}
