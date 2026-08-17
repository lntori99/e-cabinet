"use client";

import { useState } from "react";
import { FiCheckSquare, FiClock } from "react-icons/fi";
import { LuInbox } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { distance, hoursUntil } from "@/common/time";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  actingStageChanged,
  selectActingStage,
  selectQueueForStage,
} from "@/core/slices/submissions-slice";
import { addComment } from "@/core/thunks-submissions";
import { CLEARANCE_STAGES } from "@/data/submissionClearance";
import type { ClearanceStage, Submission } from "@/models/response/base-response";
import DecisionModal from "../../../components/decisionModal";
import PaperDetail from "../../../components/paperDetail";
import PaperList from "../../../components/paperList";

export default function MyQueue({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const actingStage = useAppSelector(selectActingStage);
  const queue = useAppSelector(selectQueueForStage);

  const [selectedId, setSelectedId] = useState("");
  const [deciding, setDeciding] = useState<{
    submission: Submission;
    stage: ClearanceStage;
  } | null>(null);

  const selected = queue.find((s) => s.id === selectedId) ?? queue[0] ?? null;
  const stage = selected?.stages.find(
    (s) => s.stage === actingStage && s.status === "In progress",
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          Answering as
        </span>
        <div className="flex flex-wrap gap-1.5">
          {CLEARANCE_STAGES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => dispatch(actingStageChanged(name))}
              aria-pressed={actingStage === name}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                actingStage === name
                  ? "border-state-600 bg-state-600 text-white"
                  : "border-neutral-300 text-neutral-600 hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={LuInbox}
            title={`Nothing is waiting on ${actingStage}`}
            description="No paper is currently at this stage. Switch stage above to see another actor's queue."
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              {queue.length} awaiting {actingStage}
            </p>
            <PaperList
              submissions={queue}
              selectedId={selected?.id ?? ""}
              onSelect={setSelectedId}
              emptyMessage="Nothing at this stage."
            />
          </div>

          <div className="min-w-0">
            {selected && (
              <PaperDetail
                submission={selected}
                now={now}
                onReply={(body, replyToId) =>
                  dispatch(
                    addComment({
                      submissionId: selected.id,
                      stage: actingStage,
                      body,
                      role: stage?.actorRole ?? actingStage,
                      replyToId,
                    }),
                  )
                }
                actions={
                  stage ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                        <FiClock size={14} className="text-neutral-400" aria-hidden="true" />
                        {stage.dueAt
                          ? `${stage.serviceHours}h service time — due ${distance(hoursUntil(stage.dueAt, now))}`
                          : `${stage.serviceHours}h service time`}
                      </p>
                      <button
                        type="button"
                        onClick={() => setDeciding({ submission: selected, stage })}
                        className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700"
                      >
                        <FiCheckSquare size={15} aria-hidden="true" />
                        Record decision
                      </button>
                    </div>
                  ) : null
                }
              />
            )}
          </div>
        </div>
      )}

      {deciding && (
        <DecisionModal
          submission={deciding.submission}
          stage={deciding.stage}
          onClose={() => setDeciding(null)}
        />
      )}
    </div>
  );
}
