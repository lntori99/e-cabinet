"use client";

import Link from "next/link";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiLock,
  FiShield,
} from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { Kpi, StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  selectAuditLog,
  selectIntegrityRuns,
  selectOpenAlerts,
  selectReplication,
  selectUnreviewedEntitlements,
} from "@/core/slices/oversight-slice";
import { AUDIT_POSTURE, REPLICATION_THRESHOLD_SECONDS } from "@/data/audit";
import EventKindChart from "./eventKindChart";
import ReplicationChart from "./replicationChart";

export default function AuditDashboard({ today }: { today: string }) {
  const log = useAppSelector(selectAuditLog);
  const openAlerts = useAppSelector(selectOpenAlerts);
  const runs = useAppSelector(selectIntegrityRuns);
  const unreviewed = useAppSelector(selectUnreviewedEntitlements);
  const replication = selectReplication();

  const todayEvents = log.filter((e) => e.timestamp.startsWith(today));
  const latestRun = runs[0];
  const lastIndependent = runs.find((r) => r.independent);
  const latestLag = replication[0]?.lagSeconds ?? 0;
  const lagOver = latestLag > REPLICATION_THRESHOLD_SECONDS;
  const critical = openAlerts.filter((a) => a.severity === "critical");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Open alerts"
          value={openAlerts.length}
          hint={
            critical.length > 0
              ? `${critical.length} critical, awaiting disposition`
              : "None critical"
          }
          tone={critical.length > 0 ? "red" : openAlerts.length > 0 ? "amber" : "green"}
        />
        <Kpi
          label="Events today"
          value={todayEvents.length}
          hint={
            todayEvents.length === 0
              ? `Nothing recorded yet today · ${log.length} in the readable log`
              : `${log.length} in the readable log`
          }
        />
        <Kpi
          label="Integrity"
          value={latestRun?.result ?? "—"}
          hint={
            latestRun
              ? `${latestRun.eventsChecked.toLocaleString()} events checked · ${latestRun.at.replace("T", " ")}`
              : "No run recorded"
          }
          tone={latestRun?.result === "Verified" ? "green" : "red"}
        />
        <Kpi
          label="Replication lag"
          value={`${latestLag}s`}
          hint={
            lagOver
              ? `Over the ${REPLICATION_THRESHOLD_SECONDS}s threshold`
              : `Within the ${REPLICATION_THRESHOLD_SECONDS}s threshold · ${replication[0]?.eventsBehind ?? 0} events behind`
          }
          tone={lagOver ? "red" : "green"}
        />
      </div>

      {openAlerts.length > 0 && (
        <section
          className="rounded-lg border"
          style={{
            borderColor:
              critical.length > 0 ? "var(--viz-critical)" : "var(--viz-warning)",
          }}
        >
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <span className="inline-flex items-center gap-2 font-bold">
              <FiAlertTriangle
                size={16}
                style={{
                  color:
                    critical.length > 0
                      ? "var(--viz-critical)"
                      : "var(--viz-warning)",
                }}
                aria-hidden="true"
              />
              Alerts awaiting disposition
            </span>
            <Link
              href="/audit-oversight/alerts"
              className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
            >
              Alerts <FiArrowRight size={13} aria-hidden="true" />
            </Link>
          </header>
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {openAlerts.map((alert) => (
              <li
                key={alert.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {alert.pattern} — {alert.actor}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {alert.observation}
                  </span>
                </span>
                <StatusBadge tone={alert.severity === "critical" ? "red" : "amber"}>
                  {alert.state}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <EventKindChart events={log} />
        <ReplicationChart samples={replication} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <span className="inline-flex items-center gap-2 font-bold">
              <FiLock size={15} className="text-neutral-400" aria-hidden="true" />
              What the log guarantees
            </span>
          </header>
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {AUDIT_POSTURE.map((item) => (
              <li key={item.requirement} className="px-5 py-3.5">
                <p className="flex flex-wrap items-center gap-2">
                  <FiShield
                    size={13}
                    style={{ color: "var(--viz-good)" }}
                    aria-hidden="true"
                  />
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {item.claim}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {item.requirement}
                  </span>
                </p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {item.detail}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <span className="inline-flex items-center gap-2 font-bold">
                <FiCheckCircle size={15} className="text-neutral-400" aria-hidden="true" />
                Integrity verification
              </span>
              <Link
                href="/audit-oversight/integrity"
                className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
              >
                Verification <FiArrowRight size={13} aria-hidden="true" />
              </Link>
            </header>
            <div className="px-5 py-4">
              {latestRun ? (
                <div className="space-y-0.5">
                  <DetailRow label="Last run" value={latestRun.at.replace("T", " ")} />
                  <DetailRow
                    label="Result"
                    value={
                      <span
                        style={{
                          color:
                            latestRun.result === "Verified"
                              ? "var(--viz-good)"
                              : "var(--viz-critical)",
                        }}
                      >
                        {latestRun.result} · {latestRun.eventsChecked.toLocaleString()}{" "}
                        events
                      </span>
                    }
                  />
                  <DetailRow label="Run by" value={latestRun.runBy} />
                  <DetailRow
                    label="Last independent run"
                    value={
                      lastIndependent
                        ? `${lastIndependent.at.replace("T", " ")} — under the Government credential`
                        : "None on record"
                    }
                  />
                </div>
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No verification run has been recorded.
                </p>
              )}
              <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                FR-AUD-04 and FR-AUD-06 — a run by the platform proves the chain
                to the platform. A run under the client security owner's own
                credential is the one that proves it to anybody else.
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <span className="inline-flex items-center gap-2 font-bold">
                <FiShield size={15} className="text-neutral-400" aria-hidden="true" />
                Access review
              </span>
              <Link
                href="/audit-oversight/access-review"
                className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
              >
                Review <FiArrowRight size={13} aria-hidden="true" />
              </Link>
            </header>
            <div className="px-5 py-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {unreviewed.length === 0
                  ? "Every entitlement in the current quarter has been reviewed."
                  : `${unreviewed.length} entitlement${unreviewed.length === 1 ? "" : "s"} in the current quarter ${unreviewed.length === 1 ? "has" : "have"} not been reviewed.`}
              </p>
              {unreviewed.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {unreviewed.map((line) => (
                    <li
                      key={line.id}
                      className="flex flex-wrap items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-neutral-800 dark:text-neutral-200">
                        {line.user} · {line.role}
                      </span>
                      <StatusBadge tone="amber">Not reviewed</StatusBadge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <FiLock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        This console offers no control that edits or removes an audit event, at
        any privilege level, because the service exposes none. What it offers is
        the ability to read the log, to check it, and to be told when something
        in it looks wrong.
      </p>
    </div>
  );
}
