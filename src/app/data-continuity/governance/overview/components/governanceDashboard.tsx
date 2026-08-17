"use client";

import Link from "next/link";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiLock,
  FiShield,
} from "react-icons/fi";
import { Kpi, StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  daysToExpiry,
  selectActiveHolds,
  selectPendingDeletions,
  selectRecoveryTests,
  selectRetainedRecords,
  selectTransfers,
} from "@/core/slices/governance-slice";
import { APPROACHING_DAYS } from "@/data/dataGovernance";
import ExpiryChart from "./expiryChart";
import KindChart from "./kindChart";

export default function GovernanceDashboard({ today }: { today: string }) {
  const records = useAppSelector(selectRetainedRecords);
  const holds = useAppSelector(selectActiveHolds);
  const pending = useAppSelector(selectPendingDeletions);
  const transfers = useAppSelector(selectTransfers);
  const tests = selectRecoveryTests();

  const approaching = records.filter((r) => {
    const days = daysToExpiry(r, today);
    return days !== null && days >= 0 && days <= APPROACHING_DAYS && !r.transferId;
  });
  const passed = records.filter((r) => {
    const days = daysToExpiry(r, today);
    // A record already transferred out is not sitting here awaiting anything.
    return days !== null && days < 0 && !r.transferId;
  });
  const heldPastDate = passed.filter((r) => r.holdId);
  const awaitingApproval = pending.filter((d) => d.state === "Awaiting approval");
  const lastRestore = tests
    .filter((t) => t.kind === "Restore" && t.result !== "Failed")
    .sort((a, b) => b.at.localeCompare(a.at))[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Approaching end of retention"
          value={approaching.length}
          hint={`Within ${APPROACHING_DAYS} days`}
          tone={approaching.length > 0 ? "amber" : "green"}
        />
        <Kpi
          label="Holds in force"
          value={holds.length}
          hint={
            heldPastDate.length > 0
              ? `${heldPastDate.length} record${heldPastDate.length === 1 ? "" : "s"} past date, held by one`
              : "No record is held past its date"
          }
          tone={holds.length > 0 ? "amber" : "neutral"}
        />
        <Kpi
          label="Deletions awaiting a second approver"
          value={awaitingApproval.length}
          hint="Never executable by one administrator"
          tone={awaitingApproval.length > 0 ? "amber" : "green"}
        />
        <Kpi
          label="Last successful restore"
          value={lastRestore ? lastRestore.at.slice(0, 10) : "—"}
          hint={
            lastRestore
              ? `${lastRestore.result} · ${lastRestore.durationMinutes} minutes`
              : "No restore on record"
          }
          tone={lastRestore?.result === "Passed" ? "green" : "amber"}
        />
      </div>

      {passed.length > 0 && (
        <section
          className="rounded-lg border"
          style={{ borderColor: "var(--viz-warning)" }}
        >
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <span className="inline-flex items-center gap-2 font-bold">
              <FiClock
                size={16}
                style={{ color: "var(--viz-warning)" }}
                aria-hidden="true"
              />
              Past their retention date and still held
            </span>
            <Link
              href="/data-continuity/governance/records"
              className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
            >
              Records <FiArrowRight size={13} aria-hidden="true" />
            </Link>
          </header>
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {passed.map((record) => (
              <li
                key={record.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {record.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {record.id} · {record.kind} · expired {record.expiresAt}
                  </span>
                </span>
                <StatusBadge tone={record.holdId ? "blue" : "amber"}>
                  {record.holdId ? `Held by ${record.holdId}` : "No hold — awaiting disposal"}
                </StatusBadge>
              </li>
            ))}
          </ul>
          <p className="border-t border-neutral-200 px-5 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            A record past its date with a hold on it is correct. One past its date
            with no hold is waiting on somebody to approve its disposal.
          </p>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <ExpiryChart records={records} today={today} />
        <KindChart records={records} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <span className="inline-flex items-center gap-2 font-bold">
              <FiLock size={15} className="text-neutral-400" aria-hidden="true" />
              Holds in force
            </span>
            <Link
              href="/data-continuity/governance/legal-holds"
              className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
            >
              Legal holds <FiArrowRight size={13} aria-hidden="true" />
            </Link>
          </header>
          {holds.length === 0 ? (
            <p className="px-5 py-6 text-sm text-neutral-500 dark:text-neutral-400">
              No hold is in force. Retention runs to its ordinary schedule.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {holds.map((hold) => (
                <li key={hold.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {hold.name}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {hold.authority} · raised by {hold.raisedBy} · {hold.recordIds.length}{" "}
                    record{hold.recordIds.length === 1 ? "" : "s"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <span className="inline-flex items-center gap-2 font-bold">
                <FiShield size={15} className="text-neutral-400" aria-hidden="true" />
                Deletions in flight
              </span>
              <Link
                href="/data-continuity/governance/deletion-approvals"
                className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
              >
                Approvals <FiArrowRight size={13} aria-hidden="true" />
              </Link>
            </header>
            {pending.length === 0 ? (
              <p className="px-5 py-6 text-sm text-neutral-500 dark:text-neutral-400">
                Nothing is waiting to be destroyed.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {pending.map((request) => (
                  <li
                    key={request.id}
                    className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {request.scope}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        {request.id} · requested by {request.requestedBy}
                      </span>
                    </span>
                    <StatusBadge tone={request.state === "Approved" ? "blue" : "amber"}>
                      {request.state}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <span className="inline-flex items-center gap-2 font-bold">
                <FiCheckCircle size={15} className="text-neutral-400" aria-hidden="true" />
                Transferred to the Archives
              </span>
              <Link
                href="/data-continuity/governance/archival-transfer"
                className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
              >
                Transfers <FiArrowRight size={13} aria-hidden="true" />
              </Link>
            </header>
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {transfers.map((transfer) => (
                <li
                  key={transfer.id}
                  className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {transfer.recordIds.length} record
                      {transfer.recordIds.length === 1 ? "" : "s"} · {transfer.transferredAt}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {transfer.destination}
                    </span>
                  </span>
                  <StatusBadge
                    tone={
                      transfer.metadataPreserved &&
                      transfer.classificationPreserved &&
                      transfer.auditLinkagePreserved
                        ? "green"
                        : "red"
                    }
                  >
                    All three preserved
                  </StatusBadge>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <FiAlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        Nothing on this side of the app can destroy a record on its own. A
        deletion takes three people — one to ask, one to approve, one to carry it
        out — and a hold stops all three.
      </p>
    </div>
  );
}
