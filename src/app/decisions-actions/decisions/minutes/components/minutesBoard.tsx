"use client";

import { FiCheck, FiEye, FiSend, FiShield, FiUsers } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectDecisionRecords,
  selectMinutes,
} from "@/core/slices/decision-slice";
import { advanceMinutes } from "@/core/thunks-decisions";
import { MINUTES_TONE } from "../../../components/decisionStatus";

const KIND_NOTE: Record<string, string> = {
  Minutes: "The whole sitting, in order, as the record of what was decided.",
  Extract: "One item, taken out for the people it concerns and nobody else.",
  "Action list": "What each ministry was given, addressed to the responsible officer.",
};

/**
 * FR-DEC-11 and FR-DEC-12. Generation, review and circulation are one flow, and
 * circulation carries the same classification and handling controls as any
 * other document — so recipients are named parties, never a list.
 */
export default function MinutesBoard() {
  const dispatch = useAppDispatch();
  const documents = useAppSelector(selectMinutes);
  const decisions = useAppSelector(selectDecisionRecords);

  return (
    <div className="space-y-6">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-warning)" }}
      >
        <FiShield
          size={18}
          className="mt-0.5 shrink-0"
          style={{ color: "var(--viz-warning)" }}
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            Circulation is a handling decision, not a send button
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-DEC-12 — minutes and extracts carry the classification of what
            they contain and go only to named parties, under the same controls as
            any other document. An extract exists precisely so that a ministry can
            be told its own item without being told the rest of the sitting.
          </p>
        </div>
      </section>

      {documents.map((doc) => {
        const included = decisions.filter((d) => doc.decisionsIncluded.includes(d.id));
        const blockedBy = included.filter((d) => d.state !== "Finalised");
        const canCirculate = doc.state === "Approved" && blockedBy.length === 0;

        return (
          <article
            key={doc.id}
            className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {doc.id} · {doc.meetingId}
                </p>
                <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                  {doc.kind} — {doc.meetingTitle}
                </h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {KIND_NOTE[doc.kind]}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span className={`stamp ${classificationTone(doc.classification)}`}>
                  {doc.classification}
                </span>
                <StatusBadge tone={MINUTES_TONE[doc.state]}>{doc.state}</StatusBadge>
              </div>
            </header>

            <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
              <div className="space-y-0.5">
                <DetailRow label="Scope" value={doc.scope} />
                <DetailRow label="Prepared by" value={doc.preparedBy} />
                <DetailRow label="Approved by" value={doc.approvedBy ?? "Not yet approved"} />
              </div>
              <div className="space-y-0.5">
                <DetailRow label="Meeting date" value={doc.meetingDate} />
                <DetailRow
                  label="Decisions included"
                  value={`${doc.decisionsIncluded.length}`}
                />
                <DetailRow
                  label="Circulated"
                  value={doc.circulatedAt ? stamp(doc.circulatedAt) : "Not circulated"}
                />
              </div>
            </div>

            <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                <FiUsers size={11} aria-hidden="true" />
                Authorised recipients
              </p>
              {doc.circulatedTo.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  None named. Recipients are chosen at circulation, from the people
                  entitled to material at this classification.
                </p>
              ) : (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {doc.circulatedTo.map((party) => (
                    <li
                      key={party}
                      className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
                    >
                      {party}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Decisions drawn on
              </p>
              <ul className="mt-2 space-y-1.5">
                {included.map((decision) => (
                  <li
                    key={decision.id}
                    className="flex flex-wrap items-start justify-between gap-2 text-sm"
                  >
                    <span className="min-w-0 text-neutral-800 dark:text-neutral-200">
                      Item {decision.agendaItemNumber} — {decision.agendaItemTitle}
                    </span>
                    <StatusBadge
                      tone={decision.state === "Finalised" ? "green" : "amber"}
                    >
                      {decision.state}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {doc.state === "Circulated"
                  ? "Circulated. Recipients reach it under the same handling controls as the papers themselves."
                  : blockedBy.length > 0
                    ? `Held: ${blockedBy.length} decision${blockedBy.length === 1 ? " is" : "s are"} not finalised. Minutes cannot go out ahead of the record.`
                    : "Approve, then circulate to the named parties."}
              </p>

              {doc.state === "In review" && blockedBy.length === 0 && (
                <button
                  type="button"
                  onClick={() => dispatch(advanceMinutes(doc, "Approved"))}
                  className="inline-flex items-center gap-2 rounded-lg border border-state-600 px-3 py-1.5 text-sm font-medium text-state-700 transition hover:bg-state-600 hover:text-white dark:text-state-400"
                >
                  <FiCheck size={14} aria-hidden="true" />
                  Approve
                </button>
              )}

              {doc.state === "Draft" && (
                <button
                  type="button"
                  onClick={() => dispatch(advanceMinutes(doc, "In review"))}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
                >
                  <FiEye size={14} aria-hidden="true" />
                  Send for review
                </button>
              )}

              {canCirculate && (
                <button
                  type="button"
                  onClick={() => dispatch(advanceMinutes(doc, "Circulated"))}
                  className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800"
                >
                  <FiSend size={14} aria-hidden="true" />
                  Circulate to {doc.circulatedTo.length || "named"} recipients
                </button>
              )}
            </footer>
          </article>
        );
      })}
    </div>
  );
}
