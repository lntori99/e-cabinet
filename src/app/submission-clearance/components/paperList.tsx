"use client";

import { FiAlertTriangle, FiClock } from "react-icons/fi";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import type { Submission } from "@/models/response/base-response";
import { SUBMISSION_TONE, clearedStageCount, currentStage } from "./subStatus";

/**
 * The selectable register used by every list-and-detail screen in FR SUB. Each
 * row carries the live clearance position, which is what FR-SUB-06 asks for —
 * a submitter should not have to open a paper to learn where it is stuck.
 */
export default function PaperList({
  submissions,
  selectedId,
  onSelect,
  emptyMessage,
}: {
  submissions: Submission[];
  selectedId: string;
  onSelect: (id: string) => void;
  emptyMessage: string;
}) {
  if (submissions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {submissions.map((submission) => {
        const active = submission.id === selectedId;
        const stage = currentStage(submission);
        const { done, total } = clearedStageCount(submission);

        return (
          <li key={submission.id}>
            <button
              type="button"
              onClick={() => onSelect(submission.id)}
              aria-current={active ? "true" : undefined}
              className={`w-full rounded-lg border p-3 text-left transition ${
                active
                  ? "border-state-500 bg-state-50 dark:border-state-700 dark:bg-state-900/20"
                  : "border-neutral-200 bg-white hover:border-state-300 dark:border-neutral-800 dark:bg-neutral-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {submission.id}
                </span>
                <StatusBadge tone={SUBMISSION_TONE[submission.status]}>
                  {submission.status}
                </StatusBadge>
              </div>

              <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
                {submission.title}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {submission.metadata.originatingMinistry} ·{" "}
                {submission.metadata.meetingId}
              </p>

              <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                <span>
                  {total === 0
                    ? "No clearance path yet"
                    : `${done} of ${total} stages cleared`}
                </span>
                {stage && (
                  <>
                    <span>·</span>
                    <span>at {stage.stage}</span>
                  </>
                )}
                {submission.late && (
                  <>
                    <span>·</span>
                    <span
                      className="inline-flex items-center gap-1"
                      style={{ color: "var(--viz-warning)" }}
                    >
                      <FiClock size={10} aria-hidden="true" /> Late
                    </span>
                  </>
                )}
                {submission.templateIssues.length > 0 && (
                  <>
                    <span>·</span>
                    <span
                      className="inline-flex items-center gap-1"
                      style={{ color: "var(--viz-critical)" }}
                    >
                      <FiAlertTriangle size={10} aria-hidden="true" />
                      {submission.templateIssues.length} template issue
                      {submission.templateIssues.length === 1 ? "" : "s"}
                    </span>
                  </>
                )}
              </p>

              {submission.submittedAt && (
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Submitted {stamp(submission.submittedAt)}
                </p>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
