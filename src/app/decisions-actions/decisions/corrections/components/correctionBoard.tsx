"use client";

import { useState } from "react";
import { FiAlertTriangle, FiEdit, FiFileText, FiUserCheck } from "react-icons/fi";
import { Field, TextArea } from "@/common/field";
import { stamp } from "@/common/time";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectCorrections,
  selectFinalisedDecisions,
} from "@/core/slices/decision-slice";
import { correctDecision } from "@/core/thunks-decisions";
import { OPERATOR } from "@/core/app-constants";

/**
 * FR-DEC-05 — a finalised decision is immutable, so this screen never edits
 * one. It writes a correction record beside it carrying the authorising
 * officer, the reason and the original text, and the original is what the
 * screen shows first.
 */
export default function CorrectionBoard() {
  const dispatch = useAppDispatch();
  const decisions = useAppSelector(selectFinalisedDecisions);
  const corrections = useAppSelector(selectCorrections);

  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [reason, setReason] = useState("");

  const target = decisions.find((d) => d.id === openId);

  function open(id: string, current: string) {
    setOpenId(id);
    setText(current);
    setReason("");
  }

  function submit() {
    if (!target || reason.trim().length === 0 || text.trim() === target.text) return;
    dispatch(correctDecision(target, text.trim(), reason.trim()));
    setOpenId(null);
  }

  return (
    <div className="space-y-8">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-warning)" }}
      >
        <FiAlertTriangle
          size={18}
          className="mt-0.5 shrink-0"
          style={{ color: "var(--viz-warning)" }}
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            A correction is a new record, never an edit
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            The original text is kept verbatim on the correction, together with
            the officer who authorised it and the reason. Anyone reading the
            decision later can see both what it said and what it says now.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Corrections on the record</h2>

        {corrections.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            No finalised decision has been corrected.
          </p>
        ) : (
          corrections.map((correction) => {
            const decision = decisions.find((d) => d.id === correction.decisionId);

            return (
              <article
                key={correction.id}
                className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              >
                <header className="border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {correction.id} · corrects {correction.decisionId} ·{" "}
                    {stamp(correction.at)}
                  </p>
                  <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                    {decision?.agendaItemTitle ?? correction.decisionId}
                  </h3>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                    <FiUserCheck size={13} className="text-neutral-400" aria-hidden="true" />
                    Authorised by {correction.authorisedBy}
                  </p>
                </header>

                <div className="px-5 py-4">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      Reason.{" "}
                    </span>
                    {correction.reason}
                  </p>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div
                      className="rounded-lg border p-4"
                      style={{ borderColor: "var(--viz-critical)" }}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--viz-critical)" }}>
                        As originally finalised
                      </p>
                      <p className="mt-2 text-sm text-neutral-600 line-through decoration-neutral-400 dark:text-neutral-400">
                        {correction.originalText}
                      </p>
                    </div>
                    <div
                      className="rounded-lg border p-4"
                      style={{ borderColor: "var(--viz-good)" }}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--viz-good)" }}>
                        As corrected
                      </p>
                      <p className="mt-2 text-sm text-neutral-800 dark:text-neutral-200">
                        {correction.correctedText}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Raise a correction</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Only a finalised decision can be corrected. Anything still in the draft
          cycle is edited in Drafts and Review instead.
        </p>

        <ul className="space-y-2">
          {decisions.map((decision) => (
            <li
              key={decision.id}
              className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-3.5">
                <span className="min-w-0">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {decision.id} · {decision.meetingId}
                  </span>
                  <span className="mt-0.5 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {decision.agendaItemTitle}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    openId === decision.id
                      ? setOpenId(null)
                      : open(decision.id, decision.text)
                  }
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
                >
                  <FiEdit size={14} aria-hidden="true" />
                  {openId === decision.id ? "Cancel" : "Correct"}
                </button>
              </div>

              {openId === decision.id && (
                <div className="space-y-4 border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950">
                    <p className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      <FiFileText size={11} aria-hidden="true" />
                      Preserved on the correction record
                    </p>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                      {decision.text}
                    </p>
                  </div>

                  <Field
                    label="Corrected text"
                    hint="What the decision should read. The original above is kept either way."
                  >
                    <TextArea
                      rows={5}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </Field>

                  <Field
                    label="Reason for the correction"
                    hint="Required. This is what an auditor reads first."
                  >
                    <TextArea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Transcription error against the tabled paper …"
                    />
                  </Field>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Authorising officer: {OPERATOR.name} ({OPERATOR.shortRole})
                    </p>
                    <button
                      type="button"
                      onClick={submit}
                      disabled={reason.trim().length === 0 || text.trim() === decision.text}
                      className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-state-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <FiEdit size={14} aria-hidden="true" />
                      Write correction record
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
