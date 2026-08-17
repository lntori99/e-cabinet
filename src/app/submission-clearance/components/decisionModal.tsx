"use client";

import { useState, type FormEvent } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Field, TextArea, btnGhost, btnPrimary } from "@/common/field";
import Modal from "@/common/modal";
import { useAppDispatch } from "@/core/hook";
import { recordDecision } from "@/core/thunks-submissions";
import type {
  ClearanceDecision,
  ClearanceStage,
  Submission,
} from "@/models/response/base-response";

const DECISIONS: { value: ClearanceDecision; hint: string }[] = [
  { value: "Approved", hint: "The paper clears this stage and moves on." },
  {
    value: "Returned for amendment",
    hint: "Back to the submitter. Their reply and new version keep this thread.",
  },
  {
    value: "Rejected",
    hint: "The paper stops here. It cannot be resubmitted against this meeting.",
  },
];

/**
 * FR-SUB-09 — approve, reject or return, and never without a written comment.
 * The comment is what the submitter and every later actor read, so the form
 * cannot be submitted with an empty one.
 */
export default function DecisionModal({
  submission,
  stage,
  onClose,
}: {
  submission: Submission;
  stage: ClearanceStage;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [decision, setDecision] = useState<ClearanceDecision>("Approved");
  const [comment, setComment] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;

    dispatch(
      recordDecision({
        submissionId: submission.id,
        title: submission.title,
        stage: stage.stage,
        decision,
        comment: comment.trim(),
        role: stage.actorRole,
      }),
    );
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={stage.stage}>
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {submission.title}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {submission.id} · {submission.metadata.originatingMinistry} · answering as{" "}
            {stage.actorRole}
          </p>
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Decision
          </legend>
          {DECISIONS.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition ${
                decision === option.value
                  ? "border-state-500 bg-state-50 dark:border-state-700 dark:bg-state-900/20"
                  : "border-neutral-200 hover:border-state-300 dark:border-neutral-800"
              }`}
            >
              <input
                type="radio"
                name="decision"
                value={option.value}
                checked={decision === option.value}
                onChange={() => setDecision(option.value)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-state-600"
              />
              <span>
                <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {option.value}
                </span>
                <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                  {option.hint}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <Field
          label="Comment"
          hint="Required. It is written to the paper's thread and is visible to the submitter and to every later clearance actor."
        >
          <TextArea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              decision === "Approved"
                ? "What you are satisfied with, and anything the next actor should know."
                : "What must change, and why. Be specific enough to act on."
            }
            required
          />
        </Field>

        {!comment.trim() && (
          <p className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <FiAlertCircle size={13} aria-hidden="true" />
            A decision cannot be recorded without a comment.
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={!comment.trim()} className={btnPrimary}>
            Record decision
          </button>
        </div>
      </form>
    </Modal>
  );
}
