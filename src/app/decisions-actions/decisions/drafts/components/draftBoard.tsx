"use client";

import { FiArrowRight, FiLock, FiSend } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectDraftDecisions } from "@/core/slices/decision-slice";
import { advanceDecision } from "@/core/thunks-decisions";
import { DECISION_TONE, OUTCOME_TONE } from "../../../components/decisionStatus";

/**
 * FR-DEC-04 — the pre-finalisation cycle. Both steps are here on one screen
 * because they are the same conversation: somebody wrote it, somebody else has
 * to agree it says what happened, and then it stops being editable.
 */
export default function DraftBoard() {
  const dispatch = useAppDispatch();
  const drafts = useAppSelector(selectDraftDecisions);

  if (drafts.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={FiLock}
          title="Nothing is in the cycle"
          description="Every decision recorded has been reviewed and finalised. New ones arrive here as drafts."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ol className="grid gap-3 sm:grid-cols-3">
        {(["Draft", "In review", "Finalised"] as const).map((step, index) => (
          <li
            key={step}
            className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 font-mono text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {index + 1}
            </span>
            <span>
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {step}
              </span>
              <span className="mt-0.5 block text-xs text-neutral-600 dark:text-neutral-400">
                {index === 0
                  ? "Written up by the recording officer. Editable."
                  : index === 1
                    ? "Checked against the sitting by a second officer. Still editable."
                    : "On the record. Immutable — a change needs a correction."}
              </span>
            </span>
          </li>
        ))}
      </ol>

      {drafts.map((decision) => (
        <article
          key={decision.id}
          className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {decision.id} · {decision.meetingId} · item {decision.agendaItemNumber}
              </p>
              <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                {decision.agendaItemTitle}
              </h2>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className={`stamp ${classificationTone(decision.classification)}`}>
                {decision.classification}
              </span>
              <StatusBadge tone={OUTCOME_TONE[decision.outcome]}>
                {decision.outcome}
              </StatusBadge>
              <StatusBadge tone={DECISION_TONE[decision.state]}>
                {decision.state}
              </StatusBadge>
            </div>
          </header>

          <div className="px-5 py-4">
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {decision.text}
            </p>

            <div className="mt-4 grid gap-x-6 lg:grid-cols-2">
              <div className="space-y-0.5">
                <DetailRow label="Meeting" value={`${decision.meetingTitle} · ${decision.meetingDate}`} />
                <DetailRow label="Recorded by" value={decision.recordedBy} />
              </div>
              <div className="space-y-0.5">
                <DetailRow label="Recorded at" value={stamp(decision.recordedAt)} />
                <DetailRow
                  label="Reviewed by"
                  value={decision.reviewedBy ?? "Not yet reviewed"}
                />
              </div>
            </div>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {decision.state === "Draft"
                ? "Send to a second officer to check it against the sitting."
                : "Finalising puts this on the record. It cannot be edited afterwards."}
            </p>
            {decision.state === "Draft" ? (
              <button
                type="button"
                onClick={() => dispatch(advanceDecision(decision, "In review"))}
                className="inline-flex items-center gap-2 rounded-lg border border-state-600 px-3 py-1.5 text-sm font-medium text-state-700 transition hover:bg-state-600 hover:text-white dark:text-state-400"
              >
                <FiSend size={14} aria-hidden="true" />
                Send for review
              </button>
            ) : (
              <button
                type="button"
                onClick={() => dispatch(advanceDecision(decision, "Finalised"))}
                className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800"
              >
                <FiArrowRight size={14} aria-hidden="true" />
                Finalise
              </button>
            )}
          </footer>
        </article>
      ))}
    </div>
  );
}
