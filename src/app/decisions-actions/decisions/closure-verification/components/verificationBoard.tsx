"use client";

import { useState } from "react";
import { FiCheck, FiCornerUpLeft, FiInbox, FiPaperclip } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { TextArea } from "@/common/field";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectActionRecords,
  selectAwaitingVerification,
  selectDecisionRecords,
} from "@/core/slices/decision-slice";
import { verifyClosure } from "@/core/thunks-decisions";
import ActionRow from "../../../components/actionRow";
import UpdateTrail from "../../../components/updateTrail";

/**
 * FR-DEC-10 — closing an action takes two acts by two parties. The ministry
 * attaches evidence and asks; the Secretariat reads it against the decision and
 * decides. This screen is the second half, and it can send the request back.
 */
export default function VerificationBoard({ today }: { today: string }) {
  const dispatch = useAppDispatch();
  const waiting = useAppSelector(selectAwaitingVerification);
  const all = useAppSelector(selectActionRecords);
  const decisions = useAppSelector(selectDecisionRecords);

  const [notes, setNotes] = useState<Record<string, string>>({});
  const verified = all.filter((a) => a.verifiedAt);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-bold">Awaiting verification</h2>

        {waiting.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              icon={FiInbox}
              title="Nothing is waiting on the Secretariat"
              description="No ministry has submitted evidence for closure. Submissions arrive here as soon as they are made."
            />
          </div>
        ) : (
          waiting.map((item) => {
            const decision = decisions.find((d) => d.id === item.decisionId);
            const note = notes[item.id] ?? "";

            return (
              <ActionRow
                key={item.id}
                item={item}
                today={today}
                decisionTitle={decision?.agendaItemTitle}
                controls={
                  <>
                    <button
                      type="button"
                      onClick={() => dispatch(verifyClosure(item, false, note))}
                      className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                    >
                      <FiCornerUpLeft size={14} aria-hidden="true" />
                      Return to ministry
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch(verifyClosure(item, true, note))}
                      className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800"
                    >
                      <FiCheck size={14} aria-hidden="true" />
                      Verify and close
                    </button>
                  </>
                }
              >
                {item.evidence && (
                  <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
                    <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      <FiPaperclip size={11} aria-hidden="true" />
                      Evidence submitted
                    </p>
                    <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                      {item.evidence.description}
                    </p>
                    <div className="mt-3 grid gap-x-6 lg:grid-cols-2">
                      <div className="space-y-0.5">
                        <DetailRow label="Reference" value={item.evidence.reference} />
                        <DetailRow label="Submitted by" value={item.evidence.submittedBy} />
                      </div>
                      <div className="space-y-0.5">
                        <DetailRow
                          label="Submitted at"
                          value={stamp(item.evidence.submittedAt)}
                        />
                        <DetailRow
                          label="Against"
                          value={decision?.agendaItemTitle ?? item.decisionId}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor={`note-${item.id}`}
                        className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                      >
                        Verification note
                      </label>
                      <TextArea
                        id={`note-${item.id}`}
                        rows={2}
                        value={note}
                        onChange={(e) =>
                          setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        placeholder="What was checked, or what is missing if this goes back."
                      />
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        Written into the action's progress trail either way.
                      </p>
                    </div>
                  </div>
                )}
                <UpdateTrail actionId={item.id} />
              </ActionRow>
            );
          })
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Verified and closed</h2>
        {verified.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            No closure has been verified yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {verified.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {item.description}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {item.ministry} · evidence {item.evidence?.reference ?? "—"}
                  </span>
                </span>
                <span className="shrink-0 text-right text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="block" style={{ color: "var(--viz-good)" }}>
                    Verified by {item.verifiedBy}
                  </span>
                  <span className="font-mono">
                    {item.verifiedAt ? stamp(item.verifiedAt) : ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
