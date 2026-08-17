"use client";

import { useState, type FormEvent } from "react";
import { FiAlertTriangle, FiFlag } from "react-icons/fi";
import {
  CheckboxRow,
  Field,
  TextArea,
  TextInput,
  btnDanger,
  btnGhost,
} from "@/common/field";
import Modal from "@/common/modal";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectBlockedFromPack,
  selectExceptions,
} from "@/core/slices/submissions-slice";
import { authoriseException } from "@/core/thunks-submissions";
import type { ClearanceStageName, Submission } from "@/models/response/base-response";
import { SUBMISSION_TONE, blockingStages } from "../../../components/subStatus";

function ExceptionModal({
  submission,
  onClose,
}: {
  submission: Submission;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const outstanding = blockingStages(submission);
  const [stages, setStages] = useState<ClearanceStageName[]>([]);
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");

  const ready = stages.length > 0 && reference.trim() && reason.trim();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    dispatch(
      authoriseException({
        submissionId: submission.id,
        title: submission.title,
        stages,
        reference: reference.trim(),
        reason: reason.trim(),
      }),
    );
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Authorise an exception">
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {submission.title}
          </p>
          <div className="mt-2 space-y-0.5">
            <DetailRow label="Ministry" value={submission.metadata.originatingMinistry} />
            <DetailRow label="Meeting" value={submission.metadata.meetingId} />
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Stages to release
          </legend>
          <div className="space-y-2">
            {outstanding.map((stage) => (
              <CheckboxRow
                key={stage.stage}
                label={`${stage.stage} — ${stage.actorRole}`}
                checked={stages.includes(stage.stage)}
                onChange={(checked) =>
                  setStages((prev) =>
                    checked
                      ? [...prev, stage.stage]
                      : prev.filter((s) => s !== stage.stage),
                  )
                }
              />
            ))}
          </div>
        </fieldset>

        <Field label="Authorisation reference">
          <TextInput
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="OPC/SEC/2026/000"
            required
          />
        </Field>

        <Field
          label="Reason"
          hint="Why the stage is being released, and what happens to it afterwards. This is read by anyone auditing the decision."
        >
          <TextArea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </Field>

        <p
          className="flex items-start gap-2 rounded-lg border p-3 text-xs"
          style={{ borderColor: "var(--viz-serious)" }}
        >
          <FiAlertTriangle
            size={14}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-serious)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-600 dark:text-neutral-300">
            An exception releases a control the workflow exists to enforce. It is
            written to the audit log at critical severity and stays visible on the
            paper for the life of the record.
          </span>
        </p>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={!ready} className={btnDanger}>
            Authorise exception
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function ExceptionBoard({ now }: { now: string }) {
  const exceptions = useAppSelector(selectExceptions);
  const blocked = useAppSelector(selectBlockedFromPack);
  const [target, setTarget] = useState<Submission | null>(null);

  const candidates = blocked.filter(
    (s) => blockingStages(s).length > 0 && s.status !== "Rejected",
  );

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Recorded exceptions</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {exceptions.length} on the record
          </p>
        </div>

        {exceptions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            No mandatory stage has been released. Every paper that reached the pack
            did so with its full clearance chain complete.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {exceptions.map((submission) => (
              <article
                key={submission.id}
                className="rounded-lg border bg-white p-5 dark:bg-neutral-900"
                style={{ borderColor: "var(--viz-serious)" }}
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {submission.id} · {submission.metadata.originatingMinistry}
                    </p>
                    <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                      {submission.title}
                    </h3>
                  </div>
                  <span className="stamp" style={{ color: "var(--viz-serious)" }}>
                    <FiFlag size={10} />
                    {submission.exception!.reference}
                  </span>
                </header>

                <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                  {submission.exception!.reason}
                </p>

                <div className="mt-3 space-y-0.5">
                  <DetailRow
                    label="Stages released"
                    value={submission.exception!.stagesSkipped.join(", ")}
                  />
                  <DetailRow
                    label="Authorised by"
                    value={`${submission.exception!.authorisedBy} · ${stamp(submission.exception!.at)}`}
                  />
                  <DetailRow
                    label="Paper status"
                    value={
                      <StatusBadge tone={SUBMISSION_TONE[submission.status]}>
                        {submission.status}
                      </StatusBadge>
                    }
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-bold">Papers an exception could release</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Blocked from pack assembly with mandatory stages outstanding. Releasing
            one is a decision with a name against it, not a workaround.
          </p>
        </div>

        {candidates.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Nothing is blocked in a way an exception would resolve.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Paper</Th>
                <Th>Meeting</Th>
                <Th>Outstanding mandatory stages</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((submission) => (
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
                  <Td>{submission.metadata.meetingId}</Td>
                  <Td>{blockingStages(submission).map((s) => s.stage).join(", ")}</Td>
                  <Td align="right">
                    <button
                      type="button"
                      onClick={() => setTarget(submission)}
                      className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                    >
                      <FiFlag size={14} aria-hidden="true" />
                      Authorise exception
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Read at {stamp(now)}.
        </p>
      </section>

      {target && (
        <ExceptionModal submission={target} onClose={() => setTarget(null)} />
      )}
    </div>
  );
}
