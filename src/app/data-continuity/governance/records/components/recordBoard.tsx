"use client";

import { useMemo, useState } from "react";
import { FiFileText, FiLock, FiRotateCcw, FiSearch } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { controlCls, filterCls } from "@/common/field";
import { Table, Td, Th } from "@/common/table";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  daysToExpiry,
  expiryBand,
  selectRetainedRecords,
  selectRetentionClasses,
} from "@/core/slices/governance-slice";
import { RECORD_KINDS } from "@/data/dataGovernance";

const ALL = "All";

/**
 * FR-DAT-02 — the register of what is preserved, by class and by expiry. The
 * column that matters is the last one: a record past its date is either held by
 * something or waiting on somebody, and the row says which.
 */
export default function RecordBoard({ today }: { today: string }) {
  const records = useAppSelector(selectRetainedRecords);
  const classes = selectRetentionClasses();

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState(ALL);
  const [klass, setKlass] = useState(ALL);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records
      .filter(
        (r) =>
          (kind === ALL || r.kind === kind) &&
          (klass === ALL || r.retentionClassId === klass) &&
          (q.length === 0 ||
            r.title.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        const da = daysToExpiry(a, today);
        const db = daysToExpiry(b, today);
        if (da === null && db === null) return a.id.localeCompare(b.id);
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      });
  }, [records, query, kind, klass, today]);

  const dirty = query.trim().length > 0 || kind !== ALL || klass !== ALL;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="relative min-w-[16rem] flex-1">
          <FiSearch
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the title or the reference"
            aria-label="Search records under retention"
            className={`${controlCls} pl-9`}
          />
        </label>
        <Filter label="Kind">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            aria-label="Filter by kind"
            className={filterCls}
          >
            {[ALL, ...RECORD_KINDS].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Filter>
        <Filter label="Retention class">
          <select
            value={klass}
            onChange={(e) => setKlass(e.target.value)}
            aria-label="Filter by retention class"
            className={filterCls}
          >
            <option value={ALL}>{ALL}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Filter>
        {dirty && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setKind(ALL);
              setKlass(ALL);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
          >
            <FiRotateCcw size={14} aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {shown.length} of {records.length} records, soonest to expire first
      </p>

      {shown.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={FiFileText}
            title="Nothing matches"
            description="No record under retention matches that combination of kind, class and search text."
          />
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Record</Th>
              <Th>Kind</Th>
              <Th>Classification</Th>
              <Th>Class</Th>
              <Th>Expires</Th>
              <Th>Standing</Th>
            </tr>
          </thead>
          <tbody>
            {shown.map((record) => {
              const days = daysToExpiry(record, today);
              const band = expiryBand(record, today);
              const overdue = days !== null && days < 0;

              return (
                <tr
                  key={record.id}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  <Td>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {record.title}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {record.id} · created {record.createdAt}
                    </span>
                  </Td>
                  <Td>{record.kind}</Td>
                  <Td>
                    <span className={`stamp ${classificationTone(record.classification)}`}>
                      {record.classification}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs">
                      {classes.find((c) => c.id === record.retentionClassId)?.name ??
                        record.retentionClassId}
                    </span>
                  </Td>
                  <Td>
                    {record.expiresAt === null ? (
                      <span className="text-neutral-500 dark:text-neutral-400">
                        Never — permanent
                      </span>
                    ) : (
                      <span
                        className="whitespace-nowrap font-mono"
                        style={{ color: overdue ? "var(--viz-critical)" : undefined }}
                      >
                        {record.expiresAt}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {record.transferId ? (
                      <StatusBadge tone="neutral">
                        Transferred · {record.transferId}
                      </StatusBadge>
                    ) : record.holdId ? (
                      <span>
                        <StatusBadge tone="blue">
                          <span className="inline-flex items-center gap-1">
                            <FiLock size={10} aria-hidden="true" />
                            Held
                          </span>
                        </StatusBadge>
                        <span className="mt-1 block font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                          {record.holdId}
                        </span>
                      </span>
                    ) : (
                      <StatusBadge
                        tone={
                          band === "Passed"
                            ? "amber"
                            : band === "Within 6 months"
                              ? "amber"
                              : "green"
                        }
                      >
                        {band === "Passed" ? "Awaiting disposal" : band}
                      </StatusBadge>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  );
}
