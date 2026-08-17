"use client";

import { useState } from "react";
import { FiCheck, FiSlash, FiUserX, FiX } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { TextArea } from "@/common/field";
import { DetailRow } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { OPERATOR } from "@/core/app-constants";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectApprovals } from "@/core/slices/admin-slice";
import { decideApproval } from "@/core/thunks-admin";
import type { ChangeApproval } from "@/models/response/base-response";

const STATE_TONE: Record<ChangeApproval["state"], "green" | "amber" | "red"> = {
  "Awaiting approval": "amber",
  Approved: "green",
  Rejected: "red",
};

/**
 * FR-ADM-05 — a second authorised approver, and the implementer is not it. The
 * refusal is in the reducer, so this screen only has to be honest about why the
 * buttons are missing when it is your own change.
 */
export default function ApprovalBoard() {
  const approvals = useAppSelector(selectApprovals);
  const waiting = approvals.filter((a) => a.state === "Awaiting approval");
  const decided = approvals.filter((a) => a.state !== "Awaiting approval");

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-bold">Awaiting approval</h2>
        {waiting.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              icon={FiCheck}
              title="Nothing is waiting"
              description="No security-relevant change has been proposed. Proposals arrive here from the Configuration screen."
            />
          </div>
        ) : (
          waiting.map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} />
          ))
        )}
      </section>

      {decided.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-bold">Decided</h2>
          {decided.map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} />
          ))}
        </section>
      )}
    </div>
  );
}

function ApprovalCard({ approval }: { approval: ChangeApproval }) {
  const dispatch = useAppDispatch();
  const [note, setNote] = useState(approval.decisionNote ?? "");

  const waiting = approval.state === "Awaiting approval";
  const isMine = approval.implementer === `${OPERATOR.name} (${OPERATOR.shortRole})`;

  return (
    <article
      className="rounded-lg border bg-white dark:bg-neutral-900"
      style={{
        borderColor: waiting ? "var(--viz-warning)" : "var(--viz-grid)",
      }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {approval.id} · FR-ADM-05 · {approval.submittedAt.replace("T", " ")}
          </p>
          <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
            {approval.label}
          </h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {approval.area}
          </p>
        </div>
        <StatusBadge tone={STATE_TONE[approval.state]}>{approval.state}</StatusBadge>
      </header>

      <div className="px-5 py-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div
            className="rounded-lg border p-4"
            style={{ borderColor: "var(--viz-grid)" }}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Current
            </p>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
              {approval.previousValue}
            </p>
          </div>
          <div
            className="rounded-lg border p-4"
            style={{ borderColor: "var(--viz-warning)" }}
          >
            <p
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: "var(--viz-warning)" }}
            >
              Proposed
            </p>
            <p className="mt-2 text-sm text-neutral-800 dark:text-neutral-200">
              {approval.proposedValue}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-0.5">
          <DetailRow label="Submitted by" value={approval.implementer} />
          <DetailRow label="Justification" value={approval.justification} />
          {approval.approver && (
            <DetailRow
              label="Decided by"
              value={`${approval.approver} · ${approval.decidedAt?.replace("T", " ")}`}
            />
          )}
        </div>

        {approval.decisionNote && !waiting && (
          <p className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              Decision.{" "}
            </span>
            {approval.decisionNote}
          </p>
        )}

        {waiting && !isMine && (
          <div className="mt-4">
            <label
              htmlFor={`note-${approval.id}`}
              className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200"
            >
              Decision note
            </label>
            <TextArea
              id={`note-${approval.id}`}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What you checked, and why this is or is not safe to apply."
            />
          </div>
        )}
      </div>

      {waiting && (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
          {isMine ? (
            <p
              className="inline-flex items-start gap-2 text-sm"
              style={{ color: "var(--viz-warning)" }}
            >
              <FiUserX size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              You submitted this change, so you cannot approve it. It needs a
              second authorised approver — that is the whole point of the control.
            </p>
          ) : (
            <>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Approving applies the change and writes both values to the audit
                log.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={note.trim().length === 0}
                  onClick={() => dispatch(decideApproval(approval, false, note))}
                  className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiX size={14} aria-hidden="true" />
                  Reject
                </button>
                <button
                  type="button"
                  disabled={note.trim().length === 0}
                  onClick={() => dispatch(decideApproval(approval, true, note))}
                  className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiCheck size={14} aria-hidden="true" />
                  Approve and apply
                </button>
              </div>
            </>
          )}
        </footer>
      )}

      {!waiting && approval.state === "Rejected" && (
        <footer className="flex flex-wrap items-center gap-2 border-t border-neutral-200 px-5 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <FiSlash size={12} aria-hidden="true" />
          The setting was left as it was. A rejected proposal stays on the record.
        </footer>
      )}
    </article>
  );
}
