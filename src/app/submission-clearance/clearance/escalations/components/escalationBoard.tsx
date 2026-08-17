"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FiAlertTriangle, FiArrowUpRight, FiCheckCircle } from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { distance, stamp } from "@/common/time";
import { useAppSelector } from "@/core/hook";
import { selectEscalations } from "@/core/slices/submissions-slice";
import { CLEARANCE_PATHS } from "@/data/submissionClearance";

/** Who a breached stage is raised to. Configuration, not a rule in code. */
const ESCALATION_POINT: Record<string, string> = {
  "Policy Review": "Chief Secretary",
  "Legal Clearance": "Attorney General",
  "Financial Clearance": "Secretary to Treasury",
  "Administrative Clearance": "Secretary to Cabinet",
  "Final Approval": "Secretary to Cabinet",
};

export default function EscalationBoard({ now }: { now: string }) {
  const selector = useMemo(() => selectEscalations(now), [now]);
  const escalations = useAppSelector(selector);

  return (
    <div className="space-y-8">
      {escalations.length === 0 ? (
        <p className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
          <FiCheckCircle
            size={15}
            style={{ color: "var(--viz-good)" }}
            aria-hidden="true"
          />
          Every stage awaiting a decision is inside its service time.
        </p>
      ) : (
        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">Past service time</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {escalations.length} stage{escalations.length === 1 ? "" : "s"} raised
            </p>
          </div>

          <Table>
            <thead>
              <tr>
                <Th>Paper</Th>
                <Th>Stage</Th>
                <Th>Due</Th>
                <Th align="right">Over by</Th>
                <Th>Raised to</Th>
              </tr>
            </thead>
            <tbody>
              {escalations.map(({ submission, stage, hoursOver }) => (
                <tr
                  key={`${submission.id}-${stage.stage}`}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  <Td>
                    <Link
                      href="/submission-clearance/clearance/all-in-clearance"
                      className="font-medium text-neutral-900 hover:text-state-700 dark:text-neutral-100 dark:hover:text-state-400"
                    >
                      {submission.title}
                    </Link>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {submission.id} · {submission.metadata.originatingMinistry}
                    </span>
                  </Td>
                  <Td>
                    {stage.stage}
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {stage.actor ?? stage.actorRole} · {stage.serviceHours}h allowed
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono">
                      {stage.dueAt ? stamp(stage.dueAt) : "—"}
                    </span>
                  </Td>
                  <Td align="right">
                    <span
                      className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium"
                      style={{ color: "var(--viz-critical)" }}
                    >
                      <FiAlertTriangle size={13} aria-hidden="true" />
                      {distance(-hoursOver).replace(" ago", "")}
                    </span>
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5">
                      <FiArrowUpRight
                        size={13}
                        className="text-neutral-400"
                        aria-hidden="true"
                      />
                      {ESCALATION_POINT[stage.stage] ?? "Secretary to Cabinet"}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="font-bold">Configured service times</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            The clock a stage is measured against, per clearance path. Changing a
            service time changes what counts as a breach from that point on.
          </p>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Path</Th>
              <Th>Stage</Th>
              <Th align="right">Service time</Th>
              <Th>Escalates to</Th>
            </tr>
          </thead>
          <tbody>
            {CLEARANCE_PATHS.flatMap((path) =>
              path.stages.map((stage) => (
                <tr key={`${path.id}-${stage.stage}`}>
                  <Td>{path.name}</Td>
                  <Td>{stage.stage}</Td>
                  <Td align="right">
                    <span className="font-mono">{stage.serviceHours}h</span>
                  </Td>
                  <Td>{ESCALATION_POINT[stage.stage] ?? "Secretary to Cabinet"}</Td>
                </tr>
              )),
            )}
          </tbody>
        </Table>
      </section>
    </div>
  );
}
