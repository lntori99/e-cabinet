"use client";

import { FiFileText, FiLock, FiUnlock } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { DetailRow } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectHolds, selectRetainedRecords } from "@/core/slices/governance-slice";
import { liftHold } from "@/core/thunks-governance";

/**
 * FR-DAT-05 — a hold suspends retention-driven deletion for a defined set. Two
 * things are shown that a simpler screen would leave out: the instrument the
 * hold rests on, and the expiry date it is suspending. A hold with no authority
 * behind it is somebody's opinion, and a hold that is not actually holding
 * anything past its date is not doing any work.
 */
export default function HoldBoard({ today }: { today: string }) {
  const dispatch = useAppDispatch();
  const holds = useAppSelector(selectHolds);
  const records = useAppSelector(selectRetainedRecords);

  const inForce = holds.filter((h) => h.state === "In force");
  const lifted = holds.filter((h) => h.state === "Lifted");

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-bold">In force</h2>
        {inForce.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              icon={FiUnlock}
              title="No hold is in force"
              description="Retention runs to its ordinary schedule. A hold appears here the moment one is raised."
            />
          </div>
        ) : (
          inForce.map((hold) => {
            const held = records.filter((r) => hold.recordIds.includes(r.id));
            const pastDate = held.filter(
              (r) => r.expiresAt !== null && r.expiresAt < today,
            );

            return (
              <article
                key={hold.id}
                className="rounded-lg border bg-white dark:bg-neutral-900"
                style={{ borderColor: "var(--viz-warning)" }}
              >
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {hold.id} · FR-DAT-05 · raised {hold.raisedAt}
                    </p>
                    <h3 className="mt-1 inline-flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                      <FiLock size={15} className="text-neutral-400" aria-hidden="true" />
                      {hold.name}
                    </h3>
                  </div>
                  <StatusBadge tone="amber">In force</StatusBadge>
                </header>

                <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
                  <div className="space-y-0.5">
                    <DetailRow label="Authority" value={hold.authority} />
                    <DetailRow label="Raised by" value={hold.raisedBy} />
                  </div>
                  <div className="space-y-0.5">
                    <DetailRow label="Scope" value={hold.scope} />
                    <DetailRow
                      label="Suspending disposal of"
                      value={
                        pastDate.length === 0 ? (
                          `${held.length} records, none yet past their date`
                        ) : (
                          <span style={{ color: "var(--viz-warning)" }}>
                            {pastDate.length} record{pastDate.length === 1 ? "" : "s"} past
                            date, held only by this
                          </span>
                        )
                      }
                    />
                  </div>
                </div>

                <div className="border-t border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    Records held
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {held.map((record) => (
                      <li
                        key={record.id}
                        className="flex flex-wrap items-baseline justify-between gap-3 text-sm"
                      >
                        <span className="inline-flex items-start gap-1.5 text-neutral-800 dark:text-neutral-200">
                          <FiFileText
                            size={12}
                            className="mt-1 shrink-0 text-neutral-400"
                            aria-hidden="true"
                          />
                          {record.title}
                        </span>
                        <span
                          className="font-mono text-xs"
                          style={{
                            color:
                              record.expiresAt !== null && record.expiresAt < today
                                ? "var(--viz-critical)"
                                : undefined,
                          }}
                        >
                          {record.expiresAt ?? "permanent"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Lifting the hold resumes retention. Anything already past its
                    date becomes eligible for disposal the moment it is lifted.
                  </p>
                  <button
                    type="button"
                    onClick={() => dispatch(liftHold(hold))}
                    className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                  >
                    <FiUnlock size={14} aria-hidden="true" />
                    Lift hold
                  </button>
                </footer>
              </article>
            );
          })
        )}
      </section>

      {lifted.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-bold">Lifted</h2>
          {lifted.map((hold) => (
            <article
              key={hold.id}
              className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {hold.id} · raised {hold.raisedAt} · lifted {hold.liftedAt}
                  </p>
                  <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                    {hold.name}
                  </h3>
                </div>
                <StatusBadge tone="neutral">Lifted</StatusBadge>
              </header>
              <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
                <div className="space-y-0.5">
                  <DetailRow label="Authority" value={hold.authority} />
                  <DetailRow label="Raised by" value={hold.raisedBy} />
                </div>
                <div className="space-y-0.5">
                  <DetailRow label="Lifted by" value={hold.liftedBy ?? "—"} />
                  <DetailRow label="Scope" value={hold.scope} />
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
