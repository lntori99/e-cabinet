"use client";

import { useState } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiCornerUpRight,
  FiEye,
  FiSearch,
} from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { TextArea } from "@/common/field";
import { DetailRow } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectAlerts } from "@/core/slices/oversight-slice";
import { reviewAlert } from "@/core/thunks-oversight";
import type { AnomalyAlert } from "@/models/response/base-response";

const STATE_TONE: Record<AnomalyAlert["state"], "green" | "amber" | "red" | "neutral"> = {
  Open: "red",
  "Under review": "amber",
  "Closed — explained": "neutral",
  "Closed — acted on": "green",
};

/**
 * FR-AUD-15 — the four patterns the requirement names. Each alert carries the
 * rule that fired alongside the observation, because half of reviewing alerts
 * is judging whether the rule was right to fire. An alert closed as "explained"
 * is not a false alarm — it is a rule doing exactly what it should.
 */
export default function AlertBoard() {
  const alerts = useAppSelector(selectAlerts);

  const open = alerts.filter((a) => a.state === "Open" || a.state === "Under review");
  const closed = alerts.filter((a) => a.state.startsWith("Closed"));

  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            "Bulk download",
            "Out-of-hours access to high classification",
            "Repeated authorisation failure",
            "Privilege change",
          ] as const
        ).map((pattern) => {
          const count = alerts.filter((a) => a.pattern === pattern).length;
          return (
            <div
              key={pattern}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {pattern}
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {count === 0
                  ? "Nothing detected"
                  : `${count} raised${
                      alerts.filter((a) => a.pattern === pattern && a.state === "Open")
                        .length > 0
                        ? ", one still open"
                        : ""
                    }`}
              </p>
            </div>
          );
        })}
      </section>

      <section className="space-y-4">
        <h2 className="font-bold">Awaiting disposition</h2>
        {open.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              icon={FiCheckCircle}
              title="Nothing is open"
              description="Every alert raised has been reviewed and dispositioned. New ones appear here as the detectors fire."
            />
          </div>
        ) : (
          open.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        )}
      </section>

      {closed.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-bold">Dispositioned</h2>
          {closed.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </section>
      )}
    </div>
  );
}

function AlertCard({ alert }: { alert: AnomalyAlert }) {
  const dispatch = useAppDispatch();
  const [note, setNote] = useState(alert.disposition ?? "");
  const open = alert.state === "Open" || alert.state === "Under review";

  return (
    <article
      className="rounded-lg border bg-white dark:bg-neutral-900"
      style={{
        borderColor: open
          ? alert.severity === "critical"
            ? "var(--viz-critical)"
            : "var(--viz-warning)"
          : "var(--viz-grid)",
      }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {alert.id} · FR-AUD-15 · {alert.raisedAt.replace("T", " ")}
          </p>
          <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
            {alert.pattern}
          </h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {alert.actor} · {alert.role}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <StatusBadge tone={alert.severity === "critical" ? "red" : "amber"}>
            {alert.severity}
          </StatusBadge>
          <StatusBadge tone={STATE_TONE[alert.state]}>{alert.state}</StatusBadge>
        </div>
      </header>

      <div className="px-5 py-4">
        <p
          className="flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{
            borderColor:
              alert.severity === "critical"
                ? "var(--viz-critical)"
                : "var(--viz-warning)",
          }}
        >
          <FiAlertTriangle
            size={15}
            className="mt-0.5 shrink-0"
            style={{
              color:
                alert.severity === "critical"
                  ? "var(--viz-critical)"
                  : "var(--viz-warning)",
            }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            {alert.observation}
          </span>
        </p>

        <div className="mt-4 space-y-0.5">
          <DetailRow label="Rule that fired" value={alert.rule} />
          <DetailRow
            label="Evidence"
            value={
              <span className="font-mono text-xs">{alert.evidence.join(", ")}</span>
            }
          />
          {alert.reviewedBy && (
            <DetailRow
              label="Reviewed"
              value={`${alert.reviewedBy} · ${alert.reviewedAt?.replace("T", " ")}`}
            />
          )}
        </div>

        {alert.disposition && !open && (
          <p className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              Disposition.{" "}
            </span>
            {alert.disposition}
          </p>
        )}

        {open && (
          <div className="mt-4">
            <label
              htmlFor={`disp-${alert.id}`}
              className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200"
            >
              Disposition
            </label>
            <TextArea
              id={`disp-${alert.id}`}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was found, and what was done about it."
            />
          </div>
        )}
      </div>

      {open && (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            An alert is dispositioned, never deleted. Closing it writes an audit
            event of its own.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {alert.state === "Open" && (
              <button
                type="button"
                onClick={() => dispatch(reviewAlert(alert, "Under review", note))}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
              >
                <FiEye size={14} aria-hidden="true" />
                Take for review
              </button>
            )}
            <button
              type="button"
              disabled={note.trim().length === 0}
              onClick={() => dispatch(reviewAlert(alert, "Closed — explained", note))}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
            >
              <FiCornerUpRight size={14} aria-hidden="true" />
              Close — explained
            </button>
            <button
              type="button"
              disabled={note.trim().length === 0}
              onClick={() => dispatch(reviewAlert(alert, "Closed — acted on", note))}
              className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiCheckCircle size={14} aria-hidden="true" />
              Close — acted on
            </button>
          </div>
        </footer>
      )}

      {!open && (
        <footer className="flex flex-wrap items-center gap-2 border-t border-neutral-200 px-5 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <FiSearch size={12} aria-hidden="true" />
          The evidence events remain in the log whatever the disposition. Closing
          an alert closes the review, not the record.
        </footer>
      )}
    </article>
  );
}
