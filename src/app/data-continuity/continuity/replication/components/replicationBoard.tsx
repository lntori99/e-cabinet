"use client";

import { FiAlertTriangle, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { Kpi, StatusBadge } from "@/common/ui";
import { selectReplicationTargets } from "@/core/slices/governance-slice";
import { RPO_TARGET_MINUTES } from "@/data/dataGovernance";

/**
 * FR-DAT-10 — configuration, database and repository replicated to the disaster
 * recovery environment. All three, because a site with the data and not the
 * configuration is a site that holds the papers and cannot serve them.
 *
 * The lag is measured against the recovery point objective rather than against
 * nothing: a repository 412 seconds behind is inside a fifteen-minute objective
 * and is a finding rather than a breach, and the screen should say so.
 */
export default function ReplicationBoard() {
  const targets = selectReplicationTargets();

  const behind = targets.filter((t) => !t.healthy);
  const worst = targets.reduce((max, t) => Math.max(max, t.lagSeconds), 0);
  const objectiveSeconds = RPO_TARGET_MINUTES * 60;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi
          label="Components replicated"
          value={`${targets.length} of 3`}
          hint="Configuration, database, repository"
          tone={targets.length === 3 ? "green" : "red"}
        />
        <Kpi
          label="Running behind"
          value={behind.length}
          hint={behind.length > 0 ? behind.map((t) => t.component).join(", ") : "None"}
          tone={behind.length > 0 ? "amber" : "green"}
        />
        <Kpi
          label="Worst lag"
          value={`${worst}s`}
          hint={
            worst > objectiveSeconds
              ? `Past the ${RPO_TARGET_MINUTES}-minute recovery point objective`
              : `Inside the ${RPO_TARGET_MINUTES}-minute objective`
          }
          tone={worst > objectiveSeconds ? "red" : "green"}
        />
      </div>

      {behind.length > 0 && worst <= objectiveSeconds && (
        <p
          className="flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--viz-warning)" }}
        >
          <FiAlertTriangle
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-warning)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            One target is behind but still inside the recovery point objective.
            That is a finding to watch rather than a breach: the objective is
            what a declared disaster would actually cost, and at {worst} seconds
            it would cost {worst} seconds of work.
          </span>
        </p>
      )}

      {targets.map((target) => (
        <article
          key={target.id}
          className="rounded-lg border bg-white dark:bg-neutral-900"
          style={{
            borderColor: target.healthy ? "var(--viz-grid)" : "var(--viz-warning)",
          }}
        >
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {target.id} · FR-DAT-10
              </p>
              <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                {target.component}
              </h2>
              <p className="mt-1 inline-flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                {target.from}
                <FiArrowRight size={13} className="text-neutral-400" aria-hidden="true" />
                {target.to}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2">
              {target.healthy ? (
                <FiCheckCircle
                  size={14}
                  style={{ color: "var(--viz-good)" }}
                  aria-hidden="true"
                />
              ) : (
                <FiAlertTriangle
                  size={14}
                  style={{ color: "var(--viz-warning)" }}
                  aria-hidden="true"
                />
              )}
              <StatusBadge tone={target.healthy ? "green" : "amber"}>
                {target.healthy ? "In step" : "Catching up"}
              </StatusBadge>
            </span>
          </header>

          <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
            <div className="space-y-0.5">
              <DetailRow label="Mode" value={target.mode} />
              <DetailRow
                label="Lag"
                value={
                  <span
                    style={{
                      color:
                        target.lagSeconds > objectiveSeconds
                          ? "var(--viz-critical)"
                          : target.healthy
                            ? undefined
                            : "var(--viz-warning)",
                    }}
                  >
                    {target.lagSeconds} seconds
                  </span>
                }
              />
            </div>
            <div className="space-y-0.5">
              <DetailRow label="Last verified" value={stamp(target.lastVerifiedAt)} />
              <DetailRow label="Note" value={target.note} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
