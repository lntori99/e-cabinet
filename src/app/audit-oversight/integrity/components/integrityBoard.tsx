"use client";

import { FiCheckCircle, FiKey, FiPlay, FiShield, FiUser } from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectAuditLog, selectIntegrityRuns } from "@/core/slices/oversight-slice";
import { runIntegrityCheck } from "@/core/thunks-oversight";

/**
 * FR-AUD-04 and FR-AUD-06. Two buttons rather than one, because the difference
 * between them is the whole requirement: a run by the platform proves the chain
 * to the platform, and a run under the client security owner's own Government
 * credential is the one that proves it to anybody else.
 */
export default function IntegrityBoard() {
  const dispatch = useAppDispatch();
  const runs = useAppSelector(selectIntegrityRuns);
  const log = useAppSelector(selectAuditLog);

  const latest = runs[0];
  const lastIndependent = runs.find((r) => r.independent);
  const failures = runs.filter((r) => r.result === "Failed");

  return (
    <div className="space-y-6">
      <section
        className="rounded-lg border bg-white dark:bg-neutral-900"
        style={{
          borderColor:
            failures.length > 0 ? "var(--viz-critical)" : "var(--viz-good)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
              <FiShield
                size={16}
                style={{
                  color:
                    failures.length > 0 ? "var(--viz-critical)" : "var(--viz-good)",
                }}
                aria-hidden="true"
              />
              {failures.length > 0
                ? "A verification run has failed"
                : "The chain verifies"}
            </p>
            <p className="mt-1 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
              Each event carries a hash over its own fields and over the previous
              event's hash. Altering one row changes its hash, which breaks every
              row after it — so tampering is not merely detectable, it is
              detectable without trusting the platform that stores the log.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch(runIntegrityCheck(log, false))}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
            >
              <FiPlay size={14} aria-hidden="true" />
              Run check
            </button>
            <button
              type="button"
              onClick={() => dispatch(runIntegrityCheck(log, true))}
              className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800"
            >
              <FiKey size={14} aria-hidden="true" />
              Run independently
            </button>
          </div>
        </div>

        {latest && (
          <div className="grid gap-x-6 border-t border-neutral-200 px-5 py-4 lg:grid-cols-2 dark:border-neutral-800">
            <div className="space-y-0.5">
              <DetailRow label="Last run" value={latest.at.replace("T", " ")} />
              <DetailRow
                label="Events checked"
                value={`${latest.eventsChecked.toLocaleString()} · ${latest.fromEvent} to ${latest.toEvent}`}
              />
              <DetailRow label="Took" value={`${latest.durationSeconds} seconds`} />
            </div>
            <div className="space-y-0.5">
              <DetailRow label="Run by" value={latest.runBy} />
              <DetailRow
                label="Result"
                value={
                  <span
                    style={{
                      color:
                        latest.result === "Verified"
                          ? "var(--viz-good)"
                          : "var(--viz-critical)",
                    }}
                  >
                    {latest.result}
                  </span>
                }
              />
              <DetailRow
                label="Last independent run"
                value={
                  lastIndependent
                    ? lastIndependent.at.replace("T", " ")
                    : "None on record"
                }
              />
            </div>
          </div>
        )}
      </section>

      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <FiUser size={18} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            Why one of these buttons matters more than the other
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-AUD-06 — the client security owner holds read access to the audit
            store under a Government-issued credential that Bahamus does not
            hold. A verification run under that credential is evidence for
            Government; a run by the vendor is the vendor checking its own work.
            Both are recorded, and the log says which is which.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Verification runs</h2>
        <Table>
          <thead>
            <tr>
              <Th>Run</Th>
              <Th>Range</Th>
              <Th align="right">Events</Th>
              <Th>Chain head</Th>
              <Th>Run by</Th>
              <Th>Result</Th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <Td>
                  <span className="whitespace-nowrap font-mono">
                    {run.at.replace("T", " ")}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {run.id}
                  </span>
                </Td>
                <Td>
                  <span className="whitespace-nowrap font-mono text-xs">
                    {run.fromEvent} → {run.toEvent}
                  </span>
                </Td>
                <Td align="right">
                  <span className="font-mono">{run.eventsChecked.toLocaleString()}</span>
                </Td>
                <Td>
                  <span className="block max-w-[16rem] truncate font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                    {run.rootHash}
                  </span>
                </Td>
                <Td>
                  <span className="text-neutral-800 dark:text-neutral-200">
                    {run.runBy}
                  </span>
                  {run.independent && (
                    <span className="mt-1 block">
                      <StatusBadge tone="blue">Independent</StatusBadge>
                    </span>
                  )}
                </Td>
                <Td>
                  <span
                    className="inline-flex items-center gap-1.5 whitespace-nowrap"
                    style={{
                      color:
                        run.result === "Verified"
                          ? "var(--viz-good)"
                          : "var(--viz-critical)",
                    }}
                  >
                    <FiCheckCircle size={12} aria-hidden="true" />
                    {run.result}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          The chain head is published with each run. An outside party who kept an
          earlier head can recompute forward and confirm that nothing before it
          has changed — which is what "independently verifiable" has to mean if
          it means anything.
        </p>
      </section>
    </div>
  );
}
