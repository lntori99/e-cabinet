"use client";

import { FiClock, FiFileText, FiPhone, FiUser, FiUsers } from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { Kpi, StatusBadge } from "@/common/ui";
import { RECOVERY_PROCEDURE } from "@/data/dataGovernance";

/**
 * FR-DAT-11 — the documented procedure, confirming five things: recovery point
 * objective, recovery time objective, decision authority, technical steps and
 * communication procedure. All five are on this page because a procedure that
 * lists the technical steps and not who may declare a disaster leaves everybody
 * waiting for permission nobody is empowered to give.
 */
export default function ProcedureBoard() {
  const p = RECOVERY_PROCEDURE;
  const plannedMinutes = p.steps.reduce((sum, s) => sum + s.minutes, 0);
  const withinRto = plannedMinutes <= p.rtoMinutes;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Recovery point objective"
          value={`${p.rpoMinutes} min`}
          hint="The most work a declared disaster may cost"
        />
        <Kpi
          label="Recovery time objective"
          value={`${p.rtoMinutes / 60} hours`}
          hint="From declaration to service restored"
        />
        <Kpi
          label="Procedure adds up to"
          value={`${Math.round((plannedMinutes / 60) * 10) / 10} hours`}
          hint={
            withinRto
              ? "Inside the objective, with margin"
              : "Longer than the objective — the procedure cannot meet it"
          }
          tone={withinRto ? "green" : "red"}
        />
        <Kpi
          label="Last reviewed"
          value={p.lastReviewedAt}
          hint={`${p.documentRef} · approved by ${p.approvedBy}`}
        />
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
          <span className="inline-flex items-center gap-2 font-bold">
            <FiUser size={15} className="text-neutral-400" aria-hidden="true" />
            Who may declare a disaster
          </span>
          <StatusBadge tone="blue">FR-DAT-11</StatusBadge>
        </header>
        <div className="px-5 py-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            The decision rests with the {p.decisionAuthority}. Where they cannot
            be reached, authority passes down this chain in order — and the
            declaration is recorded with the time and the name of whoever made
            it.
          </p>
          <ol className="mt-3 space-y-2">
            {p.authorityChain.map((person, index) => (
              <li key={person} className="flex items-center gap-3 text-sm">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 font-mono text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {index + 1}
                </span>
                <span className="text-neutral-800 dark:text-neutral-200">{person}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
          <span className="inline-flex items-center gap-2 font-bold">
            <FiClock size={15} className="text-neutral-400" aria-hidden="true" />
            Technical steps
          </span>
          <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
            {plannedMinutes} minutes planned · {p.rtoMinutes} allowed
          </span>
        </header>
        <div className="px-5 py-4">
          <Table>
            <thead>
              <tr>
                <Th align="right">Step</Th>
                <Th>What happens</Th>
                <Th>Owner</Th>
                <Th align="right">Minutes</Th>
              </tr>
            </thead>
            <tbody>
              {p.steps.map((step) => (
                <tr key={step.order}>
                  <Td align="right">
                    <span className="font-mono">{step.order}</span>
                  </Td>
                  <Td>
                    <span className="text-neutral-800 dark:text-neutral-200">
                      {step.step}
                    </span>
                  </Td>
                  <Td>{step.owner}</Td>
                  <Td align="right">
                    <span className="font-mono">{step.minutes}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
          <span className="inline-flex items-center gap-2 font-bold">
            <FiPhone size={15} className="text-neutral-400" aria-hidden="true" />
            Communication
          </span>
        </header>
        <div className="px-5 py-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            A recovery nobody has been told about is an outage that lasts as long
            as the silence. Each audience has a channel that works when the
            platform does not.
          </p>
          <div className="mt-3">
            <Table>
              <thead>
                <tr>
                  <Th>Audience</Th>
                  <Th>Channel</Th>
                  <Th>When</Th>
                </tr>
              </thead>
              <tbody>
                {p.communication.map((line) => (
                  <tr key={line.audience}>
                    <Td>
                      <span className="inline-flex items-start gap-1.5">
                        <FiUsers
                          size={12}
                          className="mt-0.5 shrink-0 text-neutral-400"
                          aria-hidden="true"
                        />
                        {line.audience}
                      </span>
                    </Td>
                    <Td>{line.channel}</Td>
                    <Td>{line.timing}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="inline-flex items-center gap-2 font-bold">
          <FiFileText size={15} className="text-neutral-400" aria-hidden="true" />
          The document itself
        </h2>
        <div className="mt-3 space-y-0.5">
          <DetailRow label="Reference" value={p.documentRef} />
          <DetailRow label="Approved by" value={p.approvedBy} />
          <DetailRow label="Last reviewed" value={p.lastReviewedAt} />
        </div>
      </section>
    </div>
  );
}
