"use client";

import { FiCheck, FiHash, FiSend, FiX } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectTransfers } from "@/core/slices/governance-slice";

/**
 * FR-DAT-03 — transfer at end of retention, preserving metadata, classification
 * and audit linkage. Three separate promises, so three separate checks: a
 * transfer that arrived with the files but without the classification would
 * have moved the records and lost the reason anybody may or may not read them.
 */
export default function TransferBoard() {
  const transfers = useAppSelector(selectTransfers);

  return (
    <div className="space-y-6">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <FiSend size={18} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            What has to survive the journey
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            A transfer moves the record out of the platform and into the National
            Archives. Three things must arrive with it: the metadata that says
            what it is, the classification that says who may read it, and the
            linkage to the audit events describing what was done to it. A
            transfer missing any one of the three is not accepted.
          </p>
        </div>
      </section>

      {transfers.map((transfer) => {
        const complete =
          transfer.metadataPreserved &&
          transfer.classificationPreserved &&
          transfer.auditLinkagePreserved;

        return (
          <article
            key={transfer.id}
            className="rounded-lg border bg-white dark:bg-neutral-900"
            style={{
              borderColor: complete ? "var(--viz-grid)" : "var(--viz-critical)",
            }}
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {transfer.id} · FR-DAT-03 · {transfer.transferredAt}
                </p>
                <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                  {transfer.recordIds.length} record
                  {transfer.recordIds.length === 1 ? "" : "s"} to{" "}
                  {transfer.destination}
                </h2>
              </div>
              <StatusBadge tone={transfer.acceptedAt ? "green" : "amber"}>
                {transfer.acceptedAt ? "Accepted" : "Awaiting acceptance"}
              </StatusBadge>
            </header>

            <div className="grid gap-3 px-5 py-4 sm:grid-cols-3">
              <Check label="Metadata" ok={transfer.metadataPreserved} />
              <Check label="Classification" ok={transfer.classificationPreserved} />
              <Check label="Audit linkage" ok={transfer.auditLinkagePreserved} />
            </div>

            <div className="grid gap-x-6 border-t border-neutral-200 px-5 py-4 lg:grid-cols-2 dark:border-neutral-800">
              <div className="space-y-0.5">
                <DetailRow label="Records" value={transfer.recordIds.join(", ")} />
                <DetailRow label="Accepted by" value={transfer.acceptedBy} />
              </div>
              <div className="space-y-0.5">
                <DetailRow
                  label="Accepted"
                  value={transfer.acceptedAt ?? "Not yet acknowledged"}
                />
              </div>
            </div>

            <div className="border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
              <p className="inline-flex items-start gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                <FiHash size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
                Manifest digest
              </p>
              <p className="mt-1 break-all font-mono text-xs text-neutral-600 dark:text-neutral-300">
                {transfer.manifestDigest}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Check({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border px-4 py-3"
      style={{ borderColor: ok ? "var(--viz-good)" : "var(--viz-critical)" }}
    >
      {ok ? (
        <FiCheck size={15} style={{ color: "var(--viz-good)" }} aria-hidden="true" />
      ) : (
        <FiX size={15} style={{ color: "var(--viz-critical)" }} aria-hidden="true" />
      )}
      <span className="text-sm text-neutral-800 dark:text-neutral-200">
        {label} {ok ? "preserved" : "lost"}
      </span>
    </div>
  );
}
