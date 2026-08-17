"use client";

import { useState, type FormEvent } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import {
  CheckboxRow,
  Field,
  TextArea,
  TextInput,
  btnDanger,
  btnGhost,
} from "@/common/field";
import Modal from "@/common/modal";
import { useAppDispatch } from "@/core/hook";
import { recallPack, recordOverride, replacePack } from "@/core/thunks-packs";
import type { Pack } from "@/models/response/base-response";
import type { ReadinessCheck } from "./packStatus";

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="flex items-start gap-2 rounded-lg border p-3 text-xs"
      style={{ borderColor: "var(--viz-critical)" }}
    >
      <FiAlertTriangle
        size={14}
        className="mt-0.5 shrink-0"
        style={{ color: "var(--viz-critical)" }}
        aria-hidden="true"
      />
      <span className="text-neutral-600 dark:text-neutral-300">{children}</span>
    </p>
  );
}

/**
 * FR-PCK-05 / 06 — the only way to change a frozen pack. The authorising
 * officer and the written reason are required by the form because they are
 * required by the record.
 */
export function ReplaceModal({
  pack,
  onClose,
}: {
  pack: Pack;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [authorisedBy, setAuthorisedBy] = useState("Secretary to Cabinet");
  const [reason, setReason] = useState("");

  const ready = authorisedBy.trim() && reason.trim();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    dispatch(
      replacePack({
        packId: pack.id,
        authorisedBy: authorisedBy.trim(),
        reason: reason.trim(),
      }),
    );
    onClose();
  }

  const next = `${pack.id}-v${pack.versions.length + 1}`;

  return (
    <Modal open onClose={onClose} title="Create a replacement version">
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {pack.title}
          </p>
          <p className="mt-1 font-mono text-xs text-neutral-500 dark:text-neutral-400">
            {pack.currentVersionId} → {next}
          </p>
        </div>

        <Field
          label="Authorising officer"
          hint="Recorded against the replacement and shown wherever the version appears."
        >
          <TextInput
            value={authorisedBy}
            onChange={(e) => setAuthorisedBy(e.target.value)}
            required
          />
        </Field>

        <Field
          label="Reason for the change"
          hint="What was wrong, and what the replacement corrects. This is read by anyone reconciling two copies later."
        >
          <TextArea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </Field>

        <Warning>
          The current version is marked superseded, not deleted — it stays
          retrievable for audit. Participants keep the version they were served
          until the replacement is pushed to them, so anyone still on{" "}
          {pack.currentVersionId} will show as a version gap until they are.
        </Warning>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={!ready} className={btnDanger}>
            Create {next}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/** FR-PCK-18 — recall revokes access immediately and keeps the reason. */
export function RecallModal({ pack, onClose }: { pack: Pack; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [reason, setReason] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!reason.trim()) return;
    dispatch(
      recallPack({
        packId: pack.id,
        reason: reason.trim(),
        holders: pack.acknowledgements.length,
      }),
    );
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Recall this pack">
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {pack.title}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {pack.acknowledgements.length} participants currently hold it ·{" "}
            {pack.acknowledgements.filter((a) => a.readAt).length} have read it
          </p>
        </div>

        <Field
          label="Reason for recall"
          hint="Recorded with the recall and written to the audit log at critical severity."
        >
          <TextArea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="What was wrong with the pack, and what happens next."
            required
          />
        </Field>

        <Warning>
          Access is revoked the moment this is confirmed. Participants who have
          already read the pack cannot unread it — the recall record exists so
          that the sitting knows what was withdrawn and why.
        </Warning>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={!reason.trim()} className={btnDanger}>
            Recall and revoke access
          </button>
        </div>
      </form>
    </Modal>
  );
}

/** FR-PCK-17 — release past a failed check, on the record. */
export function OverrideModal({
  pack,
  failures,
  onClose,
}: {
  pack: Pack;
  failures: ReadinessCheck[];
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [accepted, setAccepted] = useState<string[]>([]);
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");

  const ready = accepted.length > 0 && reference.trim() && reason.trim();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    dispatch(
      recordOverride({
        packId: pack.id,
        reference: reference.trim(),
        reason: reason.trim(),
        failuresAccepted: accepted,
      }),
    );
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Record a readiness override">
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {pack.title}
          </p>
          <p className="mt-1 font-mono text-xs text-neutral-500 dark:text-neutral-400">
            {pack.id} · {pack.currentVersionId}
          </p>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Failed checks being accepted
          </legend>
          <div className="space-y-2">
            {failures.map((check) => (
              <CheckboxRow
                key={check.id}
                label={
                  <>
                    <span className="block">{check.label}</span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                      {check.detail}
                    </span>
                  </>
                }
                checked={accepted.includes(check.label)}
                onChange={(checked) =>
                  setAccepted((prev) =>
                    checked
                      ? [...prev, check.label]
                      : prev.filter((c) => c !== check.label),
                  )
                }
              />
            ))}
          </div>
        </fieldset>

        <Field label="Secretariat authorisation reference">
          <TextInput
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="OPC/SEC/2026/000"
            required
          />
        </Field>

        <Field label="Reason">
          <TextArea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </Field>

        <Warning>
          An override releases a pack the readiness check says is not ready. It is
          recorded against the pack, shown on the readiness screen, and written to
          the audit log at critical severity.
        </Warning>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={!ready} className={btnDanger}>
            Record override
          </button>
        </div>
      </form>
    </Modal>
  );
}
