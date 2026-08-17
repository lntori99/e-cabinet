"use client";

import { useMemo, useState } from "react";
import { FiBell, FiPlus, FiTrendingUp, FiX } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { Field, Select, TextArea, TextInput, controlCls, filterCls } from "@/common/field";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectActionRecords,
  selectDecisionRecords,
} from "@/core/slices/decision-slice";
import { ESCALATION_POINTS, MINISTRIES } from "@/data/decisions";
import { createAction, escalateAction, sendReminder } from "@/core/thunks-decisions";
import ActionRow from "../../../components/actionRow";
import UpdateTrail from "../../../components/updateTrail";
import { standing } from "../../../components/decisionStatus";

const ALL = "All";
const STANDINGS = [ALL, "Overdue", "Due soon", "On time", "Closed"] as const;

/**
 * FR-DEC-06 and FR-DEC-09 on one screen. The dashboard cuts are filters rather
 * than four separate pages, because the question "what is late in Health" is
 * two of those cuts at once and no fixed page answers it.
 */
export default function ActionRegister({ today }: { today: string }) {
  const dispatch = useAppDispatch();
  const actions = useAppSelector(selectActionRecords);
  const decisions = useAppSelector(selectDecisionRecords);

  const [ministry, setMinistry] = useState<string>(ALL);
  const [meeting, setMeeting] = useState<string>(ALL);
  const [where, setWhere] = useState<string>(ALL);
  const [creating, setCreating] = useState(false);

  const meetings = useMemo(
    () => [ALL, ...new Set(actions.map((a) => a.meetingId))],
    [actions],
  );

  const shown = useMemo(
    () =>
      actions
        .filter(
          (a) =>
            (ministry === ALL || a.ministry === ministry) &&
            (meeting === ALL || a.meetingId === meeting) &&
            (where === ALL || standing(a, today) === where),
        )
        .sort((a, b) => a.deadline.localeCompare(b.deadline)),
    [actions, ministry, meeting, where, today],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <select
            value={ministry}
            onChange={(e) => setMinistry(e.target.value)}
            aria-label="Filter by ministry"
            className={`${filterCls}`}
          >
            {[ALL, ...MINISTRIES].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select
            value={meeting}
            onChange={(e) => setMeeting(e.target.value)}
            aria-label="Filter by meeting"
            className={`${filterCls}`}
          >
            {meetings.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            aria-label="Filter by deadline standing"
            className={`${filterCls}`}
          >
            {STANDINGS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setCreating((open) => !open)}
          className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-state-800"
        >
          {creating ? <FiX size={15} aria-hidden="true" /> : <FiPlus size={15} aria-hidden="true" />}
          {creating ? "Cancel" : "New action"}
        </button>
      </div>

      {creating && <NewAction today={today} onDone={() => setCreating(false)} />}

      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {shown.length} of {actions.length} actions
      </p>

      {shown.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={FiTrendingUp}
            title="Nothing matches"
            description="No action matches that combination of ministry, meeting and deadline standing."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((item) => {
            const decision = decisions.find((d) => d.id === item.decisionId);
            const late = standing(item, today) === "Overdue";

            return (
              <ActionRow
                key={item.id}
                item={item}
                today={today}
                decisionTitle={decision?.agendaItemTitle}
                // Undefined rather than an empty fragment: a closed action has
                // nothing to offer, and an empty footer strip reads as a bug.
                controls={
                  late && !item.escalated ? (
                    <button
                      type="button"
                      onClick={() => dispatch(escalateAction(item))}
                      className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                    >
                      <FiTrendingUp size={14} aria-hidden="true" />
                      Escalate to {item.escalationPoint}
                    </button>
                  ) : !late && item.state !== "Closed" ? (
                    <button
                      type="button"
                      onClick={() => dispatch(sendReminder(item))}
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
                    >
                      <FiBell size={14} aria-hidden="true" />
                      {item.reminderSentAt ? "Remind again" : "Send reminder"}
                    </button>
                  ) : undefined
                }
              >
                <UpdateTrail actionId={item.id} />
              </ActionRow>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** FR-DEC-06 — an action is raised against a decision, never on its own. */
function NewAction({ today, onDone }: { today: string; onDone: () => void }) {
  const dispatch = useAppDispatch();
  const decisions = useAppSelector(selectDecisionRecords);

  const [decisionId, setDecisionId] = useState<string>(decisions[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ministry, setMinistry] = useState<string>(MINISTRIES[0]);
  const [officer, setOfficer] = useState("");
  const [deadline, setDeadline] = useState(today);
  const [escalationPoint, setEscalationPoint] = useState<string>(ESCALATION_POINTS[0]);

  const decision = decisions.find((d) => d.id === decisionId);
  const ready =
    description.trim().length > 0 && officer.trim().length > 0 && Boolean(decision);

  function submit() {
    if (!decision || !ready) return;
    dispatch(
      createAction({
        decisionId: decision.id,
        meetingId: decision.meetingId,
        description: description.trim(),
        instructions: instructions.trim(),
        ministry,
        officer: officer.trim(),
        deadline,
        escalationPoint,
      }),
    );
    onDone();
  }

  return (
    <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="font-bold">New action</h2>

      <Field
        label="Against decision"
        hint={
          decision
            ? `${decision.id} · ${decision.outcome} · ${decision.state.toLowerCase()}`
            : undefined
        }
      >
        <select
          value={decisionId}
          onChange={(e) => setDecisionId(e.target.value)}
          className={controlCls}
        >
          {decisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.meetingTitle} · item {d.agendaItemNumber} — {d.agendaItemTitle}
            </option>
          ))}
        </select>
      </Field>

      <Field label="What must be done">
        <TextInput
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Publish the revised ceilings to controlling officers"
        />
      </Field>

      <Field
        label="Follow-up instructions"
        hint="How the ministry is expected to carry it out and what to report back."
      >
        <TextArea
          rows={3}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Responsible ministry">
          <Select
            value={ministry}
            options={MINISTRIES}
            onChange={(e) => setMinistry(e.target.value)}
          />
        </Field>
        <Field label="Responsible officer">
          <TextInput
            value={officer}
            onChange={(e) => setOfficer(e.target.value)}
            placeholder="Principal Secretary"
          />
        </Field>
        <Field label="Deadline">
          <TextInput
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </Field>
        <Field label="Escalation point" hint="Where it goes if the deadline passes.">
          <Select
            value={escalationPoint}
            options={ESCALATION_POINTS}
            onChange={(e) => setEscalationPoint(e.target.value)}
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={!ready}
          className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-state-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiPlus size={15} aria-hidden="true" />
          Create action
        </button>
      </div>
    </section>
  );
}
