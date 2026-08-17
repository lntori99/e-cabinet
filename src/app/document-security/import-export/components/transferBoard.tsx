"use client";

import { FiCheck, FiClock, FiDownload, FiUpload, FiX } from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectTransfers } from "@/core/slices/docsec-slice";
import { decideTransfer } from "@/core/thunks-docsec";
import type { TransferRecord } from "@/models/response/base-response";

const TONE: Record<TransferRecord["status"], "green" | "amber" | "neutral"> = {
  Completed: "green",
  "Awaiting approval": "amber",
  Declined: "neutral",
};

/** The steps the approved procedure requires, in order. */
const PROCEDURE = [
  {
    step: "Government approval",
    detail: "A named officer authorises the transfer against a written reference",
  },
  {
    step: "Classification check",
    detail: "The material's label is checked against what the counterparty may hold",
  },
  {
    step: "Scan on entry",
    detail: "An import is scanned before it reaches any register",
  },
  {
    step: "Both directions logged",
    detail: "The record names the officer, the counterparty and the reference",
  },
];

export default function TransferBoard() {
  const dispatch = useAppDispatch();
  const transfers = useAppSelector(selectTransfers);

  const pending = transfers.filter((t) => t.status === "Awaiting approval");
  const settled = transfers.filter((t) => t.status !== "Awaiting approval");

  return (
    <div className="space-y-8">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-warning)" }}
      >
        <FiClock
          size={18}
          className="mt-0.5 shrink-0"
          style={{ color: "var(--viz-warning)" }}
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            Release 2 — available where Government approves it
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Controlled transfer is not open in this release. The procedure and the
            register exist so the control can be exercised and audited before it
            is.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
            The approved procedure
          </h2>
          <ol className="mt-3 space-y-3">
            {PROCEDURE.map((item, index) => (
              <li key={item.step} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-state-600/10 font-mono text-[10px] font-semibold text-state-700 dark:bg-state-900/40 dark:text-state-400">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {item.step}
                  </span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {item.detail}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </article>

        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-bold">Awaiting approval</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {pending.length} request{pending.length === 1 ? "" : "s"}
              </p>
            </div>

            {pending.length === 0 ? (
              <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                No transfer is waiting on an approval.
              </p>
            ) : (
              <div className="space-y-4">
                {pending.map((transfer) => (
                  <article
                    key={transfer.id}
                    className="rounded-lg border bg-white p-5 dark:bg-neutral-900"
                    style={{ borderColor: "var(--viz-warning)" }}
                  >
                    <header className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                          {transfer.id} · {transfer.reference}
                        </p>
                        <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                          {transfer.title}
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-2">
                        {transfer.direction === "Import" ? (
                          <FiDownload size={14} className="text-neutral-400" aria-hidden="true" />
                        ) : (
                          <FiUpload size={14} className="text-neutral-400" aria-hidden="true" />
                        )}
                        <StatusBadge tone="blue">{transfer.direction}</StatusBadge>
                      </span>
                    </header>

                    <div className="mt-3 space-y-0.5">
                      <DetailRow label="Counterparty" value={transfer.counterparty} />
                      <DetailRow
                        label="Classification"
                        value={
                          <span className={`stamp ${classificationTone(transfer.classification)}`}>
                            {transfer.classification}
                          </span>
                        }
                      />
                      <DetailRow
                        label="Raised by"
                        value={`${transfer.by} · ${stamp(transfer.at)}`}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            decideTransfer({
                              transferId: transfer.id,
                              title: transfer.title,
                              direction: transfer.direction,
                              status: "Completed",
                            }),
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700"
                      >
                        <FiCheck size={15} aria-hidden="true" />
                        Approve and complete
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            decideTransfer({
                              transferId: transfer.id,
                              title: transfer.title,
                              direction: transfer.direction,
                              status: "Declined",
                            }),
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
                      >
                        <FiX size={15} aria-hidden="true" />
                        Decline
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="font-bold">Transfer register</h2>
            <Table>
              <thead>
                <tr>
                  <Th>Transfer</Th>
                  <Th>Direction</Th>
                  <Th>Counterparty</Th>
                  <Th>Approved by</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {settled.map((transfer) => (
                  <tr key={transfer.id}>
                    <Td>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {transfer.title}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {transfer.id} · {transfer.reference} · {stamp(transfer.at)}
                      </span>
                    </Td>
                    <Td>{transfer.direction}</Td>
                    <Td>{transfer.counterparty}</Td>
                    <Td>{transfer.approvedBy ?? "—"}</Td>
                    <Td>
                      <StatusBadge tone={TONE[transfer.status]}>
                        {transfer.status}
                      </StatusBadge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </section>
        </div>
      </section>
    </div>
  );
}
