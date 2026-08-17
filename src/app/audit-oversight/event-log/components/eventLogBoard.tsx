"use client";

import { useMemo, useState, type ReactNode } from "react";
import { FiLock, FiRotateCcw, FiSearch } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { controlCls, filterCls } from "@/common/field";
import { useAppSelector } from "@/core/hook";
import {
  selectAuditLog,
  selectAuditedActors,
} from "@/core/slices/oversight-slice";
import { AUDITED_ACTIONS, classifyAction } from "@/data/audit";
import EventTable from "../../components/eventTable";

const ALL = "All";
const SEVERITIES = [ALL, "info", "warning", "critical"];
const OUTCOMES = [ALL, "Success", "Denied", "Failed"];

/**
 * FR-AUD-01 and FR-AUD-02 — the whole log. What this screen does not have is
 * as much the point as what it does: there is no edit control and no delete
 * control, because the service behind it exposes neither at any privilege
 * level. FR-AUD-03 is a property of the store, not a permission check.
 */
export default function EventLogBoard() {
  const log = useAppSelector(selectAuditLog);
  const actors = useAppSelector(selectAuditedActors);

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState(ALL);
  const [actor, setActor] = useState(ALL);
  const [severity, setSeverity] = useState(ALL);
  const [outcome, setOutcome] = useState(ALL);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return log.filter(
      (event) =>
        (kind === ALL || classifyAction(event.action) === kind) &&
        (actor === ALL || event.actor === actor) &&
        (severity === ALL || event.severity === severity) &&
        (outcome === ALL || event.outcome === outcome) &&
        (q.length === 0 ||
          event.action.toLowerCase().includes(q) ||
          event.target.toLowerCase().includes(q) ||
          event.actor.toLowerCase().includes(q) ||
          event.id.toLowerCase().includes(q)),
    );
  }, [log, query, kind, actor, severity, outcome]);

  const dirty =
    query.trim().length > 0 ||
    kind !== ALL ||
    actor !== ALL ||
    severity !== ALL ||
    outcome !== ALL;

  return (
    <div className="space-y-6">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <FiLock size={18} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            There is nothing on this screen that changes a row
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-AUD-03 — the log is append-only, and the absence of an edit
            control here is not a permission the Secretariat lacks. The service
            exposes no call that modifies or deletes an audit event, at any
            privilege level, so there is nothing for a screen to offer.
          </p>
        </div>
      </section>

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
            placeholder="Search the action, the object, the actor or the event ID"
            aria-label="Search the audit log"
            className={`${controlCls} pl-9`}
          />
        </label>
        <Filter label="Kind of act">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            aria-label="Filter by kind of act"
            className={filterCls}
          >
            {[ALL, ...AUDITED_ACTIONS].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Filter>
        <Filter label="Actor">
          <select
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            aria-label="Filter by actor"
            className={filterCls}
          >
            {[ALL, ...actors].map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Filter>
        <Filter label="Outcome">
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            aria-label="Filter by outcome"
            className={filterCls}
          >
            {OUTCOMES.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Filter>
        <Filter label="Severity">
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            aria-label="Filter by severity"
            className={filterCls}
          >
            {SEVERITIES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Filter>
        {dirty && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setKind(ALL);
              setActor(ALL);
              setSeverity(ALL);
              setOutcome(ALL);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
          >
            <FiRotateCcw size={14} aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {shown.length} of {log.length} events
      </p>

      {shown.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={FiSearch}
            title="Nothing matches"
            description="No event matches that combination. Nothing has been hidden — the filters are simply narrower than the log."
          />
        </div>
      ) : (
        <EventTable events={shown} />
      )}
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
