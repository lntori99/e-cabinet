"use client";

import { FiAlertTriangle, FiCheck, FiCircle, FiCornerUpLeft, FiX } from "react-icons/fi";
import { distance, hoursUntil, stamp } from "@/common/time";
import type { ClearanceStage, StageStatus } from "@/models/response/base-response";
import { STAGE_COLOR } from "./subStatus";

const ICON: Record<StageStatus, typeof FiCircle> = {
  "Not started": FiCircle,
  "In progress": FiCircle,
  Approved: FiCheck,
  Rejected: FiX,
  Returned: FiCornerUpLeft,
  "Skipped by exception": FiAlertTriangle,
  "Not applicable": FiCircle,
};

/**
 * FR-SUB-06 / 07 / 08 — the live position of a paper. The rail shows every
 * configured stage, including the ones that do not apply to this paper, because
 * a submitter reading "four of five cleared" needs to see which five.
 */
export default function ClearanceTrail({
  stages,
  now,
}: {
  stages: ClearanceStage[];
  now: string;
}) {
  if (stages.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No clearance path has been applied yet — the paper is still a draft.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {stages.map((stage) => {
        const Icon = ICON[stage.status];
        const color = STAGE_COLOR[stage.status];
        const muted =
          stage.status === "Not started" || stage.status === "Not applicable";
        const overdue =
          stage.status === "In progress" &&
          stage.dueAt !== undefined &&
          hoursUntil(stage.dueAt, now) < 0;

        return (
          <li key={stage.stage} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
              style={{
                borderColor: color,
                background: muted ? "transparent" : color,
                color: muted ? color : "#fff",
              }}
              aria-hidden="true"
            >
              <Icon size={11} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span
                  className={`text-sm font-medium ${
                    muted
                      ? "text-neutral-500 dark:text-neutral-400"
                      : "text-neutral-900 dark:text-neutral-100"
                  }`}
                >
                  {stage.stage}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {stage.mode}
                  {stage.mandatory ? "" : " · optional"}
                </span>
              </span>

              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                {stage.actor ?? stage.actorRole}
                {stage.status === "Not applicable" && stage.condition
                  ? ` · ${stage.condition}`
                  : ""}
                {stage.status === "In progress" && stage.dueAt
                  ? ` · ${stage.serviceHours}h service time, due ${distance(hoursUntil(stage.dueAt, now))}`
                  : ""}
                {stage.decidedAt ? ` · ${stamp(stage.decidedAt)}` : ""}
              </span>

              {overdue && (
                <span
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "var(--viz-critical)" }}
                >
                  <FiAlertTriangle size={11} aria-hidden="true" />
                  Past its service time — escalated
                </span>
              )}
            </span>

            <span
              className="shrink-0 text-xs font-medium"
              style={{ color: muted ? undefined : color }}
            >
              {stage.status}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
