"use client";

import { useMemo, useState, type ReactNode } from "react";
import { FiRotateCcw, FiSearch } from "react-icons/fi";
import { controlCls, filterCls } from "@/common/field";
import { CLASSIFICATIONS } from "@/core/app-constants";
import { useAppSelector } from "@/core/hook";
import { selectArchive } from "@/core/slices/search-slice";
import { EMPTY_FILTERS } from "@/data/archive";
import type { ArchiveKind, SearchFilters } from "@/models/response/base-response";
import ResultList from "./resultList";
import { runSearch } from "./searchEngine";

const ALL = "All";

/**
 * Papers, Decisions and Actions are the same browser with the record type fixed.
 * They exist as separate destinations because that is how people arrive — "find
 * me the Health papers" is a different starting point from "search everything" —
 * but they run the same query over the same entitlement-scoped corpus.
 */
export default function KindBrowser({
  kind,
  emptyTitle,
  emptyDescription,
}: {
  kind: ArchiveKind;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const corpus = useAppSelector(selectArchive);

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    ...EMPTY_FILTERS,
    kinds: [kind],
  });

  const scoped = useMemo(() => corpus.filter((r) => r.kind === kind), [corpus, kind]);

  const ministries = useMemo(
    () => [ALL, ...new Set(scoped.map((r) => r.ministry))].sort(),
    [scoped],
  );
  const meetings = useMemo(
    () => [ALL, ...new Set(scoped.map((r) => r.meetingId).filter(Boolean))] as string[],
    [scoped],
  );
  const statuses = useMemo(
    () => [ALL, ...new Set(scoped.map((r) => r.status))].sort(),
    [scoped],
  );

  const outcome = useMemo(
    () => runSearch(corpus, query, filters),
    [corpus, query, filters],
  );

  const dirty =
    query.trim().length > 0 ||
    filters.ministry !== ALL ||
    filters.meeting !== ALL ||
    filters.classification !== ALL ||
    filters.status !== ALL ||
    filters.from !== "" ||
    filters.to !== "";

  function set<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="relative block">
          <FiSearch
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search the full text of ${kind.toLowerCase()} records`}
            aria-label={`Search ${kind} records`}
            className={`${controlCls} pl-9`}
          />
        </label>

        {/* Labelled rather than a bare row of "All" boxes — six identical
            selects side by side tell the reader nothing about what each does. */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Filter label="Meeting">
            <select
              value={filters.meeting}
              onChange={(e) => set("meeting", e.target.value)}
              aria-label="Filter by meeting"
              className={`${filterCls} w-full`}
            >
              {meetings.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Filter>
          <Filter label="Ministry">
            <select
              value={filters.ministry}
              onChange={(e) => set("ministry", e.target.value)}
              aria-label="Filter by ministry"
              className={`${filterCls} w-full`}
            >
              {ministries.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Filter>
          <Filter label="Classification">
            <select
              value={filters.classification}
              onChange={(e) => set("classification", e.target.value)}
              aria-label="Filter by classification"
              className={`${filterCls} w-full`}
            >
              {[ALL, ...CLASSIFICATIONS].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Filter>
          <Filter label="Status">
            <select
              value={filters.status}
              onChange={(e) => set("status", e.target.value)}
              aria-label="Filter by status"
              className={`${filterCls} w-full`}
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Filter>
          <Filter label="From">
            <input
              type="date"
              value={filters.from}
              onChange={(e) => set("from", e.target.value)}
              aria-label="Earliest date"
              className={`${filterCls} w-full`}
            />
          </Filter>
          <Filter label="To">
            <input
              type="date"
              value={filters.to}
              onChange={(e) => set("to", e.target.value)}
              aria-label="Latest date"
              className={`${filterCls} w-full`}
            />
          </Filter>
        </div>

        {dirty && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilters({ ...EMPTY_FILTERS, kinds: [kind] });
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
          >
            <FiRotateCcw size={14} aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      {/* The elapsed figure is measured where the render happens, so it does
          not match between the server pass and hydration. It is a timing, not
          content, and is allowed to differ. */}
      <p
        className="text-sm text-neutral-500 dark:text-neutral-400"
        suppressHydrationWarning
      >
        {outcome.hits.length} of {scoped.length} {kind.toLowerCase()} records ·{" "}
        {outcome.elapsedMs} ms
      </p>

      <ResultList
        hits={outcome.hits}
        query={query}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    </div>
  );
}

function Filter({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  );
}
