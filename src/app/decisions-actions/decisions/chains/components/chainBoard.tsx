"use client";

import { FiArrowDown, FiGitBranch, FiLink2 } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  selectChainedDecisions,
  selectDecisionRecords,
} from "@/core/slices/decision-slice";
import { PRIOR_DECISIONS } from "@/data/decisions";
import type { DecisionRecord } from "@/models/response/base-response";
import { OUTCOME_TONE } from "../../../components/decisionStatus";

/**
 * FR-DEC-13 — a policy question is rarely settled in one sitting. Following the
 * `supersedes` link backwards gives the history of the question rather than a
 * list of decisions that happen to share a subject line.
 */
export default function ChainBoard() {
  const chained = useAppSelector(selectChainedDecisions);
  const all = useAppSelector(selectDecisionRecords);

  if (chained.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={FiGitBranch}
          title="No decision continues an earlier one"
          description="Nothing on the record is linked to a prior decision. A link is set when a decision returns to a question Cabinet has already considered."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {chained.map((decision) => (
        <article
          key={decision.id}
          className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <header className="border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              <FiLink2 size={11} aria-hidden="true" />
              Policy question · {decision.ministries.join(", ") || "Cabinet"}
            </p>
            <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
              {decision.agendaItemTitle}
            </h2>
          </header>

          <ol className="px-5 py-4">
            {chainFor(decision, all).map((step, index, steps) => (
              <li key={step.id}>
                <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {step.id} · {step.meeting} · {step.date}
                      </span>
                      <span className="mt-0.5 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {step.title}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {step.classification && (
                        <span className={`stamp ${classificationTone(step.classification)}`}>
                          {step.classification}
                        </span>
                      )}
                      <StatusBadge tone={OUTCOME_TONE[step.outcome]}>
                        {step.outcome}
                      </StatusBadge>
                    </span>
                  </div>
                  {step.text && (
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                      {step.text}
                    </p>
                  )}
                  {!step.text && (
                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      Recorded before this console. The reference and the outcome
                      are held; the full text is in the meeting file.
                    </p>
                  )}
                </div>

                {index < steps.length - 1 && (
                  <div className="flex items-center gap-2 py-2 pl-4 text-xs text-neutral-500 dark:text-neutral-400">
                    <FiArrowDown size={13} aria-hidden="true" />
                    returned to Cabinet as
                  </div>
                )}
              </li>
            ))}
          </ol>
        </article>
      ))}
    </div>
  );
}

interface ChainStep {
  id: string;
  title: string;
  meeting: string;
  date: string;
  outcome: DecisionRecord["outcome"];
  text?: string;
  classification?: DecisionRecord["classification"];
}

/**
 * Walks the `supersedes` links back to the beginning and returns the chain
 * oldest-first. Decisions that predate the console resolve out of
 * `PRIOR_DECISIONS`, which holds the reference and the outcome but not the text.
 */
function chainFor(decision: DecisionRecord, all: DecisionRecord[]): ChainStep[] {
  const steps: ChainStep[] = [
    {
      id: decision.id,
      title: decision.agendaItemTitle,
      meeting: decision.meetingTitle,
      date: decision.meetingDate,
      outcome: decision.outcome,
      text: decision.text,
      classification: decision.classification,
    },
  ];

  let cursor = decision.supersedes;
  const seen = new Set<string>([decision.id]);

  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);
    const inConsole = all.find((d) => d.id === cursor);
    if (inConsole) {
      steps.unshift({
        id: inConsole.id,
        title: inConsole.agendaItemTitle,
        meeting: inConsole.meetingTitle,
        date: inConsole.meetingDate,
        outcome: inConsole.outcome,
        text: inConsole.text,
        classification: inConsole.classification,
      });
      cursor = inConsole.supersedes;
      continue;
    }

    const prior = PRIOR_DECISIONS[cursor];
    if (!prior) break;
    steps.unshift({
      id: cursor,
      title: prior.title,
      meeting: prior.meeting,
      date: prior.date,
      outcome: prior.outcome,
    });
    cursor = undefined;
  }

  return steps;
}
