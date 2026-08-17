"use client";

import { useMemo, useState } from "react";
import { FiFileText, FiLayers, FiUsers } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { filterCls } from "@/common/field";
import { DetailRow } from "@/common/table";
import { Kpi } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  selectAuditLog,
  selectAuditedDocuments,
} from "@/core/slices/oversight-slice";
import { classifyAction } from "@/data/audit";
import EventTable from "../../components/eventTable";

/**
 * FR-AUD-10 — the complete access history for one named document, across all
 * versions and all users. "Complete" is the operative word: this is the report
 * a leak enquiry starts from, and it is worth nothing if it silently drops a
 * version or a user.
 */
export default function DocumentHistory() {
  const log = useAppSelector(selectAuditLog);
  const documents = useAppSelector(selectAuditedDocuments);
  const [selected, setSelected] = useState(documents[0] ?? "");

  const events = useMemo(
    () =>
      selected
        ? log.filter((e) => e.target.toUpperCase().includes(selected))
        : [],
    [log, selected],
  );

  const versions = useMemo(
    () => [...new Set(events.map((e) => e.objectVersion).filter(Boolean))] as string[],
    [events],
  );
  const users = useMemo(
    () => [...new Set(events.map((e) => e.actor))],
    [events],
  );
  const downloads = events.filter((e) => classifyAction(e.action) === "Download");
  const denied = events.filter((e) => e.outcome === "Denied");

  return (
    <div className="space-y-6">
      <label className="block max-w-md">
        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Document
        </span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          aria-label="Choose a document"
          className={`${filterCls} w-full`}
        >
          {documents.map((id) => (
            <option key={id}>{id}</option>
          ))}
        </select>
      </label>

      {events.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={FiFileText}
            title="No history for this record"
            description="Nothing in the log touches this object. That is a finding in itself if the document is known to exist."
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Events" value={events.length} hint={`Against ${selected}`} />
            <Kpi
              label="Versions touched"
              value={versions.length || "—"}
              hint={versions.length > 0 ? versions.join(", ") : "No version recorded"}
            />
            <Kpi label="Distinct users" value={users.length} hint="Everyone who touched it" />
            <Kpi
              label="Downloads"
              value={downloads.length}
              hint={
                denied.length > 0
                  ? `${denied.length} further attempt${denied.length === 1 ? "" : "s"} denied`
                  : "No attempt was denied"
              }
              tone={downloads.length > 0 ? "amber" : "neutral"}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="inline-flex items-center gap-2 font-bold">
                <FiUsers size={15} className="text-neutral-400" aria-hidden="true" />
                Who touched it
              </h2>
              <ul className="mt-3 space-y-1.5">
                {users.map((user) => {
                  const mine = events.filter((e) => e.actor === user);
                  return (
                    <li
                      key={user}
                      className="flex flex-wrap items-baseline justify-between gap-3 text-sm"
                    >
                      <span className="text-neutral-800 dark:text-neutral-200">
                        {user}
                        <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                          {mine[0]?.role}
                        </span>
                      </span>
                      <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                        {mine.length} event{mine.length === 1 ? "" : "s"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="inline-flex items-center gap-2 font-bold">
                <FiLayers size={15} className="text-neutral-400" aria-hidden="true" />
                Across versions
              </h2>
              <div className="mt-3 space-y-0.5">
                <DetailRow
                  label="First event"
                  value={events.at(-1)?.timestamp.replace("T", " ") ?? "—"}
                />
                <DetailRow
                  label="Most recent"
                  value={events[0]?.timestamp.replace("T", " ") ?? "—"}
                />
                <DetailRow
                  label="Versions on the record"
                  value={versions.length > 0 ? versions.join(", ") : "None recorded"}
                />
                <DetailRow
                  label="Denied attempts"
                  value={
                    denied.length === 0 ? (
                      "None"
                    ) : (
                      <span style={{ color: "var(--viz-warning)" }}>
                        {denied.length} — handling policy refused the act
                      </span>
                    )
                  }
                />
              </div>
            </section>
          </div>

          <EventTable events={events} showObject={false} />

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            FR-AUD-10 — the history covers every version and every user, not the
            current version and not the users still holding an entitlement.
            Somebody whose access was withdrawn last month is still in this list
            for what they did before it was.
          </p>
        </>
      )}
    </div>
  );
}
