"use client";

import { FiAlertTriangle, FiCheckCircle, FiGlobe, FiMapPin } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { Kpi, StatusBadge } from "@/common/ui";
import { selectResidency } from "@/core/slices/governance-slice";

/**
 * FR-DAT-06 — all Cabinet documents, metadata, meeting records, audit records
 * and backups within Malawi-controlled infrastructure. This is an assurance
 * panel rather than a control: there is no button here that moves anything,
 * because the requirement is that nothing is anywhere else. The value of the
 * screen is that it names every store and says where each one physically is.
 */
export default function ResidencyBoard() {
  const stores = selectResidency();
  const offshore = stores.filter((s) => s.leavesMalawi);

  return (
    <div className="space-y-6">
      <section
        className="rounded-lg border bg-white dark:bg-neutral-900"
        style={{
          borderColor: offshore.length === 0 ? "var(--viz-good)" : "var(--viz-critical)",
        }}
      >
        <div className="flex flex-wrap items-start gap-3 p-5">
          <FiGlobe
            size={18}
            className="mt-0.5 shrink-0"
            style={{
              color: offshore.length === 0 ? "var(--viz-good)" : "var(--viz-critical)",
            }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="font-bold text-neutral-900 dark:text-neutral-100">
              {offshore.length === 0
                ? "Every store is inside Malawi"
                : `${offshore.length} store${offshore.length === 1 ? "" : "s"} hold data outside Malawi`}
            </p>
            <p className="mt-1 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
              FR-DAT-06 covers documents, metadata, meeting records, audit records
              and backups. There is no cloud tier, no content delivery cache, no
              external search service and no third-party conferencing provider —
              each of which would be an ordinary engineering choice and each of
              which would put Cabinet material on somebody else's infrastructure.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Stores in the register" value={stores.length} hint="Every place data rests" />
        <Kpi
          label="Inside Malawi"
          value={stores.length - offshore.length}
          hint="Under Government-controlled infrastructure"
          tone="green"
        />
        <Kpi
          label="Outside Malawi"
          value={offshore.length}
          hint={offshore.length === 0 ? "None, as required" : "A breach of FR-DAT-06"}
          tone={offshore.length === 0 ? "green" : "red"}
        />
      </div>

      {stores.map((store) => (
        <article
          key={store.id}
          className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {store.id} · FR-DAT-06
              </p>
              <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                {store.store}
              </h2>
              <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                {store.contents}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2">
              {store.leavesMalawi ? (
                <FiAlertTriangle
                  size={14}
                  style={{ color: "var(--viz-critical)" }}
                  aria-hidden="true"
                />
              ) : (
                <FiCheckCircle
                  size={14}
                  style={{ color: "var(--viz-good)" }}
                  aria-hidden="true"
                />
              )}
              <StatusBadge tone={store.leavesMalawi ? "red" : "green"}>
                {store.country}
              </StatusBadge>
            </span>
          </header>

          <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
            <div className="space-y-0.5">
              <DetailRow
                label="Site"
                value={
                  <span className="inline-flex items-start gap-1.5">
                    <FiMapPin size={12} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
                    {store.site}
                  </span>
                }
              />
              <DetailRow label="Operated by" value={store.operator} />
            </div>
            <div className="space-y-0.5">
              <DetailRow label="Note" value={store.note} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
