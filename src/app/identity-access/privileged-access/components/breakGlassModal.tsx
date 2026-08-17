"use client";

import { useState, type FormEvent } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Field, Select, TextInput, btnDanger, btnGhost } from "@/common/field";
import Modal from "@/common/modal";
import { useAppDispatch } from "@/core/hook";
import { approveBreakGlass } from "@/core/thunks-identity";
import type { BreakGlassGrant } from "@/models/response/base-response";

const WINDOWS = ["1 hour", "2 hours", "4 hours", "6 hours", "12 hours"];

/**
 * FR-IAM-11 — the approval reference is a required field, not a note. A grant
 * without documented client approval is exactly the thing this control exists
 * to prevent, so the form cannot be submitted without one.
 */
export default function BreakGlassModal({
  grant,
  onClose,
}: {
  grant: BreakGlassGrant;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [approver, setApprover] = useState("Secretary to Cabinet");
  const [reference, setReference] = useState("");
  const [window, setWindow] = useState(WINDOWS[1]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!reference.trim()) return;

    dispatch(
      approveBreakGlass({
        grantId: grant.id,
        approvedBy: approver.trim(),
        approvalReference: reference.trim(),
        hours: Number(window.split(" ")[0]),
        adminAccount: grant.adminAccount,
      }),
    );
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={`Grant ${grant.id}`}>
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {grant.requestedBy} · {grant.adminAccount}
          </p>
          <p className="mt-1 text-neutral-600 dark:text-neutral-300">{grant.reason}</p>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Scope: {grant.scope}
          </p>
        </div>

        <Field
          label="Approved by"
          hint="The client officer who authorised this in writing."
        >
          <TextInput
            value={approver}
            onChange={(e) => setApprover(e.target.value)}
            required
          />
        </Field>

        <Field
          label="Client approval reference"
          hint="Minute, ticket or letter reference. The grant is recorded against it."
        >
          <TextInput
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="OPC/SEC/2026/000"
            required
          />
        </Field>

        <Field label="Access window">
          <Select
            options={WINDOWS}
            value={window}
            onChange={(e) => setWindow(e.target.value)}
          />
        </Field>

        <p
          className="flex items-start gap-2 rounded-lg border p-3 text-xs"
          style={{ borderColor: "var(--viz-warning)" }}
        >
          <FiAlertTriangle
            size={14}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-warning)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-600 dark:text-neutral-300">
            Granting alerts the client security owner immediately and writes the
            grant, its scope and its expiry to the audit log. Access ends when the
            window closes, whether or not the work is finished.
          </span>
        </p>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={!reference.trim()} className={btnDanger}>
            Grant access
          </button>
        </div>
      </form>
    </Modal>
  );
}
