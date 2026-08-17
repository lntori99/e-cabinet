"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  FiAlertTriangle,
  FiBookmark,
  FiClock,
  FiRotateCcw,
  FiSearch,
  FiShield,
  FiZap,
} from "react-icons/fi";
import { Field, TextInput, controlCls, filterCls } from "@/common/field";
import { CLASSIFICATIONS } from "@/core/app-constants";
import { OPERATOR } from "@/core/app-constants";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectArchive, selectSavedSearches } from "@/core/slices/search-slice";
import { EMPTY_FILTERS, SEARCH_THRESHOLD_MS } from "@/data/archive";
import { logQuery, saveSearch } from "@/core/thunks-search";
import type { ArchiveKind, SearchFilters } from "@/models/response/base-response";
import ResultList from "../../components/resultList";
import {
  ALL_KINDS,
  KIND_COLOR,
  describeFilters,
  overThreshold,
  runSearch,
} from "../../components/searchEngine";

const ALL = "All";

/**
 * FR-SCH-01 and FR-SCH-03 — the search itself, over the whole corpus, with the
 * filter set the requirement names. The corpus arrives already scoped by
 * entitlement, so nothing on this screen can widen it.
 */
export default function SearchConsole({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const corpus = useAppSelector(selectArchive);
  const saved = useAppSelector(selectSavedSearches);

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [name, setName] = useState("");
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const ministries = useMemo(
    () => [ALL, ...new Set(corpus.map((r) => r.ministry))].sort(),
    [corpus],
  );
  const meetings = useMemo(
    () => [ALL, ...new Set(corpus.map((r) => r.meetingId).filter(Boolean))] as string[],
    [corpus],
  );
  const statuses = useMemo(
    () => [ALL, ...new Set(corpus.map((r) => r.status))].sort(),
    [corpus],
  );

  const outcome = useMemo(
    () => runSearch(corpus, query, filters),
    [corpus, query, filters],
  );

  const dirty =
    query.trim().length > 0 ||
    JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  function set<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function toggleKind(kind: ArchiveKind) {
    setFilters((prev) => {
      const next = prev.kinds.includes(kind)
        ? prev.kinds.filter((k) => k !== kind)
        : [...prev.kinds, kind];
      // Never leave the query with nothing to search — an empty set would
      // return nothing and read as a fault rather than a filter.
      return { ...prev, kinds: next.length === 0 ? ALL_KINDS : next };
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <label className="relative block">
          <FiSearch
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the full text of papers, decisions and actions"
            aria-label="Search the archive"
            className={`${controlCls} py-3 pl-11 text-base`}
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Record type
          </span>
          {ALL_KINDS.map((kind) => {
            const on = filters.kinds.includes(kind);
            return (
              <button
                key={kind}
                type="button"
                onClick={() => toggleKind(kind)}
                aria-pressed={on}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                  on
                    ? "border-state-500 bg-state-50 text-state-800 dark:bg-state-900/30 dark:text-state-300"
                    : "border-neutral-300 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ background: on ? KIND_COLOR[kind] : "var(--viz-axis)" }}
                  aria-hidden="true"
                />
                {kind}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <p className="inline-flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {outcome.hits.length} result{outcome.hits.length === 1 ? "" : "s"}
            </span>
            {/* Measured where the render happens, so the server pass and the
                hydrated value legitimately differ. It is a timing, not content. */}
            <span
              className="inline-flex items-center gap-1.5 font-mono text-xs"
              style={{
                color: overThreshold(outcome.elapsedMs)
                  ? "var(--viz-critical)"
                  : "var(--viz-good)",
              }}
              suppressHydrationWarning
            >
              {overThreshold(outcome.elapsedMs) ? (
                <FiAlertTriangle size={12} aria-hidden="true" />
              ) : (
                <FiZap size={12} aria-hidden="true" />
              )}
              {outcome.elapsedMs} ms
              <span className="text-neutral-500 dark:text-neutral-400">
                · threshold {SEARCH_THRESHOLD_MS.toLocaleString()} ms
              </span>
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {describeFilters(filters)}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {dirty && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilters(EMPTY_FILTERS);
                  setSavedNote(null);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
              >
                <FiRotateCcw size={14} aria-hidden="true" />
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                dispatch(
                  logQuery(
                    query,
                    describeFilters(filters),
                    outcome.hits.length,
                    outcome.elapsedMs,
                  ),
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
            >
              <FiClock size={14} aria-hidden="true" />
              Record this query
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <Field
            label="Save this search"
            hint="FR-SCH-07 — kept against your account and scoped to your role. A saved search never widens what it returns."
            className="min-w-[18rem] flex-1"
          >
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Fertiliser subsidy — everything"
            />
          </Field>
          <button
            type="button"
            disabled={name.trim().length === 0}
            onClick={() => {
              dispatch(saveSearch(name.trim(), query, filters, outcome.hits.length));
              setSavedNote(name.trim());
              setName("");
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-state-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiBookmark size={15} aria-hidden="true" />
            Save
          </button>
        </div>

        {savedNote && (
          <p className="text-sm" style={{ color: "var(--viz-good)" }}>
            Saved as “{savedNote}”. It is in Saved Searches, under {OPERATOR.role}.
          </p>
        )}

        {saved.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Saved
            </span>
            {saved.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setQuery(item.query);
                  setFilters(item.filters);
                  setSavedNote(null);
                }}
                className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 transition hover:border-state-400 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </section>

      <p
        className="flex items-start gap-2 rounded-lg border p-3 text-sm"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <FiShield size={15} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <span className="text-neutral-600 dark:text-neutral-400">
          FR-SCH-02 — this result set is built from your entitlements before it is
          counted. Material you are not entitled to see contributes nothing here:
          no title, no row, and no number. There is no “withheld” count, because a
          count would itself say something about what exists.
        </span>
      </p>

      <ResultList
        hits={outcome.hits}
        query={query}
        emptyTitle="Nothing matches"
        emptyDescription="No record you are entitled to see matches that query and filter combination. Try fewer terms, or widen the date range."
        footer={
          <p className="pt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Searched at {now.slice(11)} · full text of {corpus.length} records ·
            indexed locally, nothing left the environment.
          </p>
        }
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
