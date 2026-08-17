"use client";

import { FiAlertTriangle, FiCheckCircle, FiFlag, FiXCircle } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { selectRecoveryTests } from "@/core/slices/governance-slice";
import { RPO_TARGET_MINUTES, RTO_TARGET_MINUTES } from "@/data/dataGovernance";
import type { RecoveryTest } from "@/models/response/base-response";

const RESULT_TONE: Record<RecoveryTest["result"], "green" | "amber" | "red"> = {
  Passed: "green",
  "Passed with findings": "amber",
  Failed: "red",
};

/**
 * FR-DAT-09 — a documented restore, completed successfully before go-live. The
 * screen marks which test is the gate, because "we have done restores" and "the
 * restore that go-live depends on has passed" are different statements and only
 * the second one is the requirement.
 */
export default function RestoreBoard({ kind }: { kind: RecoveryTest["kind"] }) {
  const tests = selectRecoveryTests().filter((t) => t.kind === kind);
  const gate = tests.find((t) => t.goLiveGate);

  if (tests.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={FiAlertTriangle}
          title={`No ${kind.toLowerCase()} test on record`}
          description={
            kind === "Restore"
              ? "FR-DAT-09 requires a documented restore before go-live. Until one is recorded here, that gate is not met."
              : "FR-DAT-12 is Release 2. A live failover test has not yet been run at full service."
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {kind === "Restore" && (
        <section
          className="flex items-start gap-3 rounded-lg border p-4"
          style={{
            borderColor:
              gate?.result === "Passed" ? "var(--viz-good)" : "var(--viz-warning)",
          }}
        >
          <FiFlag
            size={18}
            className="mt-0.5 shrink-0"
            style={{
              color: gate?.result === "Passed" ? "var(--viz-good)" : "var(--viz-warning)",
            }}
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {gate?.result === "Passed"
                ? "The go-live gate is met"
                : "The go-live gate is not yet met"}
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {gate
                ? `${gate.id} restored the full document repository and database on ${gate.at.slice(0, 10)}, witnessed by ${gate.witnessedBy}. Recovery point achieved: ${gate.rpoAchievedMinutes} minutes against a ${RPO_TARGET_MINUTES}-minute objective. Recovery time: ${gate.rtoAchievedMinutes} minutes against ${RTO_TARGET_MINUTES}.`
                : "No test on record is marked as the go-live gate."}
            </p>
          </div>
        </section>
      )}

      {tests.map((test) => (
        <article
          key={test.id}
          className="rounded-lg border bg-white dark:bg-neutral-900"
          style={{
            borderColor:
              test.result === "Failed"
                ? "var(--viz-critical)"
                : test.result === "Passed with findings"
                  ? "var(--viz-warning)"
                  : "var(--viz-grid)",
          }}
        >
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {test.id} · {kind === "Restore" ? "FR-DAT-09" : "FR-DAT-12"} ·{" "}
                {stamp(test.at)}
              </p>
              <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                {test.scope}
              </h2>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {test.goLiveGate && <StatusBadge tone="blue">Go-live gate</StatusBadge>}
              <span className="inline-flex items-center gap-1.5">
                {test.result === "Passed" ? (
                  <FiCheckCircle
                    size={14}
                    style={{ color: "var(--viz-good)" }}
                    aria-hidden="true"
                  />
                ) : test.result === "Failed" ? (
                  <FiXCircle
                    size={14}
                    style={{ color: "var(--viz-critical)" }}
                    aria-hidden="true"
                  />
                ) : (
                  <FiAlertTriangle
                    size={14}
                    style={{ color: "var(--viz-warning)" }}
                    aria-hidden="true"
                  />
                )}
                <StatusBadge tone={RESULT_TONE[test.result]}>{test.result}</StatusBadge>
              </span>
            </div>
          </header>

          <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
            <div className="space-y-0.5">
              <DetailRow label="Took" value={`${test.durationMinutes} minutes`} />
              {test.rpoAchievedMinutes !== undefined && (
                <DetailRow
                  label="Recovery point achieved"
                  value={
                    <span
                      style={{
                        color:
                          test.rpoAchievedMinutes > RPO_TARGET_MINUTES
                            ? "var(--viz-critical)"
                            : "var(--viz-good)",
                      }}
                    >
                      {test.rpoAchievedMinutes} min · objective {RPO_TARGET_MINUTES}
                    </span>
                  }
                />
              )}
              {test.rtoAchievedMinutes !== undefined && (
                <DetailRow
                  label="Recovery time achieved"
                  value={
                    <span
                      style={{
                        color:
                          test.rtoAchievedMinutes > RTO_TARGET_MINUTES
                            ? "var(--viz-critical)"
                            : "var(--viz-good)",
                      }}
                    >
                      {test.rtoAchievedMinutes} min · objective {RTO_TARGET_MINUTES}
                    </span>
                  }
                />
              )}
            </div>
            <div className="space-y-0.5">
              <DetailRow label="Witnessed by" value={test.witnessedBy} />
              <DetailRow label="Evidence" value={test.evidenceRef} />
            </div>
          </div>

          {test.findings.length > 0 && (
            <div className="border-t border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Findings
              </p>
              <ul className="mt-2 space-y-1.5">
                {test.findings.map((finding) => (
                  <li
                    key={finding}
                    className="inline-flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <FiAlertTriangle
                      size={12}
                      className="mt-1 shrink-0"
                      style={{ color: "var(--viz-warning)" }}
                      aria-hidden="true"
                    />
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
