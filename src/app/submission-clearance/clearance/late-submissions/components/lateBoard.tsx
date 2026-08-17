"use client";

import { useState, type FormEvent } from "react";
import { FiAlertTriangle, FiCheckCircle, FiUnlock } from "react-icons/fi";
import { LuCalendarCheck } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { Field, TextInput, btnGhost, btnPrimary } from "@/common/field";
import Modal from "@/common/modal";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { distance, hoursUntil, stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectLateSubmissions } from "@/core/slices/submissions-slice";
import { authoriseLate } from "@/core/thunks-submissions";
import type { Submission } from "@/models/response/base-response";
import { SUBMISSION_TONE } from "../../../components/subStatus";

function AuthoriseModal({
  submission,
  onClose,
}: {
  submission: Submission;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [reference, setReference] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!reference.trim()) return;
    dispatch(
      authoriseLate({
        submissionId: submission.id,
        title: submission.title,
        reference: reference.trim(),
      }),
    );
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Authorise a late paper">
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {submission.title}
          </p>
          <div className="mt-2 space-y-0.5">
            <DetailRow label="Ministry" value={submission.metadata.originatingMinistry} />
            <DetailRow label="Deadline" value={stamp(submission.deadline)} />
            <DetailRow
              label="Arrived"
              value={
                submission.submittedAt
                  ? `${stamp(submission.submittedAt)} — ${distance(hoursUntil(submission.deadline, submission.submittedAt))}`
                  : "Not yet submitted"
              }
            />
          </div>
        </div>

        <Field
          label="Authorisation reference"
          hint="The Secretariat minute or instruction that admits this paper. It is recorded against the paper and written to the audit log."
        >
          <TextInput
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="OPC/SEC/2026/000"
            required
          />
        </Field>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Authorising opens the paper's first clearance stage immediately. The
          late flag stays on the paper — authorisation admits it, it does not
          make it on time.
        </p>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={!reference.trim()} className={btnPrimary}>
            Authorise into clearance
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function LateBoard({ now }: { now: string }) {
  const late = useAppSelector(selectLateSubmissions);
  const [authorising, setAuthorising] = useState<Submission | null>(null);

  const awaiting = late.filter((s) => !s.lateAuthorisedBy);
  const admitted = late.filter((s) => s.lateAuthorisedBy);

  if (late.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuCalendarCheck}
          title="Nothing arrived late"
          description="Every paper on the register reached the Secretariat inside its sitting's submission window."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Awaiting authorisation</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {awaiting.length} held outside clearance
          </p>
        </div>

        {awaiting.length === 0 ? (
          <p className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
            <FiCheckCircle
              size={15}
              style={{ color: "var(--viz-good)" }}
              aria-hidden="true"
            />
            Every late paper has been dealt with.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Paper</Th>
                <Th>Deadline</Th>
                <Th>How late</Th>
                <Th>Status</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {awaiting.map((submission) => (
                <tr
                  key={submission.id}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  <Td>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {submission.title}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {submission.id} · {submission.metadata.originatingMinistry}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono">{stamp(submission.deadline)}</span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {submission.metadata.meetingId}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium"
                      style={{ color: "var(--viz-warning)" }}
                    >
                      <FiAlertTriangle size={13} aria-hidden="true" />
                      {submission.submittedAt
                        ? distance(
                            hoursUntil(submission.deadline, submission.submittedAt),
                          ).replace("ago", "over")
                        : "Not submitted"}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge tone={SUBMISSION_TONE[submission.status]}>
                      {submission.status}
                    </StatusBadge>
                  </Td>
                  <Td align="right">
                    <button
                      type="button"
                      onClick={() => setAuthorising(submission)}
                      className="inline-flex items-center gap-2 rounded-lg border border-state-600 px-3 py-1.5 text-sm font-medium text-state-700 transition hover:bg-state-600 hover:text-white dark:text-state-400"
                    >
                      <FiUnlock size={14} aria-hidden="true" />
                      Authorise
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Admitted late</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {admitted.length} in clearance on a documented authority
          </p>
        </div>

        {admitted.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            No late paper has been admitted.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Paper</Th>
                <Th>Authorised by</Th>
                <Th>Reference</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {admitted.map((submission) => (
                <tr key={submission.id}>
                  <Td>
                    {submission.title}
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {submission.id}
                    </span>
                  </Td>
                  <Td>{submission.lateAuthorisedBy}</Td>
                  <Td>
                    <span className="font-mono">{submission.lateAuthorisationRef}</span>
                  </Td>
                  <Td>
                    <StatusBadge tone={SUBMISSION_TONE[submission.status]}>
                      {submission.status}
                    </StatusBadge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Clock read at {stamp(now)}. A late paper is never quietly folded into the
        chain: the flag stays on the record, and the authorisation that admitted
        it is part of the paper's history.
      </p>

      {authorising && (
        <AuthoriseModal
          submission={authorising}
          onClose={() => setAuthorising(null)}
        />
      )}
    </div>
  );
}
