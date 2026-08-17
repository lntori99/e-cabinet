"use client";

import { useState } from "react";
import { FiCheck, FiLock, FiTrash2, FiUserX, FiX } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { TextArea } from "@/common/field";
import { DetailRow } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { OPERATOR } from "@/core/app-constants";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectDeletions,
  selectRetainedRecords,
} from "@/core/slices/governance-slice";
import { decideDeletion, executeDeletion } from "@/core/thunks-governance";
import type { DeletionRequest } from "@/models/response/base-response";

const STATE_TONE: Record<
  DeletionRequest["state"],
  "green" | "amber" | "red" | "neutral" | "blue"
> = {
  "Awaiting approval": "amber",
  Approved: "blue",
  Rejected: "red",
  Executed: "neutral",
};

/**
 * FR-DAT-04 — three separate acts by three separate people. The request does
 * not delete anything, the approval does not delete anything, and the execution
 * is refused if the person carrying it out is the one who approved it. Both
 * refusals live in the reducer, so neither depends on this screen.
 */
export default function DeletionBoard() {
  const requests = useAppSelector(selectDeletions);
  const open = requests.filter(
    (d) => d.state === "Awaiting approval" || d.state === "Approved",
  );
  const closed = requests.filter(
    (d) => d.state === "Executed" || d.state === "Rejected",
  );

  return (
    <div className="space-y-8">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <FiUserX size={18} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            Three people, not one
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Somebody asks, somebody else approves, and somebody else again
            carries it out. Each act is written to the audit log separately, so
            the record shows three names rather than one. A legal hold stops all
            three, whatever was approved before it was raised.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-bold">In flight</h2>
        {open.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              icon={FiCheck}
              title="Nothing is waiting"
              description="No deletion has been requested. Nothing is destroyed without one."
            />
          </div>
        ) : (
          open.map((request) => <DeletionCard key={request.id} request={request} />)
        )}
      </section>

      {closed.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-bold">Closed</h2>
          {closed.map((request) => (
            <DeletionCard key={request.id} request={request} />
          ))}
        </section>
      )}
    </div>
  );
}

function DeletionCard({ request }: { request: DeletionRequest }) {
  const dispatch = useAppDispatch();
  const records = useAppSelector(selectRetainedRecords);
  const [note, setNote] = useState(request.decisionNote ?? "");

  const who = `${OPERATOR.name} (${OPERATOR.shortRole})`;
  const isRequester = request.requestedBy === who;
  const isApprover = request.approver === who;
  const held = request.recordIds.filter((id) =>
    records.some((r) => r.id === id && r.holdId),
  );

  return (
    <article
      className="rounded-lg border bg-white dark:bg-neutral-900"
      style={{
        borderColor:
          request.state === "Awaiting approval"
            ? "var(--viz-warning)"
            : request.state === "Approved"
              ? "var(--viz-critical)"
              : "var(--viz-grid)",
      }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {request.id} · FR-DAT-04 · {request.requestedAt.replace("T", " ")}
          </p>
          <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
            {request.scope}
          </h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {request.reason}
          </p>
        </div>
        <StatusBadge tone={STATE_TONE[request.state]}>{request.state}</StatusBadge>
      </header>

      <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
        <div className="space-y-0.5">
          <DetailRow label="Requested by" value={request.requestedBy} />
          <DetailRow label="Approved by" value={request.approver ?? "Not yet approved"} />
          <DetailRow label="Carried out by" value={request.executedBy ?? "Not carried out"} />
        </div>
        <div className="space-y-0.5">
          <DetailRow label="Records" value={request.recordIds.join(", ")} />
          <DetailRow
            label="Decided"
            value={request.decidedAt?.replace("T", " ") ?? "—"}
          />
          <DetailRow
            label="Executed"
            value={request.executedAt?.replace("T", " ") ?? "—"}
          />
        </div>
      </div>

      {request.decisionNote && request.state !== "Awaiting approval" && (
        <p className="mx-5 mb-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            Decision.{" "}
          </span>
          {request.decisionNote}
        </p>
      )}

      {held.length > 0 && (
        <p
          className="mx-5 mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <FiLock
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-critical)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            {held.join(", ")} {held.length === 1 ? "is" : "are"} under a legal
            hold. Nothing in this request can be destroyed while that stands, and
            the platform refuses the execution rather than skipping the record.
          </span>
        </p>
      )}

      {request.state === "Awaiting approval" && !isRequester && (
        <div className="px-5 pb-4">
          <label
            htmlFor={`note-${request.id}`}
            className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200"
          >
            Decision note
          </label>
          <TextArea
            id={`note-${request.id}`}
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What you checked — the class, the date, and whether any hold touches this set."
          />
        </div>
      )}

      {(request.state === "Awaiting approval" || request.state === "Approved") && (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
          {request.state === "Awaiting approval" && isRequester ? (
            <p
              className="inline-flex items-start gap-2 text-sm"
              style={{ color: "var(--viz-warning)" }}
            >
              <FiUserX size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              You requested this deletion, so you cannot approve it.
            </p>
          ) : request.state === "Approved" && isApprover ? (
            <p
              className="inline-flex items-start gap-2 text-sm"
              style={{ color: "var(--viz-warning)" }}
            >
              <FiUserX size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              You approved this deletion, so you cannot also carry it out. It
              needs a third person.
            </p>
          ) : (
            <>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {request.state === "Approved"
                  ? "Executing destroys the records. It cannot be undone, and the audit record of it is permanent."
                  : "Approving does not destroy anything. Somebody else still has to carry it out."}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {request.state === "Awaiting approval" ? (
                  <>
                    <button
                      type="button"
                      disabled={note.trim().length === 0}
                      onClick={() => dispatch(decideDeletion(request, false, note))}
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"
                    >
                      <FiX size={14} aria-hidden="true" />
                      Refuse
                    </button>
                    <button
                      type="button"
                      disabled={note.trim().length === 0}
                      onClick={() => dispatch(decideDeletion(request, true, note))}
                      className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <FiCheck size={14} aria-hidden="true" />
                      Approve
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={held.length > 0}
                    onClick={() => dispatch(executeDeletion(request, held))}
                    className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiTrash2 size={14} aria-hidden="true" />
                    Carry out the deletion
                  </button>
                )}
              </div>
            </>
          )}
        </footer>
      )}
    </article>
  );
}
