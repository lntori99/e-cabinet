"use client";

import { useMemo, useState } from "react";
import { FiCheck, FiInfo } from "react-icons/fi";
import { Field, Select, TextArea, controlCls } from "@/common/field";
import { StatusBadge } from "@/common/ui";
import { CLASSIFICATIONS, OPERATOR, type Classification } from "@/core/app-constants";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectDecisionRecords } from "@/core/slices/decision-slice";
import { selectMeetings } from "@/core/slices/meetings-slice";
import { OUTCOME_TYPES } from "@/data/decisions";
import type { DecisionOutcomeCode } from "@/models/response/base-response";
import { recordDecision } from "@/core/thunks-decisions";
import { OUTCOME_TONE } from "../../../components/decisionStatus";

const OUTCOME_CODES = OUTCOME_TYPES.map((t) => t.code);

/**
 * FR-DEC-01, FR-DEC-02, FR-DEC-03 — a decision is recorded against one agenda
 * item, so the item is chosen first and the meeting, date and recording officer
 * are taken from it rather than typed. The three fields nobody can get wrong by
 * hand are the three fields this form does not offer.
 */
export default function RecordForm({ today }: { today: string }) {
  const dispatch = useAppDispatch();
  const meetings = useAppSelector(selectMeetings);
  const existing = useAppSelector(selectDecisionRecords);

  const [meetingId, setMeetingId] = useState<string>(meetings[0]?.id ?? "");
  const meeting = meetings.find((m) => m.id === meetingId) ?? meetings[0];

  const items = meeting?.agenda ?? [];
  const [itemId, setItemId] = useState<string>(items[0]?.id ?? "");
  const item = items.find((a) => a.id === itemId) ?? items[0];

  const [outcome, setOutcome] = useState<DecisionOutcomeCode>("Approved");
  const [classification, setClassification] = useState<Classification>("SECRET");
  const [text, setText] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  const meaning = OUTCOME_TYPES.find((t) => t.code === outcome);

  /** An item that already carries a decision should not quietly get a second. */
  const alreadyRecorded = useMemo(
    () =>
      existing.find(
        (d) => d.meetingId === meetingId && d.agendaItemTitle === (item?.title ?? ""),
      ),
    [existing, meetingId, item?.title],
  );

  function submit() {
    if (!meeting || !item || text.trim().length === 0) return;
    dispatch(
      recordDecision({
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        meetingDate: meeting.date,
        agendaItemNumber: String(item.order),
        agendaItemTitle: item.title,
        text: text.trim(),
        outcome,
        classification,
        ministries: item.ministry ? [item.ministry] : [],
      }),
    );
    setSaved(item.title);
    setText("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Meeting" hint="Decisions belong to a sitting, not to a date.">
            <select
              value={meetingId}
              onChange={(e) => {
                setMeetingId(e.target.value);
                const next = meetings.find((m) => m.id === e.target.value);
                setItemId(next?.agenda[0]?.id ?? "");
              }}
              className={controlCls}
            >
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} · {m.date}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Agenda item" hint="FR-DEC-01 — one decision, one item.">
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className={controlCls}
            >
              {items.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.order}. {a.title}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {item && (
          <p className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-950">
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              Item {item.order} — {item.title}
            </span>
            <span className="mt-0.5 block text-neutral-600 dark:text-neutral-400">
              {meeting?.title} · {meeting?.date} · {item.ministry}
            </span>
          </p>
        )}

        {alreadyRecorded && (
          <p
            className="flex items-start gap-2 rounded-lg border p-3 text-sm"
            style={{ borderColor: "var(--viz-warning)" }}
          >
            <FiInfo
              size={15}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--viz-warning)" }}
              aria-hidden="true"
            />
            <span className="text-neutral-700 dark:text-neutral-300">
              {alreadyRecorded.id} already stands against this item, as{" "}
              {alreadyRecorded.state.toLowerCase()}. Recording another creates a
              second decision on the same item — use a correction instead if the
              first one is wrong.
            </span>
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Outcome"
            hint={meaning?.meaning}
          >
            <Select
              value={outcome}
              options={OUTCOME_CODES}
              onChange={(e) => setOutcome(e.target.value as DecisionOutcomeCode)}
            />
          </Field>
          <Field
            label="Classification"
            hint="Carried onto the minutes and any extract taken from this decision."
          >
            <Select
              value={classification}
              options={CLASSIFICATIONS}
              onChange={(e) => setClassification(e.target.value as Classification)}
            />
          </Field>
        </div>

        <Field
          label="Decision text"
          hint="Written as Cabinet decided it, in the words that will stand on the record."
        >
          <TextArea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cabinet approved … and directed …"
          />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Saved as a draft. Nothing is on the record until it has been reviewed
            and finalised.
          </p>
          <button
            type="button"
            onClick={submit}
            disabled={text.trim().length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-state-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiCheck size={15} aria-hidden="true" />
            Record decision
          </button>
        </div>

        {saved && (
          <p
            className="flex items-start gap-2 rounded-lg border p-3 text-sm"
            style={{ borderColor: "var(--viz-good)" }}
          >
            <FiCheck
              size={15}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--viz-good)" }}
              aria-hidden="true"
            />
            <span className="text-neutral-700 dark:text-neutral-300">
              Draft decision recorded against {saved}. It is now in Drafts and
              Review.
            </span>
          </p>
        )}
      </section>

      <aside className="space-y-4">
        <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold">What the record captures</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-DEC-02. Four of these are taken from the item rather than typed,
            because they are the four that must match the meeting exactly.
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <Captured label="Decision text" from="Entered above" />
            <Captured label="Outcome type" from="Chosen above" />
            <Captured label="Agenda item" from={item ? `Item ${item.order}` : "—"} />
            <Captured label="Meeting" from={meeting?.id ?? "—"} />
            <Captured label="Date" from={meeting?.date ?? "—"} />
            <Captured label="Recording officer" from={`${OPERATOR.name} (${OPERATOR.shortRole})`} />
            <Captured label="Recorded at" from={today} />
          </dl>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold">Outcome types</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-DEC-03. Configurable, so this list is held as data and can change
            without a release.
          </p>
          <ul className="mt-4 space-y-2.5">
            {OUTCOME_TYPES.map((type) => (
              <li key={type.code}>
                <StatusBadge tone={OUTCOME_TONE[type.code]}>{type.code}</StatusBadge>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {type.meaning}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}

function Captured({ label, from }: { label: string; from: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-neutral-600 dark:text-neutral-400">{label}</dt>
      <dd className="text-right font-mono text-xs text-neutral-800 dark:text-neutral-200">
        {from}
      </dd>
    </div>
  );
}
