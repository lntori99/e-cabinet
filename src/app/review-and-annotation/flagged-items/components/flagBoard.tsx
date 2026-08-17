"use client";

import { FiCalendar, FiFlag, FiX } from "react-icons/fi";
import { LuFlagOff } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectFlags } from "@/core/slices/review-slice";
import { withdrawFlag } from "@/core/thunks-review";
import { FLAG_COLOR, FLAG_TONE } from "../../components/readingStatus";

export default function FlagBoard() {
  const dispatch = useAppDispatch();
  const flags = useAppSelector(selectFlags);

  const open = flags.filter((f) => f.status !== "Resolved");
  const resolved = flags.filter((f) => f.status === "Resolved");

  if (flags.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuFlagOff}
          title="Nothing flagged"
          description="Flag a matter while reading and it appears here, and on the Secretariat dashboard against the agenda item it belongs to."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">With the Secretariat</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {open.length} open
          </p>
        </div>

        {open.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Everything you raised has been dealt with.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {open.map((flag) => (
              <article
                key={flag.id}
                className="rounded-lg border bg-white p-5 dark:bg-neutral-900"
                style={{ borderColor: FLAG_COLOR[flag.kind] }}
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {flag.id} · {flag.meetingId}
                    </p>
                    <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                      {flag.agendaItemTitle}
                    </h3>
                  </div>
                  <span className="stamp" style={{ color: FLAG_COLOR[flag.kind] }}>
                    <FiFlag size={10} />
                    {flag.kind}
                  </span>
                </header>

                <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                  {flag.note}
                </p>

                <div className="mt-3 space-y-0.5">
                  <DetailRow label="Paper" value={flag.documentTitle} />
                  <DetailRow label="Raised" value={stamp(flag.at)} />
                  <DetailRow
                    label="Status"
                    value={
                      <span className="inline-flex items-center gap-2">
                        <StatusBadge tone={FLAG_TONE[flag.status]}>
                          {flag.status}
                        </StatusBadge>
                        {flag.scheduledFor && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                            <FiCalendar size={11} aria-hidden="true" />
                            {flag.scheduledFor}
                          </span>
                        )}
                      </span>
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() => dispatch(withdrawFlag(flag.id, flag.agendaItemTitle))}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-seal-500 hover:text-seal-500 dark:border-neutral-700 dark:text-neutral-300"
                >
                  <FiX size={14} aria-hidden="true" />
                  Withdraw the flag
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {resolved.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold">Resolved</h2>
          <ul className="space-y-2">
            {resolved.map((flag) => (
              <li
                key={flag.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {flag.agendaItemTitle}
                  </span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {flag.kind} · raised {stamp(flag.at)}
                  </span>
                </span>
                <StatusBadge tone="neutral">Resolved</StatusBadge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
