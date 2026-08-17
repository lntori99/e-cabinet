"use client";

import { useState } from "react";
import { FiAlertTriangle, FiCalendar, FiCheck, FiMinus, FiSlash } from "react-icons/fi";
import { TextArea } from "@/common/field";
import { DetailRow } from "@/common/table";
import { Kpi, StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectEntitlements } from "@/core/slices/oversight-slice";
import { REVIEW_PERIOD } from "@/data/audit";
import { decideEntitlement } from "@/core/thunks-oversight";
import type { EntitlementLine } from "@/models/response/base-response";

const DECISION_TONE: Record<
  EntitlementLine["decision"],
  "green" | "amber" | "red" | "neutral"
> = {
  "Not reviewed": "amber",
  Confirmed: "green",
  Reduce: "amber",
  Revoke: "red",
};

/**
 * FR-AUD-12 — the quarterly review, per role and per user. What makes it a
 * review rather than a listing is the activity count beside each entitlement:
 * an account with a standing entitlement and no events in the period is the
 * finding the exercise exists to produce.
 */
export default function AccessReview() {
  const lines = useAppSelector(selectEntitlements);

  const unreviewed = lines.filter((l) => l.decision === "Not reviewed");
  const dormant = lines.filter((l) => l.eventsInPeriod === 0);
  const withdrawn = lines.filter(
    (l) => l.decision === "Revoke" || l.decision === "Reduce",
  );

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="inline-flex items-center gap-2 font-bold">
              <FiCalendar size={15} className="text-neutral-400" aria-hidden="true" />
              {REVIEW_PERIOD.label}
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Activity counted from {REVIEW_PERIOD.from} to {REVIEW_PERIOD.to}. The
              review is owed to the {REVIEW_PERIOD.owner} by{" "}
              {REVIEW_PERIOD.dueBy}.
            </p>
          </div>
          <StatusBadge tone={unreviewed.length === 0 ? "green" : "amber"}>
            {unreviewed.length === 0
              ? "Complete"
              : `${unreviewed.length} outstanding`}
          </StatusBadge>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Entitlements in scope" value={lines.length} hint="Per user, per role" />
        <Kpi
          label="Not yet reviewed"
          value={unreviewed.length}
          hint="Each needs a decision before the quarter closes"
          tone={unreviewed.length > 0 ? "amber" : "green"}
        />
        <Kpi
          label="No activity in the period"
          value={dormant.length}
          hint="A standing entitlement nobody used"
          tone={dormant.length > 0 ? "red" : "green"}
        />
        <Kpi
          label="Reduced or revoked"
          value={withdrawn.length}
          hint="Decisions that narrow access"
        />
      </div>

      {dormant.length > 0 && (
        <p
          className="flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--viz-warning)" }}
        >
          <FiAlertTriangle
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-warning)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            {dormant.length} account
            {dormant.length === 1 ? " holds an entitlement it" : "s hold entitlements they"}{" "}
            did not use once in the period. An unused entitlement is not harmless —
            it is a credential nobody would miss.
          </span>
        </p>
      )}

      {lines.map((line) => (
        <ReviewRow key={line.id} line={line} />
      ))}
    </div>
  );
}

function ReviewRow({ line }: { line: EntitlementLine }) {
  const dispatch = useAppDispatch();
  const [note, setNote] = useState(line.note ?? "");
  const dormant = line.eventsInPeriod === 0;

  return (
    <article
      className="rounded-lg border bg-white dark:bg-neutral-900"
      style={{
        borderColor: dormant ? "var(--viz-warning)" : "var(--viz-grid)",
      }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {line.id} · {line.ministry}
          </p>
          <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
            {line.user}
          </h3>
          <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
            {line.role}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {dormant && <StatusBadge tone="red">No activity</StatusBadge>}
          <StatusBadge tone={DECISION_TONE[line.decision]}>{line.decision}</StatusBadge>
        </div>
      </header>

      <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            What the role grants
          </p>
          <ul className="mt-2 space-y-1">
            {line.entitlements.map((entitlement) => (
              <li
                key={entitlement}
                className="text-sm text-neutral-700 dark:text-neutral-300"
              >
                {entitlement}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-0.5">
          <DetailRow
            label="Events in the period"
            value={
              <span style={{ color: dormant ? "var(--viz-warning)" : undefined }}>
                {line.eventsInPeriod}
              </span>
            }
          />
          <DetailRow
            label="Last active"
            value={line.lastActiveAt?.replace("T", " ") ?? "Never"}
          />
          <DetailRow label="Reviewed by" value={line.reviewedBy ?? "Not yet reviewed"} />
        </div>
      </div>

      <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <label
          htmlFor={`note-${line.id}`}
          className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200"
        >
          Reviewer's note
        </label>
        <TextArea
          id={`note-${line.id}`}
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What was checked, and why the decision below follows from it."
        />
      </div>

      <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => dispatch(decideEntitlement(line, "Revoke", note))}
          className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
        >
          <FiSlash size={14} aria-hidden="true" />
          Revoke
        </button>
        <button
          type="button"
          onClick={() => dispatch(decideEntitlement(line, "Reduce", note))}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
        >
          <FiMinus size={14} aria-hidden="true" />
          Reduce
        </button>
        <button
          type="button"
          onClick={() => dispatch(decideEntitlement(line, "Confirmed", note))}
          className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800"
        >
          <FiCheck size={14} aria-hidden="true" />
          Confirm
        </button>
      </footer>
    </article>
  );
}
