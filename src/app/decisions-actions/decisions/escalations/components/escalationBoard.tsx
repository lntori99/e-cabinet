"use client";

import { FiCheckCircle, FiClock, FiTrendingUp } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectActionRecords } from "@/core/slices/decision-slice";
import { REMINDER_THRESHOLD_DAYS } from "@/data/decisions";
import { escalateAction } from "@/core/thunks-decisions";
import ActionRow from "../../../components/actionRow";
import UpdateTrail from "../../../components/updateTrail";
import { deadlineWords, standing } from "../../../components/decisionStatus";

/**
 * FR-DEC-08 — the two halves of the same rule. Reminders go out before the
 * deadline; escalation happens after it. Both are shown here because the
 * question an officer asks is "what has this action already had", and one
 * without the other does not answer it.
 */
export default function EscalationBoard({ today }: { today: string }) {
  const dispatch = useAppDispatch();
  const actions = useAppSelector(selectActionRecords);

  const overdue = actions
    .filter((a) => standing(a, today) === "Overdue")
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const escalated = overdue.filter((a) => a.escalated);
  const awaiting = overdue.filter((a) => !a.escalated);
  const reminded = actions.filter(
    (a) => a.reminderSentAt && standing(a, today) !== "Overdue",
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <Rule
          step="1"
          title={`Reminder at ${REMINDER_THRESHOLD_DAYS} days`}
          detail="The responsible officer and the ministry are notified in advance of the deadline."
        />
        <Rule
          step="2"
          title="Deadline passes"
          detail="The action is marked overdue. It stays with the ministry, and the record shows it is late."
        />
        <Rule
          step="3"
          title="Escalation point"
          detail="The action is raised to the officer configured against it, with the delay on the record."
        />
      </section>

      {overdue.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={FiCheckCircle}
            title="Nothing is past its deadline"
            description="No action has run past its date. Reminders continue to go out ahead of the deadlines still to come."
          />
        </div>
      ) : (
        <>
          {awaiting.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-bold">Overdue, not yet escalated</h2>
              {awaiting.map((item) => (
                <ActionRow
                  key={item.id}
                  item={item}
                  today={today}
                  controls={
                    <button
                      type="button"
                      onClick={() => dispatch(escalateAction(item))}
                      className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                    >
                      <FiTrendingUp size={14} aria-hidden="true" />
                      Escalate to {item.escalationPoint}
                    </button>
                  }
                >
                  <UpdateTrail actionId={item.id} />
                </ActionRow>
              ))}
            </section>
          )}

          {escalated.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-bold">With the escalation point</h2>
              {escalated.map((item) => (
                <ActionRow key={item.id} item={item} today={today}>
                  <p className="border-t border-neutral-200 px-5 py-3 text-sm dark:border-neutral-800">
                    <span style={{ color: "var(--viz-critical)" }}>
                      Escalated {item.escalatedAt ? stamp(item.escalatedAt) : ""} to{" "}
                      {item.escalationPoint}.
                    </span>{" "}
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {deadlineWords(item.deadline, today)} and still open.
                    </span>
                  </p>
                  <UpdateTrail actionId={item.id} />
                </ActionRow>
              ))}
            </section>
          )}
        </>
      )}

      <section className="space-y-3">
        <h2 className="font-bold">Reminders already issued</h2>
        {reminded.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            No advance reminder has gone out on an action that is still inside its
            deadline.
          </p>
        ) : (
          <ul className="space-y-2">
            {reminded.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {item.description}
                  </span>
                  <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <FiClock size={11} aria-hidden="true" />
                    Reminder {item.reminderSentAt ? stamp(item.reminderSentAt) : ""} ·{" "}
                    {item.officer} · due {deadlineWords(item.deadline, today)}
                  </span>
                </span>
                <StatusBadge tone="neutral">{item.ministry}</StatusBadge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Rule({
  step,
  title,
  detail,
}: {
  step: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 font-mono text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
        {step}
      </span>
      <span>
        <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-neutral-600 dark:text-neutral-400">
          {detail}
        </span>
      </span>
    </div>
  );
}
