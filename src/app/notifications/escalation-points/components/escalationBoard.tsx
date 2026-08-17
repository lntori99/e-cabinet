"use client";

import { useState } from "react";
import { FiArrowRight, FiCheck, FiEdit3, FiTrendingUp, FiX } from "react-icons/fi";
import { Field, TextInput } from "@/common/field";
import { DetailRow } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectEscalationPoints } from "@/core/slices/notification-slice";
import { updateEscalationPoint } from "@/core/thunks-notifications";
import type { EscalationPoint } from "@/models/response/base-response";
import { serviceWords } from "../../components/notificationStatus";

/**
 * FR-NOT-04 and FR-NOT-05 — the nominated recipient per clearance stage and per
 * action type. Two different shapes of the same rule: clearance escalates when
 * a service window runs out, an action escalates on its own deadline, so the
 * two are grouped separately rather than forced into one table.
 */
export default function EscalationBoard() {
  const points = useAppSelector(selectEscalationPoints);

  const stages = points.filter((p) => p.kind === "Clearance stage");
  const actions = points.filter((p) => p.kind === "Action type");

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="font-bold">Clearance stages</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-NOT-04. Each stage has a service time. When an item sits longer
            than that, it goes to the officer named here — and where a second
            step exists, to the centre only if the first step does not move it.
          </p>
        </div>
        {stages.map((point) => (
          <PointCard key={point.id} point={point} />
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-bold">Action types</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-NOT-05. An action has a deadline rather than a service window, so
            escalation is on the date itself. Where it goes depends on what the
            action is: money to the Secretary to Cabinet, drafting to the centre,
            committee work back to the committee that set it.
          </p>
        </div>
        {actions.map((point) => (
          <PointCard key={point.id} point={point} />
        ))}
      </section>
    </div>
  );
}

function PointCard({ point }: { point: EscalationPoint }) {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [to, setTo] = useState(point.escalateTo);
  const [hours, setHours] = useState(String(point.serviceTimeHours));

  const timed = point.kind === "Clearance stage";

  function save() {
    dispatch(updateEscalationPoint(point, to.trim(), Number(hours) || 0));
    setEditing(false);
  }

  return (
    <article className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {point.id} · {point.kind}
          </p>
          <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
            {point.scope}
          </h3>
        </div>
        <StatusBadge tone={timed ? "blue" : "neutral"}>
          {timed ? serviceWords(point.serviceTimeHours) : "On the deadline"}
        </StatusBadge>
      </header>

      <div className="px-5 py-4">
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
            {point.scope}
          </span>
          <FiArrowRight size={14} className="text-neutral-400" aria-hidden="true" />
          <span
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-medium"
            style={{ borderColor: "var(--viz-warning)", color: "var(--viz-warning)" }}
          >
            <FiTrendingUp size={13} aria-hidden="true" />
            {point.escalateTo}
          </span>
          {point.thenTo && (
            <>
              <FiArrowRight size={14} className="text-neutral-400" aria-hidden="true" />
              <span
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-medium"
                style={{ borderColor: "var(--viz-critical)", color: "var(--viz-critical)" }}
              >
                <FiTrendingUp size={13} aria-hidden="true" />
                {point.thenTo}
              </span>
            </>
          )}
        </p>

        <div className="mt-4 space-y-0.5">
          <DetailRow
            label="Service time"
            value={
              timed
                ? `${serviceWords(point.serviceTimeHours)} at this stage`
                : "None — the action's own deadline is the trigger"
            }
          />
          <DetailRow label="Why" value={point.notes} />
        </div>

        {editing && (
          <div className="mt-4 grid gap-4 border-t border-neutral-200 pt-4 sm:grid-cols-2 dark:border-neutral-800">
            <Field label="Escalate to">
              <TextInput value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
            <Field
              label="Service time, in hours"
              hint={timed ? undefined : "Zero means escalation happens on the deadline."}
            >
              <TextInput
                type="number"
                min={0}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </Field>
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Changing an escalation point is written to the audit log — it changes
          who finds out that something is late.
        </p>
        {editing ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setTo(point.escalateTo);
                setHours(String(point.serviceTimeHours));
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 dark:border-neutral-700 dark:text-neutral-300"
            >
              <FiX size={14} aria-hidden="true" />
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={to.trim().length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiCheck size={14} aria-hidden="true" />
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
          >
            <FiEdit3 size={14} aria-hidden="true" />
            Change
          </button>
        )}
      </footer>
    </article>
  );
}
