"use client";

import type { ReactNode } from "react";
import { FiAlertTriangle, FiFile, FiFlag, FiPaperclip, FiShieldOff } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { Tabs } from "@/common/tabs";
import { stamp } from "@/common/time";
import { StatusBadge, classificationTone } from "@/common/ui";
import { paperTemplate } from "@/data/submissionClearance";
import type { Submission } from "@/models/response/base-response";
import ClearanceTrail from "./clearanceTrail";
import CommentThread from "./commentThread";
import { SUBMISSION_TONE, money } from "./subStatus";

/**
 * One paper, read the same way wherever it is opened — the queue, the register
 * or a submitter's own list. `actions` is whatever the current screen is
 * entitled to do with it.
 */
export default function PaperDetail({
  submission,
  now,
  actions,
  onReply,
}: {
  submission: Submission;
  now: string;
  actions?: ReactNode;
  onReply?: (body: string, replyToId?: string) => void;
}) {
  const template = paperTemplate(submission.templateId);
  const meta = submission.metadata;
  const quarantined = submission.files.filter((f) => f.scan === "Quarantined");

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {submission.id} · {meta.originatingMinistry}
          </p>
          <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {submission.title}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`stamp ${classificationTone(meta.classification)}`}>
            {meta.classification}
          </span>
          <StatusBadge tone={SUBMISSION_TONE[submission.status]}>
            {submission.status}
          </StatusBadge>
        </div>
      </header>

      {submission.late && !submission.lateAuthorisedBy && (
        <p
          className="mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--viz-warning)" }}
        >
          <FiAlertTriangle
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-warning)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            Submitted after the deadline of {stamp(submission.deadline)}. It cannot
            enter clearance until the Secretariat authorises it in writing.
          </span>
        </p>
      )}

      {submission.exception && (
        <p
          className="mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--viz-serious)" }}
        >
          <FiFlag
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-serious)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            <span className="font-medium">
              Exception {submission.exception.reference} —{" "}
              {submission.exception.stagesSkipped.join(", ")} released by{" "}
              {submission.exception.authorisedBy}.
            </span>{" "}
            {submission.exception.reason}
          </span>
        </p>
      )}

      {quarantined.length > 0 && (
        <p
          className="mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <FiShieldOff
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-critical)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            {quarantined.length} upload held at the perimeter. The paper cannot
            enter clearance until a clean file is supplied.
          </span>
        </p>
      )}

      <div className="mt-5">
        <Tabs
          key={submission.id}
          defaultId="metadata"
          tabs={[
            {
              id: "metadata",
              label: "Details",
              content: (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-0.5">
                    <DetailRow label="Subject" value={meta.subject} />
                    <DetailRow label="Responsible officer" value={meta.responsibleOfficer} />
                    <DetailRow label="Meeting" value={meta.meetingId} />
                    <DetailRow
                      label="Agenda item"
                      value={meta.agendaItemTitle || "Not yet nominated"}
                    />
                    <DetailRow label="Decision sought" value={meta.decisionSought || "—"} />
                  </div>
                  <div className="space-y-0.5">
                    <DetailRow
                      label="Financial implication"
                      value={meta.financialImplication || money(meta.financialAmountMwk)}
                    />
                    <DetailRow label="Legal implication" value={meta.legalImplication || "—"} />
                    <DetailRow
                      label="Template"
                      value={`${template.name} v${template.version}`}
                    />
                    <DetailRow label="Submission deadline" value={stamp(submission.deadline)} />
                    <DetailRow
                      label="Submitted"
                      value={
                        submission.submittedAt
                          ? `${stamp(submission.submittedAt)} by ${submission.submittedBy}`
                          : "Not yet submitted"
                      }
                    />
                  </div>
                </div>
              ),
            },
            {
              id: "clearance",
              label: `Clearance (${submission.stages.length})`,
              content: <ClearanceTrail stages={submission.stages} now={now} />,
            },
            {
              id: "thread",
              label: `Comments (${submission.comments.length})`,
              content: (
                <CommentThread comments={submission.comments} onReply={onReply} />
              ),
            },
            {
              id: "files",
              label: `Files (${submission.files.length})`,
              content: (
                <div className="space-y-4">
                  <ul className="space-y-2">
                    {submission.files.map((file) => (
                      <li
                        key={file.id}
                        className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                      >
                        <span className="min-w-0">
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            <FiPaperclip
                              size={13}
                              className="text-neutral-400"
                              aria-hidden="true"
                            />
                            {file.fileName}
                          </span>
                          <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                            {file.kind} · {file.sizeMb} MB
                          </span>
                          {file.quarantineReason && (
                            <span
                              className="mt-1 block text-xs"
                              style={{ color: "var(--viz-critical)" }}
                            >
                              {file.quarantineReason}
                            </span>
                          )}
                        </span>
                        <StatusBadge
                          tone={
                            file.scan === "Clean"
                              ? "green"
                              : file.scan === "Scanning"
                                ? "blue"
                                : "red"
                          }
                        >
                          {file.scan}
                        </StatusBadge>
                      </li>
                    ))}
                  </ul>

                  <div>
                    <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                      Version history
                    </h4>
                    <ul className="mt-2 space-y-1.5">
                      {[...submission.versions].reverse().map((version) => (
                        <li
                          key={version.version}
                          className="flex items-baseline justify-between gap-3 text-sm"
                        >
                          <span className="inline-flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                            <FiFile size={12} className="text-neutral-400" aria-hidden="true" />
                            v{version.version} — {version.note}
                          </span>
                          <span className="shrink-0 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                            {stamp(version.uploadedAt)} · {version.uploadedBy}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      {actions && (
        <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          {actions}
        </div>
      )}
    </div>
  );
}
