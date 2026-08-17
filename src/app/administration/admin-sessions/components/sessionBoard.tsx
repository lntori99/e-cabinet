"use client";

import { FiAlertTriangle, FiCheck, FiClock, FiFilm, FiMapPin } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { Kpi, StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectAdminSessions } from "@/core/slices/admin-slice";
import { SESSION_RETENTION_MONTHS } from "@/data/administration";
import { markSessionReviewed } from "@/core/thunks-admin";

/** Outside these hours an administrative session is worth a second look. */
const OFFICE_HOURS = { from: 7, to: 19 };

/**
 * FR-ADM-11 — administrative sessions recorded, and the recordings retained.
 * A recording nobody watches is a recording that does not deter anything, so
 * the screen marks the ones worth watching: out of hours, from outside, or with
 * no change reference behind them.
 */
export default function SessionBoard() {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector(selectAdminSessions);

  function outOfHours(at: string): boolean {
    const hour = Number(at.slice(11, 13));
    return hour < OFFICE_HOURS.from || hour >= OFFICE_HOURS.to;
  }

  function external(address: string): boolean {
    return !address.startsWith("10.");
  }

  const unreviewed = sessions.filter((s) => !s.reviewed);
  const flagged = sessions.filter(
    (s) => outOfHours(s.startedAt) || external(s.sourceAddress) || !s.changeReference,
  );
  const held = sessions.reduce((sum, s) => sum + s.recordingSizeMb, 0);

  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={FiFilm}
          title="No sessions recorded"
          description="No administrative session has been opened. Every one that is will be recorded."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Sessions recorded" value={sessions.length} hint="All of them, without exception" />
        <Kpi
          label="Worth a second look"
          value={flagged.length}
          hint="Out of hours, from outside, or with no change reference"
          tone={flagged.length > 0 ? "amber" : "green"}
        />
        <Kpi
          label="Not yet reviewed"
          value={unreviewed.length}
          hint="A recording nobody watches deters nothing"
          tone={unreviewed.length > 0 ? "amber" : "green"}
        />
        <Kpi
          label="Recordings held"
          value={`${(held / 1024).toFixed(1)} GB`}
          hint={`Retained ${SESSION_RETENTION_MONTHS} months`}
        />
      </div>

      {sessions.map((session) => {
        const odd = outOfHours(session.startedAt);
        const fromOutside = external(session.sourceAddress);
        const unreferenced = !session.changeReference;
        const flag = odd || fromOutside || unreferenced;

        return (
          <article
            key={session.id}
            className="rounded-lg border bg-white dark:bg-neutral-900"
            style={{
              borderColor: flag ? "var(--viz-warning)" : "var(--viz-grid)",
            }}
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {session.id} · FR-ADM-11
                </p>
                <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                  {session.actor} — {session.role}
                </h3>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                  <FiClock size={13} className="text-neutral-400" aria-hidden="true" />
                  {stamp(session.startedAt)}
                  {session.endedAt ? ` to ${session.endedAt.slice(11, 16)}` : " — open"}
                </p>
              </div>
              <StatusBadge tone={session.reviewed ? "green" : "amber"}>
                {session.reviewed ? "Reviewed" : "Not reviewed"}
              </StatusBadge>
            </header>

            {flag && (
              <ul className="border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
                {odd && (
                  <Flag text="Started outside office hours" />
                )}
                {fromOutside && (
                  <Flag text={`Opened from ${session.sourceAddress}, outside Government ranges`} />
                )}
                {unreferenced && (
                  <Flag text="No approved change reference behind the session" />
                )}
              </ul>
            )}

            <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
              <div className="space-y-0.5">
                <DetailRow label="Purpose" value={session.purpose} />
                <DetailRow
                  label="Change reference"
                  value={session.changeReference ?? "None supplied"}
                />
                <DetailRow
                  label="Source"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <FiMapPin size={12} className="text-neutral-400" aria-hidden="true" />
                      {session.sourceAddress}
                    </span>
                  }
                />
              </div>
              <div className="space-y-0.5">
                <DetailRow
                  label="Recording"
                  value={`${session.recordingId} · ${session.recordingSizeMb} MB`}
                />
                <DetailRow label="Retained until" value={session.retainUntil} />
              </div>
            </div>

            {!session.reviewed && (
              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Marking a recording reviewed is itself recorded, so the review
                  of the reviewer is possible too.
                </p>
                <button
                  type="button"
                  onClick={() => dispatch(markSessionReviewed(session))}
                  className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800"
                >
                  <FiCheck size={14} aria-hidden="true" />
                  Mark reviewed
                </button>
              </footer>
            )}
          </article>
        );
      })}
    </div>
  );
}

function Flag({ text }: { text: string }) {
  return (
    <li
      className="inline-flex items-start gap-2 py-0.5 text-sm"
      style={{ color: "var(--viz-warning)" }}
    >
      <FiAlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
      {text}
    </li>
  );
}
