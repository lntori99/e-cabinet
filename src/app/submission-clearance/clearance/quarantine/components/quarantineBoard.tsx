"use client";

import { FiShieldOff, FiTrash2, FiUnlock } from "react-icons/fi";
import { LuShieldCheck } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectQuarantined } from "@/core/slices/submissions-slice";
import { resolveQuarantine } from "@/core/thunks-submissions";
import { SUBMISSION_TONE } from "../../../components/subStatus";

export default function QuarantineBoard({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const held = useAppSelector(selectQuarantined);

  if (held.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuShieldCheck}
          title="Quarantine is empty"
          description="Every upload on the register passed file-type, size and malware checks. Anything that fails is held here and never reaches a clearance actor."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {held.map((submission) => (
        <article
          key={submission.id}
          className="rounded-lg border bg-white dark:bg-neutral-900"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {submission.id} · {submission.metadata.originatingMinistry}
              </p>
              <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                {submission.title}
              </h2>
            </div>
            <StatusBadge tone={SUBMISSION_TONE[submission.status]}>
              {submission.status}
            </StatusBadge>
          </header>

          <div className="space-y-4 px-5 py-4">
            <div className="space-y-0.5">
              <DetailRow label="Submitted by" value={submission.submittedBy} />
              <DetailRow
                label="Arrived"
                value={submission.submittedAt ? stamp(submission.submittedAt) : "—"}
              />
              <DetailRow label="Meeting" value={submission.metadata.meetingId} />
            </div>

            <ul className="space-y-3">
              {submission.files
                .filter((file) => file.scan === "Quarantined")
                .map((file) => (
                  <li
                    key={file.id}
                    className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span
                          className="inline-flex items-center gap-2 text-sm font-medium"
                          style={{ color: "var(--viz-critical)" }}
                        >
                          <FiShieldOff size={14} aria-hidden="true" />
                          {file.fileName}
                        </span>
                        <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                          {file.kind} · {file.sizeMb} MB
                        </span>
                        {file.quarantineReason && (
                          <span className="mt-1 block text-sm text-neutral-700 dark:text-neutral-300">
                            {file.quarantineReason}
                          </span>
                        )}
                      </span>

                      <span className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              resolveQuarantine({
                                submissionId: submission.id,
                                title: submission.title,
                                fileId: file.id,
                                fileName: file.fileName,
                                outcome: "Withdrawn",
                              }),
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                        >
                          <FiTrash2 size={14} aria-hidden="true" />
                          Withdraw file
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              resolveQuarantine({
                                submissionId: submission.id,
                                title: submission.title,
                                fileId: file.id,
                                fileName: file.fileName,
                                outcome: "Released",
                              }),
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
                        >
                          <FiUnlock size={14} aria-hidden="true" />
                          Release as clean
                        </button>
                      </span>
                    </div>
                  </li>
                ))}
            </ul>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Withdrawing removes the file and asks the ministry for a clean
              replacement. Releasing is an override — it is written to the audit log
              at warning severity, against your name.
            </p>
          </div>
        </article>
      ))}

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Read at {stamp(now)}.
      </p>
    </div>
  );
}
