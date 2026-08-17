"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FiAlertTriangle, FiCheckCircle, FiFlag, FiShieldOff } from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { distance, hoursUntil } from "@/common/time";
import { Kpi, StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  selectBlockedFromPack,
  selectEscalations,
  selectInClearance,
  selectLateSubmissions,
  selectQuarantined,
  selectQueueForStage,
  selectSubmissions,
} from "@/core/slices/submissions-slice";
import { SUBMISSION_TONE, blockingStages } from "../../../components/subStatus";
import ServiceTimeChart from "./serviceTimeChart";
import StageDepthChart from "./stageDepthChart";

export default function ClearanceDashboard({ now }: { now: string }) {
  const submissions = useAppSelector(selectSubmissions);
  const inClearance = useAppSelector(selectInClearance);
  const queue = useAppSelector(selectQueueForStage);
  const blocked = useAppSelector(selectBlockedFromPack);
  const quarantined = useAppSelector(selectQuarantined);
  const late = useAppSelector(selectLateSubmissions);

  const escalationSelector = useMemo(() => selectEscalations(now), [now]);
  const escalations = useAppSelector(escalationSelector);

  const awaitingLate = late.filter((s) => !s.lateAuthorisedBy);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="In clearance"
          value={inClearance.length}
          hint={`${queue.length} of them waiting on your stage`}
        />
        <Kpi
          label="Escalated"
          value={escalations.length}
          hint={
            escalations.length === 0
              ? "Every stage is inside its service time"
              : `Worst is ${Math.round(escalations[0].hoursOver)}h over`
          }
          tone={escalations.length === 0 ? "green" : "red"}
        />
        <Kpi
          label="Blocked from pack"
          value={blocked.length}
          hint="Mandatory stages outstanding, with no exception recorded"
          tone={blocked.length === 0 ? "green" : "amber"}
        />
        <Kpi
          label="Held at the perimeter"
          value={quarantined.length + awaitingLate.length}
          hint={`${quarantined.length} quarantined · ${awaitingLate.length} late and unauthorised`}
          tone={quarantined.length + awaitingLate.length === 0 ? "green" : "amber"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <StageDepthChart submissions={submissions} now={now} />
        <ServiceTimeChart submissions={submissions} now={now} />
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-bold">Blocked from pack assembly</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              FR-SUB-15 — a paper cannot reach the pack until every mandatory
              stage is complete or an exception has been recorded against it.
            </p>
          </div>
          <Link
            href="/submission-clearance/clearance/all-in-clearance"
            className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
          >
            All in clearance →
          </Link>
        </div>

        {blocked.length === 0 ? (
          <p className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
            <FiCheckCircle
              size={15}
              style={{ color: "var(--viz-good)" }}
              aria-hidden="true"
            />
            Nothing is holding up pack assembly.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Paper</Th>
                <Th>Meeting</Th>
                <Th>Outstanding</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {blocked.map((submission) => {
                const outstanding = blockingStages(submission);
                const held =
                  submission.files.some((f) => f.scan === "Quarantined") ||
                  (submission.late && !submission.lateAuthorisedBy);

                return (
                  <tr
                    key={submission.id}
                    className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                  >
                    <Td>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {submission.title}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {submission.id} · {submission.metadata.originatingMinistry}
                      </span>
                    </Td>
                    <Td>
                      {submission.metadata.meetingId}
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        Deadline {distance(hoursUntil(submission.deadline, now))}
                      </span>
                    </Td>
                    <Td>
                      {outstanding.length === 0 ? (
                        <span className="text-neutral-500 dark:text-neutral-400">
                          Nothing outstanding
                        </span>
                      ) : (
                        <span>{outstanding.map((s) => s.stage).join(", ")}</span>
                      )}
                      {held && (
                        <span
                          className="mt-1 flex items-center gap-1.5 text-xs"
                          style={{ color: "var(--viz-critical)" }}
                        >
                          {submission.files.some((f) => f.scan === "Quarantined") ? (
                            <>
                              <FiShieldOff size={11} aria-hidden="true" /> Held in
                              quarantine
                            </>
                          ) : (
                            <>
                              <FiAlertTriangle size={11} aria-hidden="true" /> Late,
                              unauthorised
                            </>
                          )}
                        </span>
                      )}
                      {submission.exception && (
                        <span
                          className="mt-1 flex items-center gap-1.5 text-xs"
                          style={{ color: "var(--viz-serious)" }}
                        >
                          <FiFlag size={11} aria-hidden="true" />
                          Exception {submission.exception.reference}
                        </span>
                      )}
                    </Td>
                    <Td>
                      <StatusBadge tone={SUBMISSION_TONE[submission.status]}>
                        {submission.status}
                      </StatusBadge>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}
