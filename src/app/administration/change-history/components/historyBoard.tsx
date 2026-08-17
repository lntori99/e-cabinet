"use client";

import { useMemo, useState } from "react";
import { FiArrowRight, FiRotateCcw, FiSearch, FiShield } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { controlCls, filterCls } from "@/common/field";
import { Table, Td, Th } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectChanges } from "@/core/slices/admin-slice";
import type { ConfigArea } from "@/models/response/base-response";

const ALL = "All";
const AREAS: ConfigArea[] = [
  "Roles and permissions",
  "Classification handling",
  "Meeting types",
  "Clearance paths",
  "Retention classes",
  "Notification templates",
];

/**
 * FR-ADM-04 — previous value, new value, actor, timestamp. All four in every
 * row, because a change record without the previous value cannot answer the
 * only question anybody asks of it: what was it before somebody touched it.
 */
export default function HistoryBoard() {
  const changes = useAppSelector(selectChanges);

  const [query, setQuery] = useState("");
  const [area, setArea] = useState<string>(ALL);
  const [security, setSecurity] = useState<string>(ALL);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return changes.filter(
      (change) =>
        (area === ALL || change.area === area) &&
        (security === ALL ||
          (security === "Security-relevant") === change.securityRelevant) &&
        (q.length === 0 ||
          change.label.toLowerCase().includes(q) ||
          change.actor.toLowerCase().includes(q) ||
          change.previousValue.toLowerCase().includes(q) ||
          change.newValue.toLowerCase().includes(q)),
    );
  }, [changes, query, area, security]);

  const dirty = query.trim().length > 0 || area !== ALL || security !== ALL;

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
            placeholder="Search the setting, the actor, or either value"
            aria-label="Search the change history"
            className={`${controlCls} pl-9`}
          />
        </label>
        <Filter label="Area">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            aria-label="Filter by area"
            className={filterCls}
          >
            {[ALL, ...AREAS].map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Filter>
        <Filter label="Kind">
          <select
            value={security}
            onChange={(e) => setSecurity(e.target.value)}
            aria-label="Filter by whether the change was security-relevant"
            className={filterCls}
          >
            {[ALL, "Security-relevant", "Routine"].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Filter>
        {dirty && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setArea(ALL);
              setSecurity(ALL);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
          >
            <FiRotateCcw size={14} aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {shown.length} of {changes.length} changes
      </p>

      {shown.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={FiSearch}
            title="Nothing matches"
            description="No configuration change matches that combination of area, kind and search text."
          />
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>When</Th>
              <Th>Setting</Th>
              <Th>Was</Th>
              <Th>Became</Th>
              <Th>Who</Th>
              <Th>Approval</Th>
            </tr>
          </thead>
          <tbody>
            {shown.map((change) => (
              <tr
                key={change.id}
                className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
              >
                <Td>
                  <span className="whitespace-nowrap font-mono">
                    {change.at.replace("T", " ")}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {change.id}
                  </span>
                </Td>
                <Td>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {change.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {change.area}
                  </span>
                </Td>
                <Td>
                  <span className="text-neutral-600 line-through decoration-neutral-400 dark:text-neutral-400">
                    {change.previousValue}
                  </span>
                </Td>
                <Td>
                  <span className="inline-flex items-start gap-1.5 text-neutral-800 dark:text-neutral-200">
                    <FiArrowRight
                      size={12}
                      className="mt-1 shrink-0 text-neutral-400"
                      aria-hidden="true"
                    />
                    {change.newValue}
                  </span>
                </Td>
                <Td>
                  <span className="whitespace-nowrap">{change.actor}</span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {change.role}
                  </span>
                </Td>
                <Td>
                  {change.securityRelevant ? (
                    <span>
                      <StatusBadge tone="amber">
                        <span className="inline-flex items-center gap-1">
                          <FiShield size={10} aria-hidden="true" />
                          Second approver
                        </span>
                      </StatusBadge>
                      <span className="mt-1 block font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                        {change.approvalId ?? "—"}
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Not required
                    </span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        The same four facts reach the audit log as each change is made, so this
        register and the audit trail cannot disagree — one is written from the
        other in the same dispatch.
      </p>
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
