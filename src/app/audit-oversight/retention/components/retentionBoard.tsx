"use client";

import { FiArchive, FiClock, FiLink2 } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { Kpi, StatusBadge } from "@/common/ui";
import { selectRetention } from "@/core/slices/oversight-slice";

/**
 * FR-AUD-13 — retention for the Government-defined period, and survival of the
 * documents described. The second half is the interesting one: an audit event
 * about a destroyed document is not itself destroyed, so each class counts the
 * events whose subject no longer exists. Those are the records that prove what
 * happened to something nobody can produce any more.
 */
export default function RetentionBoard() {
  const classes = selectRetention();

  const held = classes.reduce((sum, c) => sum + c.eventsHeld, 0);
  const orphaned = classes.reduce((sum, c) => sum + c.orphanedButRetained, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Events retained" value={held.toLocaleString()} hint="Across all classes" />
        <Kpi
          label="Retention classes"
          value={classes.length}
          hint="Set by the Government records schedule, not by the platform"
        />
        <Kpi
          label="Outliving their subject"
          value={orphaned.toLocaleString()}
          hint="Events whose document has been destroyed and which are kept regardless"
        />
      </div>

      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <FiLink2 size={18} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            The record outlives the thing it describes
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-AUD-13 — destroying a document at the end of its retention does not
            destroy the events describing it. {orphaned.toLocaleString()} events
            in this store refer to material that no longer exists, and they are
            the only remaining evidence of who did what to it.
          </p>
        </div>
      </section>

      {classes.map((klass) => (
        <article
          key={klass.id}
          className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {klass.id}
              </p>
              <h2 className="mt-1 inline-flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                <FiArchive size={15} className="text-neutral-400" aria-hidden="true" />
                {klass.name}
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {klass.appliesTo}
              </p>
            </div>
            <StatusBadge tone={klass.years >= 999 ? "blue" : "neutral"}>
              {klass.years >= 999 ? "Permanent" : `${klass.years} years`}
            </StatusBadge>
          </header>

          <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
            <div className="space-y-0.5">
              <DetailRow label="Events held" value={klass.eventsHeld.toLocaleString()} />
              <DetailRow
                label="Oldest event"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <FiClock size={12} className="text-neutral-400" aria-hidden="true" />
                    {klass.oldestEvent}
                  </span>
                }
              />
            </div>
            <div className="space-y-0.5">
              <DetailRow
                label="Subject already destroyed"
                value={
                  klass.orphanedButRetained === 0 ? (
                    "None"
                  ) : (
                    <span style={{ color: "var(--viz-warning)" }}>
                      {klass.orphanedButRetained.toLocaleString()} events, retained
                    </span>
                  )
                }
              />
              <DetailRow label="Authority" value={klass.authority} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
