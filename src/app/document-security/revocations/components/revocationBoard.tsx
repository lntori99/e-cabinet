"use client";

import { useState, type FormEvent } from "react";
import { FiRotateCcw, FiUsers, FiXOctagon } from "react-icons/fi";
import {
  Field,
  Select,
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
import { selectRevocations } from "@/core/slices/docsec-slice";
import { restoreAccess, revokeAccess } from "@/core/thunks-docsec";
import type { Revocation } from "@/models/response/base-response";

const SCOPES: Revocation["scope"][] = ["Document", "Pack", "Version"];
const AUDIENCES: Revocation["audience"][] = ["All users", "Named users"];

function RevokeModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [scope, setScope] = useState<Revocation["scope"]>("Document");
  const [audience, setAudience] = useState<Revocation["audience"]>("All users");
  const [targetId, setTargetId] = useState("");
  const [targetTitle, setTargetTitle] = useState("");
  const [users, setUsers] = useState("");
  const [reason, setReason] = useState("");

  const named = audience === "Named users";
  const ready =
    targetId.trim() && targetTitle.trim() && reason.trim() && (!named || users.trim());

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    dispatch(
      revokeAccess({
        scope,
        targetId: targetId.trim(),
        targetTitle: targetTitle.trim(),
        audience,
        users: named
          ? users
              .split(",")
              .map((u) => u.trim())
              .filter(Boolean)
          : [],
        reason: reason.trim(),
      }),
    );
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Revoke access">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Scope" hint="A pack revocation covers every paper inside it.">
            <Select
              options={SCOPES}
              value={scope}
              onChange={(e) => setScope(e.target.value as Revocation["scope"])}
            />
          </Field>
          <Field label="Audience">
            <Select
              options={AUDIENCES}
              value={audience}
              onChange={(e) => setAudience(e.target.value as Revocation["audience"])}
            />
          </Field>
        </div>

        <Field label="Reference">
          <TextInput
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder={scope === "Pack" ? "PCK-2026-014-A" : "DOC-0341"}
            required
          />
        </Field>

        <Field label="Title">
          <TextInput
            value={targetTitle}
            onChange={(e) => setTargetTitle(e.target.value)}
            placeholder="As it appears to the reader"
            required
          />
        </Field>

        {named && (
          <Field label="Named users" hint="Separate names with a comma.">
            <TextInput
              value={users}
              onChange={(e) => setUsers(e.target.value)}
              placeholder="Hon. Minister of Education, Director of Budget"
              required
            />
          </Field>
        )}

        <Field
          label="Reason"
          hint="Recorded with the revocation and written to the audit log at critical severity."
        >
          <TextArea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </Field>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={!ready} className={btnDanger}>
            Revoke now
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function RevocationBoard() {
  const dispatch = useAppDispatch();
  const revocations = useAppSelector(selectRevocations);
  const [revoking, setRevoking] = useState(false);

  const inForce = revocations.filter((r) => !r.restoredAt);
  const restored = revocations.filter((r) => r.restoredAt);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {inForce.length} revocation{inForce.length === 1 ? "" : "s"} in force ·{" "}
          {restored.length} since restored
        </p>
        <button
          type="button"
          onClick={() => setRevoking(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-4 py-2 text-sm font-semibold text-seal-500 transition hover:bg-seal-500 hover:text-white"
        >
          <FiXOctagon size={15} aria-hidden="true" />
          Revoke access
        </button>
      </div>

      {inForce.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No access has been withdrawn.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {inForce.map((revocation) => (
            <article
              key={revocation.id}
              className="rounded-lg border bg-white p-5 dark:bg-neutral-900"
              style={{ borderColor: "var(--viz-critical)" }}
            >
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {revocation.id} · {revocation.targetId}
                  </p>
                  <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                    {revocation.targetTitle}
                  </h2>
                </div>
                <StatusBadge tone="red">{revocation.scope}</StatusBadge>
              </header>

              <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                {revocation.reason}
              </p>

              <div className="mt-3 space-y-0.5">
                <DetailRow
                  label="Audience"
                  value={
                    revocation.audience === "All users" ? (
                      "Every holder"
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <FiUsers size={12} className="text-neutral-400" aria-hidden="true" />
                        {revocation.users.join(", ")}
                      </span>
                    )
                  }
                />
                <DetailRow
                  label="Withdrawn"
                  value={`${revocation.by} · ${stamp(revocation.at)}`}
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  dispatch(restoreAccess(revocation.id, revocation.targetTitle))
                }
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
              >
                <FiRotateCcw size={14} aria-hidden="true" />
                Restore access
              </button>
            </article>
          ))}
        </div>
      )}

      {restored.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold">Restored</h2>
          <Table>
            <thead>
              <tr>
                <Th>Target</Th>
                <Th>Scope</Th>
                <Th>Withdrawn</Th>
                <Th>Restored</Th>
              </tr>
            </thead>
            <tbody>
              {restored.map((revocation) => (
                <tr key={revocation.id}>
                  <Td>
                    {revocation.targetTitle}
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {revocation.targetId}
                    </span>
                  </Td>
                  <Td>{revocation.scope}</Td>
                  <Td>
                    <span className="font-mono">{stamp(revocation.at)}</span>
                  </Td>
                  <Td>
                    <span className="font-mono">
                      {revocation.restoredAt ? stamp(revocation.restoredAt) : ""}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      )}

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        A revocation stops access at the next request, including for someone with
        the document already open — the check runs server-side on every read.
        Anything already printed is beyond recall, which is why print is the
        narrower right.
      </p>

      {revoking && <RevokeModal onClose={() => setRevoking(false)} />}
    </div>
  );
}
