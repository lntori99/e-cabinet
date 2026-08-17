"use client";

import { FiAlertTriangle, FiCheckCircle, FiPhone, FiRefreshCw } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectDeliveries,
  selectFailedDeliveries,
  selectPendingDeliveries,
} from "@/core/slices/notification-slice";
import { retryDelivery } from "@/core/thunks-notifications";
import { TRIGGER_REQUIREMENT } from "../../components/notificationStatus";

/**
 * FR-NOT-10 — failures surfaced to the Secretariat. The reason this is its own
 * screen rather than a filter on the log is the sentence in the sidebar table:
 * a participant who never received a release notice is a meeting risk, and a
 * risk needs somewhere it is looked at rather than somewhere it can be found.
 */
export default function FailedBoard() {
  const dispatch = useAppDispatch();
  const failed = useAppSelector(selectFailedDeliveries);
  const pending = useAppSelector(selectPendingDeliveries);
  const all = useAppSelector(selectDeliveries);

  /**
   * The question the Secretariat actually has is not "did the email fail" but
   * "does this person know". The same event usually went out in-platform too,
   * so a failure with a delivered sibling is a different problem from one
   * without.
   */
  function reachedAnotherWay(recipientEvent: string, recipient: string): boolean {
    return all.some(
      (r) =>
        r.subjectRef === recipientEvent &&
        r.recipient === recipient &&
        r.state === "Delivered",
    );
  }

  if (failed.length === 0 && pending.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={FiCheckCircle}
          title="Everything reached its recipient"
          description="No notification has failed or is still in flight. Failures appear here the moment a channel reports one."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {failed.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-bold">Failed</h2>

          {failed.map((record) => {
            const covered = reachedAnotherWay(record.subjectRef, record.recipient);

            return (
              <article
                key={record.id}
                className="rounded-lg border bg-white dark:bg-neutral-900"
                style={{ borderColor: "var(--viz-critical)" }}
              >
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {record.id} · {TRIGGER_REQUIREMENT[record.trigger]} ·{" "}
                      {record.templateId}
                    </p>
                    <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                      {record.trigger} — {record.recipient}
                    </h3>
                    <p
                      className="mt-1 inline-flex items-start gap-1.5 text-sm"
                      style={{ color: "var(--viz-critical)" }}
                    >
                      <FiAlertTriangle
                        size={13}
                        className="mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      {record.failureReason}
                    </p>
                  </div>
                  <StatusBadge tone="red">Failed</StatusBadge>
                </header>

                <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
                  <div className="space-y-0.5">
                    <DetailRow label="Channel" value={record.channel} />
                    <DetailRow label="Role" value={record.role} />
                    <DetailRow label="Attempts" value={`${record.attempts}`} />
                  </div>
                  <div className="space-y-0.5">
                    <DetailRow label="Last attempt" value={stamp(record.at)} />
                    <DetailRow label="Points at" value={record.subjectRef} />
                    <DetailRow
                      label="Reached another way"
                      value={
                        covered ? (
                          <span style={{ color: "var(--viz-good)" }}>
                            Yes — the same event was delivered to them on another
                            channel
                          </span>
                        ) : (
                          <span style={{ color: "var(--viz-critical)" }}>
                            No — this person has not been told at all
                          </span>
                        )
                      }
                    />
                  </div>
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
                  <p className="inline-flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <FiPhone size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {covered
                      ? "The in-platform notice reached them, so this is a channel fault rather than a notification failure."
                      : "Nothing has reached this recipient. Chase by telephone as well as retrying."}
                  </p>
                  <button
                    type="button"
                    onClick={() => dispatch(retryDelivery(record))}
                    className="inline-flex items-center gap-2 rounded-lg border border-state-600 px-3 py-1.5 text-sm font-medium text-state-700 transition hover:bg-state-600 hover:text-white dark:text-state-400"
                  >
                    <FiRefreshCw size={14} aria-hidden="true" />
                    Retry delivery
                  </button>
                </footer>
              </article>
            );
          })}
        </section>
      )}

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold">Still in flight</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Accepted by the channel but not yet confirmed. These are not failures
            and are not chased — they move to delivered or to failed on their own.
          </p>
          <ul className="space-y-2">
            {pending.map((record) => (
              <li
                key={record.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {record.trigger} — {record.recipient}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {record.channel} · {stamp(record.at)} · points at{" "}
                    {record.subjectRef}
                  </span>
                </span>
                <StatusBadge tone="amber">Pending</StatusBadge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
