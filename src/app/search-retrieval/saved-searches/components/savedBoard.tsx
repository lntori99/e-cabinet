"use client";

import { useMemo } from "react";
import { FiBookmark, FiPlay, FiShield, FiTrash2, FiUser } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectArchive, selectSavedSearches } from "@/core/slices/search-slice";
import { removeSavedSearch, runSavedSearch } from "@/core/thunks-search";
import type { SavedSearch } from "@/models/response/base-response";
import {
  ALL_KINDS,
  KIND_TONE,
  describeFilters,
  runSearch,
} from "../../components/searchEngine";

/**
 * FR-SCH-07 — saved searches and filtered views, per user role. The important
 * property is what a saved search is *not*: it stores a query and a filter set,
 * never a result set. Re-running it goes back through the entitlement filter,
 * so a view saved by someone with wider access returns less in your hands, not
 * more.
 */
export default function SavedBoard() {
  const dispatch = useAppDispatch();
  const saved = useAppSelector(selectSavedSearches);
  const corpus = useAppSelector(selectArchive);

  // Run every saved view against the current corpus so the counts on this page
  // are what the viewer would actually get, not what was stored.
  const live = useMemo(
    () =>
      saved.map((item) => ({
        item,
        outcome: runSearch(corpus, item.query, item.filters),
      })),
    [saved, corpus],
  );

  if (saved.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={FiBookmark}
          title="No saved searches"
          description="Save a search from the Search screen and it appears here, kept against your account and scoped to your role."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <FiShield size={18} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            A saved search stores the question, never the answer
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Each of these is a query and a filter set. Running one goes back
            through the entitlement filter as any other search does, so a view
            cannot carry results out of the access model that produced them.
          </p>
        </div>
      </section>

      {live.map(({ item, outcome }) => (
        <SavedRow
          key={item.id}
          item={item}
          count={outcome.hits.length}
          elapsedMs={outcome.elapsedMs}
          onRun={() =>
            dispatch(
              runSavedSearch(
                item.id,
                item.name,
                item.query,
                describeFilters(item.filters),
                outcome.hits.length,
                outcome.elapsedMs,
              ),
            )
          }
          onDelete={() => dispatch(removeSavedSearch(item.id, item.name))}
        />
      ))}
    </div>
  );
}

function SavedRow({
  item,
  count,
  elapsedMs,
  onRun,
  onDelete,
}: {
  item: SavedSearch;
  count: number;
  elapsedMs: number;
  onRun: () => void;
  onDelete: () => void;
}) {
  const drifted = item.lastResultCount !== undefined && item.lastResultCount !== count;

  return (
    <article className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {item.id}
          </p>
          <h2 className="mt-1 inline-flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
            <FiBookmark size={14} className="text-neutral-400" aria-hidden="true" />
            {item.name}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <FiUser size={11} aria-hidden="true" />
            {item.owner} · {item.role}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {item.filters.kinds.length < ALL_KINDS.length ? (
            item.filters.kinds.map((kind) => (
              <StatusBadge key={kind} tone={KIND_TONE[kind]}>
                {kind}
              </StatusBadge>
            ))
          ) : (
            <StatusBadge tone="neutral">All record types</StatusBadge>
          )}
        </div>
      </header>

      <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
        <div className="space-y-0.5">
          <DetailRow
            label="Query"
            value={
              item.query ? (
                <span className="font-mono">{item.query}</span>
              ) : (
                <span className="text-neutral-500 dark:text-neutral-400">
                  Filters only, no search term
                </span>
              )
            }
          />
          <DetailRow label="Filters" value={describeFilters(item.filters)} />
          <DetailRow label="Created" value={stamp(item.createdAt)} />
        </div>
        <div className="space-y-0.5">
          <DetailRow
            label="Last run"
            value={item.lastRunAt ? stamp(item.lastRunAt) : "Never"}
          />
          <DetailRow
            label="Returned then"
            value={
              item.lastResultCount === undefined ? "—" : `${item.lastResultCount} records`
            }
          />
          <DetailRow
            label="Returns now"
            value={
              <span
                style={{ color: drifted ? "var(--viz-warning)" : undefined }}
                suppressHydrationWarning
              >
                {count} record{count === 1 ? "" : "s"} · {elapsedMs} ms
              </span>
            }
          />
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {drifted
            ? "The archive has moved since this view was last run — the count differs from what it returned then."
            : "Unchanged since it was last run."}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
          >
            <FiTrash2 size={14} aria-hidden="true" />
            Delete
          </button>
          <button
            type="button"
            onClick={onRun}
            className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800"
          >
            <FiPlay size={14} aria-hidden="true" />
            Run and log
          </button>
        </div>
      </footer>
    </article>
  );
}
