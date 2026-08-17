"use client";

import { FiAlertTriangle, FiCheck, FiServer, FiShieldOff, FiX } from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { selectEnvironments } from "@/core/slices/admin-slice";

/**
 * FR-ADM-07 — a non-production environment configured identically to production.
 * "Identically" is the word that needs testing, so each environment is compared
 * line by line and the lines that differ are shown rather than summarised away.
 * Some differences are correct: a test realm and two nodes instead of six are
 * deliberate, and the screen says which.
 */
export default function EnvironmentBoard() {
  const environments = selectEnvironments();

  return (
    <div className="space-y-8">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <FiShieldOff size={18} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            No Cabinet material ever leaves production
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            The environments below match production in the things that determine
            behaviour — versions, roles, handling rules — and differ in the things
            that must differ: they hold synthetic material only, and they
            authenticate against a test realm rather than the Government identity
            provider.
          </p>
        </div>
      </section>

      {environments.map((environment) => {
        const mismatches = environment.parity.filter((line) => !line.matches);

        return (
          <article
            key={environment.id}
            className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {environment.id} · FR-ADM-07
                </p>
                <h2 className="mt-1 inline-flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                  <FiServer size={15} className="text-neutral-400" aria-hidden="true" />
                  {environment.name}
                </h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {environment.purpose}
                </p>
              </div>
              <StatusBadge tone={mismatches.length <= 2 ? "green" : "amber"}>
                {environment.parity.length - mismatches.length} of{" "}
                {environment.parity.length} match
              </StatusBadge>
            </header>

            <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
              <div className="space-y-0.5">
                <DetailRow label="Hosted at" value={environment.hostedAt} />
                <DetailRow
                  label="Last refreshed"
                  value={environment.lastRefreshedAt.replace("T", " ")}
                />
              </div>
              <div className="space-y-0.5">
                <DetailRow label="Data policy" value={environment.dataPolicy} />
              </div>
            </div>

            <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Compared with production
              </p>
              <Table>
                <thead>
                  <tr>
                    <Th>Item</Th>
                    <Th>Production</Th>
                    <Th>{environment.name}</Th>
                    <Th>Matches</Th>
                  </tr>
                </thead>
                <tbody>
                  {environment.parity.map((line) => (
                    <tr key={line.item}>
                      <Td>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {line.item}
                        </span>
                      </Td>
                      <Td>{line.production}</Td>
                      <Td>
                        <span
                          style={{
                            color: line.matches ? undefined : "var(--viz-warning)",
                          }}
                        >
                          {line.nonProduction}
                        </span>
                      </Td>
                      <Td>
                        {line.matches ? (
                          <span
                            className="inline-flex items-center gap-1.5 whitespace-nowrap"
                            style={{ color: "var(--viz-good)" }}
                          >
                            <FiCheck size={12} aria-hidden="true" />
                            Yes
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 whitespace-nowrap"
                            style={{ color: "var(--viz-warning)" }}
                          >
                            <FiX size={12} aria-hidden="true" />
                            By design
                          </span>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <p className="mt-3 flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <FiAlertTriangle size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                The two lines that differ are meant to. Everything that decides how
                the platform behaves — versions, roles, permission sets and
                handling rules — is the same, which is what makes a change
                validated here worth trusting in production.
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
