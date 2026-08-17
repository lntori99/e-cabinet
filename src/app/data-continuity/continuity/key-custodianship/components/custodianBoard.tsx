"use client";

import { FiAlertTriangle, FiCheckCircle, FiKey, FiLock, FiXCircle } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { Kpi, StatusBadge } from "@/common/ui";
import { selectCustodians } from "@/core/slices/governance-slice";
import { KEY_QUORUM } from "@/data/dataGovernance";

/**
 * FR-DAT-13 — key material recoverable through a documented procedure requiring
 * multiple custodians. The number that matters is not how many custodians there
 * are but how many are actually reachable: five custodians with three of them
 * on leave is a quorum of three that cannot be met.
 */
export default function CustodianBoard() {
  const custodians = selectCustodians();

  const available = custodians.filter((c) => c.available);
  const met = available.length >= KEY_QUORUM.required;
  const margin = available.length - KEY_QUORUM.required;

  return (
    <div className="space-y-6">
      <section
        className="rounded-lg border bg-white dark:bg-neutral-900"
        style={{ borderColor: met ? "var(--viz-good)" : "var(--viz-critical)" }}
      >
        <div className="flex flex-wrap items-start gap-3 p-5">
          <FiKey
            size={18}
            className="mt-0.5 shrink-0"
            style={{ color: met ? "var(--viz-good)" : "var(--viz-critical)" }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="font-bold text-neutral-900 dark:text-neutral-100">
              {met
                ? "The quorum can be met"
                : "The quorum cannot currently be met"}
            </p>
            <p className="mt-1 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
              {KEY_QUORUM.required} of {KEY_QUORUM.total} shares reconstitute the
              master key. {available.length} custodians are currently reachable
              {met
                ? margin === 0
                  ? " — exactly enough, with no margin. One more becoming unavailable would leave the key unrecoverable."
                  : `, which is ${margin} more than the procedure needs.`
                : ". Until that changes, an encrypted restore could not be completed."}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi
          label="Shares issued"
          value={KEY_QUORUM.total}
          hint="Held separately, in separate places"
        />
        <Kpi
          label="Needed to recover"
          value={KEY_QUORUM.required}
          hint="No single custodian can reconstitute the key"
        />
        <Kpi
          label="Reachable now"
          value={available.length}
          hint={met ? "Quorum met" : "Quorum not met"}
          tone={met ? (margin === 0 ? "amber" : "green") : "red"}
        />
      </div>

      <section className="space-y-3">
        <h2 className="font-bold">Custodians</h2>
        {custodians.map((custodian) => (
          <article
            key={custodian.id}
            className="rounded-lg border bg-white dark:bg-neutral-900"
            style={{
              borderColor: custodian.available
                ? "var(--viz-grid)"
                : "var(--viz-warning)",
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {custodian.id} · FR-DAT-13
                </p>
                <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                  {custodian.name}
                </h3>
                <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                  {custodian.role}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2">
                {custodian.available ? (
                  <FiCheckCircle
                    size={14}
                    style={{ color: "var(--viz-good)" }}
                    aria-hidden="true"
                  />
                ) : (
                  <FiXCircle
                    size={14}
                    style={{ color: "var(--viz-warning)" }}
                    aria-hidden="true"
                  />
                )}
                <StatusBadge tone={custodian.available ? "green" : "amber"}>
                  {custodian.available ? "Reachable" : "Unavailable"}
                </StatusBadge>
              </span>
            </div>
            <div className="grid gap-x-6 border-t border-neutral-200 px-5 py-3.5 lg:grid-cols-2 dark:border-neutral-800">
              <div className="space-y-0.5">
                <DetailRow
                  label="Custody"
                  value={
                    <span className="inline-flex items-start gap-1.5">
                      <FiLock size={12} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
                      {custodian.custody}
                    </span>
                  }
                />
              </div>
              <div className="space-y-0.5">
                <DetailRow
                  label="Share last verified"
                  value={
                    <span
                      style={{
                        color: custodian.available ? undefined : "var(--viz-warning)",
                      }}
                    >
                      {custodian.lastVerifiedAt}
                    </span>
                  }
                />
              </div>
            </div>
          </article>
        ))}
      </section>

      <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <FiAlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        The procedure is tested before go-live and at each review. Testing it
        means actually reconstituting the key from a quorum of shares, not
        confirming that the envelopes are still in the safe.
      </p>
    </div>
  );
}
