"use client";

import { FiAlertTriangle, FiCheckCircle, FiUploadCloud, FiUsers } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectBatches } from "@/core/slices/admin-slice";
import { applyBatch } from "@/core/thunks-admin";
import type { OnboardingBatch } from "@/models/response/base-response";

const STATE_TONE: Record<
  OnboardingBatch["state"],
  "green" | "amber" | "red" | "neutral"
> = {
  Draft: "neutral",
  Validated: "amber",
  Applied: "green",
  Rejected: "red",
};

/**
 * FR-ADM-12 — bulk user import and role assignment for ministry onboarding.
 * A batch with failed rows cannot be applied at all, rather than applying the
 * good rows and reporting the rest: a half-imported ministry is worse than an
 * unimported one, because nobody can tell which half.
 */
export default function OnboardingBoard() {
  const dispatch = useAppDispatch();
  const batches = useAppSelector(selectBatches);

  if (batches.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={FiUploadCloud}
          title="No batches"
          description="No ministry import has been submitted. Batches appear here once uploaded and validated."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {batches.map((batch) => {
        const blocked = batch.errors.length > 0;
        const applied = batch.state === "Applied";

        return (
          <article
            key={batch.id}
            className="rounded-lg border bg-white dark:bg-neutral-900"
            style={{
              borderColor: blocked ? "var(--viz-warning)" : "var(--viz-grid)",
            }}
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {batch.id} · FR-ADM-12
                </p>
                <h2 className="mt-1 inline-flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                  <FiUsers size={15} className="text-neutral-400" aria-hidden="true" />
                  {batch.ministry}
                </h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {batch.rows} rows · {batch.rolesAssigned.join(", ")}
                </p>
              </div>
              <StatusBadge tone={STATE_TONE[batch.state]}>{batch.state}</StatusBadge>
            </header>

            <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
              <div className="space-y-0.5">
                <DetailRow label="Submitted by" value={batch.submittedBy} />
                <DetailRow
                  label="Submitted"
                  value={batch.submittedAt.replace("T", " ")}
                />
              </div>
              <div className="space-y-0.5">
                <DetailRow
                  label="Rows accepted"
                  value={`${batch.rows - batch.errors.length} of ${batch.rows}`}
                />
                <DetailRow
                  label="Applied"
                  value={
                    applied
                      ? `${batch.appliedAt?.replace("T", " ")} by ${batch.appliedBy}`
                      : "Not applied"
                  }
                />
              </div>
            </div>

            {blocked && (
              <div
                className="border-t px-5 py-4"
                style={{ borderColor: "var(--viz-warning)" }}
              >
                <p
                  className="inline-flex items-center gap-2 text-sm font-medium"
                  style={{ color: "var(--viz-warning)" }}
                >
                  <FiAlertTriangle size={14} aria-hidden="true" />
                  {batch.errors.length} rows failed validation — the batch cannot
                  be applied
                </p>
                <div className="mt-3">
                  <Table>
                    <thead>
                      <tr>
                        <Th align="right">Row</Th>
                        <Th>Field</Th>
                        <Th>Problem</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {batch.errors.map((error) => (
                        <tr key={`${error.row}-${error.field}`}>
                          <Td align="right">
                            <span className="font-mono">{error.row}</span>
                          </Td>
                          <Td>{error.field}</Td>
                          <Td>
                            <span className="text-neutral-700 dark:text-neutral-300">
                              {error.problem}
                            </span>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {blocked
                  ? "Correct the rows above and resubmit. Nothing is created until every row validates."
                  : applied
                    ? "Accounts created and roles assigned. Each account is individually administered in Identity and Access from here on."
                    : "Every row validates. Applying creates the accounts and assigns the roles listed."}
              </p>
              {!applied && (
                <button
                  type="button"
                  disabled={blocked}
                  onClick={() => dispatch(applyBatch(batch))}
                  className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiCheckCircle size={14} aria-hidden="true" />
                  Apply batch
                </button>
              )}
            </footer>
          </article>
        );
      })}
    </div>
  );
}
