"use client";

import Link from "next/link";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiCheckSquare,
  FiClipboard,
  FiClock,
  FiThumbsUp,
} from "react-icons/fi";
import { Kpi, StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  selectActionRecords,
  selectAwaitingVerification,
  selectDecisionRecords,
  selectDraftDecisions,
} from "@/core/slices/decision-slice";
import {
  ACTION_TONE,
  DECISION_TONE,
  OUTCOME_TONE,
  STANDING_TONE,
  deadlineWords,
  standing,
} from "../../../components/decisionStatus";
import OutcomeChart from "./outcomeChart";
import ProgressChart from "./progressChart";

export default function DecisionsDashboard({ today }: { today: string }) {
  const decisions = useAppSelector(selectDecisionRecords);
  const actions = useAppSelector(selectActionRecords);
  const drafts = useAppSelector(selectDraftDecisions);
  const awaitingVerification = useAppSelector(selectAwaitingVerification);

  const overdue = actions.filter((a) => standing(a, today) === "Overdue");
  const dueSoon = actions.filter((a) => standing(a, today) === "Due soon");
  const escalated = overdue.filter((a) => a.escalated);

  /**
   * A meeting is "awaiting capture" while any of its decisions is still short
   * of finalisation — the sitting is not on the record until all of them are.
   */
  const meetingsAwaiting = [
    ...new Map(
      drafts.map((d) => [d.meetingId, { id: d.meetingId, title: d.meetingTitle, date: d.meetingDate }]),
    ).values(),
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Meetings awaiting capture"
          value={meetingsAwaiting.length}
          hint={
            meetingsAwaiting.length === 0
              ? "Every sitting is fully on the record"
              : meetingsAwaiting.map((m) => m.title).join(", ")
          }
          tone={meetingsAwaiting.length > 0 ? "amber" : "green"}
        />
        <Kpi
          label="Drafts in review"
          value={drafts.filter((d) => d.state === "In review").length}
          hint="Written up, not yet finalised"
        />
        <Kpi
          label="Overdue actions"
          value={overdue.length}
          hint={
            escalated.length > 0
              ? `${escalated.length} already escalated`
              : "None have reached an escalation point"
          }
          tone={overdue.length > 0 ? "red" : "green"}
        />
        <Kpi
          label="Closures awaiting verification"
          value={awaitingVerification.length}
          hint="Evidence submitted, Secretariat sign-off outstanding"
          tone={awaitingVerification.length > 0 ? "amber" : "neutral"}
        />
      </div>

      {overdue.length > 0 && (
        <section
          className="rounded-lg border"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <span className="inline-flex items-center gap-2 font-bold">
              <FiAlertTriangle
                size={16}
                style={{ color: "var(--viz-critical)" }}
                aria-hidden="true"
              />
              Past deadline
            </span>
            <Link
              href="/decisions-actions/decisions/escalations"
              className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
            >
              Escalations <FiArrowRight size={13} aria-hidden="true" />
            </Link>
          </header>
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {overdue.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {item.description}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {item.ministry} · {item.officer} · {deadlineWords(item.deadline, today)}
                  </span>
                </span>
                <StatusBadge tone={item.escalated ? "red" : "amber"}>
                  {item.escalated ? `With ${item.escalationPoint}` : "Not yet escalated"}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <ProgressChart actions={actions} />
        <OutcomeChart decisions={decisions} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <span className="inline-flex items-center gap-2 font-bold">
              <FiClipboard size={15} className="text-neutral-400" aria-hidden="true" />
              Awaiting capture or review
            </span>
            <Link
              href="/decisions-actions/decisions/drafts"
              className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
            >
              Drafts <FiArrowRight size={13} aria-hidden="true" />
            </Link>
          </header>
          {drafts.length === 0 ? (
            <p className="px-5 py-6 text-sm text-neutral-500 dark:text-neutral-400">
              Nothing is outstanding. Every decision recorded has been finalised.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {drafts.map((decision) => (
                <li key={decision.id} className="px-5 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Item {decision.agendaItemNumber} — {decision.agendaItemTitle}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        {decision.meetingTitle} · {decision.meetingDate}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-wrap items-center gap-2">
                      <StatusBadge tone={OUTCOME_TONE[decision.outcome]}>
                        {decision.outcome}
                      </StatusBadge>
                      <StatusBadge tone={DECISION_TONE[decision.state]}>
                        {decision.state}
                      </StatusBadge>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <span className="inline-flex items-center gap-2 font-bold">
                <FiThumbsUp size={15} className="text-neutral-400" aria-hidden="true" />
                Closures awaiting verification
              </span>
              <Link
                href="/decisions-actions/decisions/closure-verification"
                className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
              >
                Verify <FiArrowRight size={13} aria-hidden="true" />
              </Link>
            </header>
            {awaitingVerification.length === 0 ? (
              <p className="px-5 py-6 text-sm text-neutral-500 dark:text-neutral-400">
                Nothing is waiting on the Secretariat.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {awaitingVerification.map((item) => (
                  <li key={item.id} className="px-5 py-3">
                    <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {item.description}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {item.ministry} · evidence {item.evidence?.reference}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <span className="inline-flex items-center gap-2 font-bold">
                <FiClock size={15} className="text-neutral-400" aria-hidden="true" />
                Due within {dueSoon.length === 0 ? "the reminder window" : "a week"}
              </span>
              <Link
                href="/decisions-actions/decisions/actions"
                className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
              >
                All actions <FiArrowRight size={13} aria-hidden="true" />
              </Link>
            </header>
            {dueSoon.length === 0 ? (
              <p className="px-5 py-6 text-sm text-neutral-500 dark:text-neutral-400">
                Nothing falls due inside the reminder window.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {dueSoon.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {item.description}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        {item.ministry} · {deadlineWords(item.deadline, today)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <StatusBadge tone={ACTION_TONE[item.state]}>{item.state}</StatusBadge>
                      <StatusBadge tone={STANDING_TONE["Due soon"]}>Due soon</StatusBadge>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <FiCheckSquare size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        A decision is finalised once and never edited. Where something must
        change, a correction record is written beside it with the authorising
        officer and the reason, and the original text is kept.
      </p>
    </div>
  );
}
