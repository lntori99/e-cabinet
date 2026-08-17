"use client";

import { FiArrowDown, FiArrowRight, FiArrowUp, FiCheck, FiX, FiZap } from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectReclassifications } from "@/core/slices/docsec-slice";
import { decideReclassification } from "@/core/thunks-docsec";
import { handlingRule } from "@/data/documentSecurity";
import { RECLASSIFICATION_TONE } from "../../components/docStatus";

export default function ReclassificationBoard() {
  const dispatch = useAppDispatch();
  const requests = useAppSelector(selectReclassifications);

  const pending = requests.filter((r) => r.status === "Pending");
  const decided = requests.filter((r) => r.status !== "Pending");

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Awaiting a decision</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {pending.length} request{pending.length === 1 ? "" : "s"}
          </p>
        </div>

        {pending.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            No classification change is waiting.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {pending.map((request) => {
              const raising = request.direction === "Raised";
              const fromRule = handlingRule(request.from);
              const toRule = handlingRule(request.to);

              return (
                <article
                  key={request.id}
                  className="rounded-lg border bg-white p-5 dark:bg-neutral-900"
                  style={{ borderColor: "var(--viz-warning)" }}
                >
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {request.id} · {request.documentId}
                      </p>
                      <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                        {request.documentTitle}
                      </h3>
                    </div>
                    <StatusBadge tone={raising ? "amber" : "red"}>
                      {request.direction}
                    </StatusBadge>
                  </header>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className={`stamp ${classificationTone(request.from)}`}>
                      {request.from}
                    </span>
                    {raising ? (
                      <FiArrowUp size={16} className="text-neutral-400" aria-hidden="true" />
                    ) : (
                      <FiArrowDown size={16} className="text-neutral-400" aria-hidden="true" />
                    )}
                    <span className={`stamp ${classificationTone(request.to)}`}>
                      {request.to}
                    </span>
                  </div>

                  <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                    {request.reason}
                  </p>

                  <div className="mt-3 space-y-0.5">
                    <DetailRow
                      label="Requested by"
                      value={`${request.requestedBy} · ${stamp(request.requestedAt)}`}
                    />
                    <DetailRow
                      label="Download changes"
                      value={`${fromRule.download} → ${toRule.download}`}
                    />
                    <DetailRow
                      label="Print changes"
                      value={`${fromRule.print} → ${toRule.print}`}
                    />
                    <DetailRow
                      label="Retention changes"
                      value={`${fromRule.retentionDays === 0 ? "Meeting end" : `${fromRule.retentionDays} days`} → ${
                        toRule.retentionDays === 0
                          ? "Meeting end"
                          : `${toRule.retentionDays} days`
                      }`}
                    />
                  </div>

                  {!raising && (
                    <p
                      className="mt-3 flex items-start gap-2 text-xs"
                      style={{ color: "var(--viz-critical)" }}
                    >
                      <FiZap size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="text-neutral-600 dark:text-neutral-300">
                        Lowering a label widens who can reach the document. It takes
                        effect immediately and is logged at critical severity.
                      </span>
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => dispatch(decideReclassification(request, "Applied"))}
                      className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700"
                    >
                      <FiCheck size={15} aria-hidden="true" />
                      Apply the change
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch(decideReclassification(request, "Declined"))}
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
                    >
                      <FiX size={15} aria-hidden="true" />
                      Decline
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Decided</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {decided.length} on the record
          </p>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Document</Th>
              <Th>Change</Th>
              <Th>Reason</Th>
              <Th>Decided</Th>
              <Th>Outcome</Th>
            </tr>
          </thead>
          <tbody>
            {decided.map((request) => (
              <tr key={request.id}>
                <Td>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {request.documentTitle}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {request.documentId} · {request.requestedBy}
                  </span>
                </Td>
                <Td>
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <span className={`stamp ${classificationTone(request.from)}`}>
                      {request.from}
                    </span>
                    <FiArrowRight size={12} className="text-neutral-400" aria-hidden="true" />
                    <span className={`stamp ${classificationTone(request.to)}`}>
                      {request.to}
                    </span>
                  </span>
                </Td>
                <Td>{request.reason}</Td>
                <Td>
                  {request.decidedBy}
                  <span className="mt-0.5 block font-mono text-xs text-neutral-500 dark:text-neutral-400">
                    {request.decidedAt ? stamp(request.decidedAt) : ""}
                  </span>
                </Td>
                <Td>
                  <StatusBadge tone={RECLASSIFICATION_TONE[request.status]}>
                    {request.status}
                  </StatusBadge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          An applied change is live on the next request. Anyone holding the
          document open sees the new rules the moment they act on it — there is no
          window in which the old label still governs.
        </p>
      </section>
    </div>
  );
}
