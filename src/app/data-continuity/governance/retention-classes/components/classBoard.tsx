"use client";

import { FiArchive, FiClock, FiFileText, FiTrash2 } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  selectRetainedRecords,
  selectRetentionClasses,
} from "@/core/slices/governance-slice";

/**
 * FR-DAT-01 — the classes, and the rules attached to each. The disposal action
 * is shown as prominently as the period, because "twenty-five years" and
 * "twenty-five years then destroyed" are different promises.
 */
export default function ClassBoard() {
  const classes = selectRetentionClasses();
  const records = useAppSelector(selectRetainedRecords);

  return (
    <div className="space-y-6">
      {classes.map((klass) => {
        const held = records.filter((r) => r.retentionClassId === klass.id);
        const permanent = klass.years >= 999;

        return (
          <article
            key={klass.id}
            className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {klass.id} · FR-DAT-01
                </p>
                <h2 className="mt-1 inline-flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                  <FiClock size={15} className="text-neutral-400" aria-hidden="true" />
                  {klass.name}
                </h2>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <StatusBadge tone={permanent ? "blue" : "neutral"}>
                  {permanent ? "Permanent" : `${klass.years} years`}
                </StatusBadge>
                <StatusBadge
                  tone={klass.disposalAction === "Destroy" ? "red" : "green"}
                >
                  <span className="inline-flex items-center gap-1">
                    {klass.disposalAction === "Destroy" ? (
                      <FiTrash2 size={10} aria-hidden="true" />
                    ) : (
                      <FiArchive size={10} aria-hidden="true" />
                    )}
                    {klass.disposalAction}
                  </span>
                </StatusBadge>
              </div>
            </header>

            <div className="px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Rules attached to this class
              </p>
              <ul className="mt-2 space-y-1.5">
                {klass.rules.map((rule) => (
                  <li
                    key={rule}
                    className="text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    {rule}
                  </li>
                ))}
              </ul>

              <div className="mt-4 grid gap-x-6 lg:grid-cols-2">
                <div className="space-y-0.5">
                  <DetailRow label="Applies to" value={klass.appliesTo.join(", ")} />
                  <DetailRow label="Authority" value={klass.authority} />
                </div>
                <div className="space-y-0.5">
                  <DetailRow
                    label="Records held"
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        <FiFileText size={12} className="text-neutral-400" aria-hidden="true" />
                        {held.length}
                      </span>
                    }
                  />
                  <DetailRow
                    label="At end of period"
                    value={klass.disposalAction}
                  />
                </div>
              </div>
            </div>
          </article>
        );
      })}

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        The periods are the Government records schedule as the platform applies
        it. The platform does not choose them and cannot shorten one — a class
        change is a security-relevant configuration change and needs a second
        approver.
      </p>
    </div>
  );
}
