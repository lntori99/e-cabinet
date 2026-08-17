"use client";

import Link from "next/link";
import {
  FiArrowRight,
  FiClock,
  FiDatabase,
  FiEyeOff,
  FiLock,
  FiSearch,
  FiServer,
} from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { Kpi, StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  selectArchive,
  selectQueryLog,
  selectSavedSearches,
  selectScannedRecords,
} from "@/core/slices/search-slice";
import { INDEX_POSTURE, seedIndexSegments } from "@/data/archive";
import {
  ALL_KINDS,
  KIND_TONE,
  lowConfidenceScan,
  overThreshold,
} from "../../components/searchEngine";
import HoldingsChart from "./holdingsChart";
import ResponseChart from "./responseChart";

export default function ArchiveDashboard() {
  const records = useAppSelector(selectArchive);
  const log = useAppSelector(selectQueryLog);
  const saved = useAppSelector(selectSavedSearches);
  const scanned = useAppSelector(selectScannedRecords);

  const counts = Object.fromEntries(
    ALL_KINDS.map((kind) => [kind, records.filter((r) => r.kind === kind).length]),
  ) as Record<(typeof ALL_KINDS)[number], number>;

  const years = records.map((r) => r.date.slice(0, 4)).filter(Boolean).sort();
  const span = years.length > 0 ? `${years[0]} to ${years.at(-1)}` : "—";
  const slow = log.filter((entry) => overThreshold(entry.elapsedMs));
  const poorScans = scanned.filter(lowConfidenceScan);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Records you can reach"
          value={records.length}
          hint={`${counts.Paper} papers · ${counts.Decision} decisions · ${counts.Action} actions`}
        />
        <Kpi label="Years covered" value={span} hint="Oldest to newest in the archive" />
        <Kpi
          label="Queries logged"
          value={log.length}
          hint={
            slow.length === 0
              ? "All inside the response threshold"
              : `${slow.length} over the NFR-PER-04 threshold`
          }
          tone={slow.length > 0 ? "amber" : "green"}
        />
        <Kpi
          label="Saved searches"
          value={saved.length}
          hint="Scoped to your role — a saved view never widens entitlement"
        />
      </div>

      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <FiEyeOff size={18} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            Every number on this page is already scoped to you
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-SCH-02 — the entitlement filter runs before the counting, not
            after it. Material you may not see contributes no title, no row and
            no number, and there is deliberately no “withheld” total anywhere in
            this console: a count of what you cannot see is still information
            about what exists.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <HoldingsChart records={records} />
        <ResponseChart log={log} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <span className="inline-flex items-center gap-2 font-bold">
              <FiServer size={15} className="text-neutral-400" aria-hidden="true" />
              The index
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "var(--viz-good)" }}>
              <FiLock size={12} aria-hidden="true" />
              Encrypted at rest
            </span>
          </header>

          <div className="px-5 py-4">
            <div className="space-y-0.5">
              <DetailRow label="Location" value={INDEX_POSTURE.location} />
              <DetailRow label="Replication" value={INDEX_POSTURE.replication} />
              <DetailRow label="Encryption" value={INDEX_POSTURE.encryptionAtRest} />
              <DetailRow label="Access control" value={INDEX_POSTURE.accessControl} />
              <DetailRow label="Analyser" value={INDEX_POSTURE.analyser} />
              <DetailRow
                label="Last built"
                value={stamp(seedIndexSegments[0].lastBuiltAt)}
              />
              <DetailRow
                label="External calls"
                value={
                  <span style={{ color: "var(--viz-good)" }}>
                    {INDEX_POSTURE.externalCalls}
                  </span>
                }
              />
            </div>
          </div>

          <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Segments
            </p>
            {/* A list rather than the shared register table: that table carries a
                42rem minimum so wide content scrolls, which in this narrow column
                would hide a segment's size behind a scrollbar. */}
            <ul className="space-y-2">
              {seedIndexSegments.map((segment) => (
                <li
                  key={segment.kind}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 px-4 py-2.5 dark:border-neutral-800"
                >
                  <StatusBadge tone={KIND_TONE[segment.kind]}>
                    {segment.kind}
                  </StatusBadge>
                  <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-xs text-neutral-600 dark:text-neutral-300">
                    <span>{segment.documents.toLocaleString()} docs</span>
                    <span>{segment.terms.toLocaleString()} terms</span>
                    <span>{segment.sizeMb} MB</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
              FR-SCH-04, FR-SCH-05 — indexing runs inside the Malawi-hosted
              environment and the index is protected to the same standard as the
              repository it indexes.
            </p>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <span className="inline-flex items-center gap-2 font-bold">
                <FiClock size={15} className="text-neutral-400" aria-hidden="true" />
                Recent queries
              </span>
              <Link
                href="/search-retrieval/search"
                className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
              >
                Search <FiArrowRight size={13} aria-hidden="true" />
              </Link>
            </header>
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {log.slice(0, 6).map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {entry.query || "(filters only)"}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {entry.actor} · {entry.filterSummary} · {stamp(entry.at)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-xs">
                    <span className="block text-neutral-600 dark:text-neutral-300">
                      {entry.resultCount} result{entry.resultCount === 1 ? "" : "s"}
                    </span>
                    <span
                      className="block font-mono"
                      style={{
                        color: overThreshold(entry.elapsedMs)
                          ? "var(--viz-critical)"
                          : "var(--viz-axis)",
                      }}
                    >
                      {entry.elapsedMs.toLocaleString()} ms
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="border-t border-neutral-200 px-5 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              FR-SCH-06 — every query reaches the audit log with the user, the
              query and the result count. What it returned is not logged; who
              asked, and how much came back, is.
            </p>
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <span className="inline-flex items-center gap-2 font-bold">
                <FiDatabase size={15} className="text-neutral-400" aria-hidden="true" />
                Scanned annexes
              </span>
              <StatusBadge tone="amber">Release 2</StatusBadge>
            </header>
            <div className="px-5 py-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                FR-SCH-09 — a bound annexe arrives as an image and carries no text
                of its own. What is searchable is what optical character
                recognition recovered, so the confidence travels with the record.
              </p>
              {scanned.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                  Nothing in the archive came in as a scan.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {scanned.map((record) => (
                    <li
                      key={record.id}
                      className="flex flex-wrap items-start justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="block text-neutral-800 dark:text-neutral-200">
                          {record.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                          {record.id} · {record.ocr?.pages} pages · processed{" "}
                          {record.ocr ? stamp(record.ocr.processedAt) : ""}
                        </span>
                      </span>
                      <StatusBadge tone={lowConfidenceScan(record) ? "amber" : "green"}>
                        {Math.round((record.ocr?.confidence ?? 0) * 100)}% confidence
                      </StatusBadge>
                    </li>
                  ))}
                </ul>
              )}
              {poorScans.length > 0 && (
                <p className="mt-3 text-xs" style={{ color: "var(--viz-warning)" }}>
                  {poorScans.length} scan
                  {poorScans.length === 1 ? " is" : "s are"} below the confidence
                  floor. A search may miss text in these, and the result list says
                  so rather than pretending otherwise.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <FiSearch size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        The archive holds no copy of anything. Papers come from the document
        repository, decisions and actions from the decision record — searched as
        one corpus, owned where they were made.
      </p>
    </div>
  );
}
