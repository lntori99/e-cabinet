"use client";

import { useState } from "react";
import { FiCheck, FiEye, FiPrinter, FiServer, FiX } from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { classificationTone } from "@/common/ui";
import { OPERATOR } from "@/core/app-constants";
import { useAppSelector } from "@/core/hook";
import { selectDocuments } from "@/core/slices/documents-slice";
import { WATERMARK_POLICIES } from "@/data/documentSecurity";
import type { Classification } from "@/core/app-constants";

function Mark({ on }: { on: boolean }) {
  return on ? (
    <FiCheck size={15} style={{ color: "var(--viz-good)" }} aria-label="Applied" />
  ) : (
    <FiX size={15} className="text-neutral-400" aria-label="Not applied" />
  );
}

export default function WatermarkBoard({ now }: { now: string }) {
  const documents = useAppSelector(selectDocuments);
  const [preview, setPreview] = useState<Classification>("TOP SECRET — CABINET");

  const policy =
    WATERMARK_POLICIES.find((p) => p.classification === preview) ??
    WATERMARK_POLICIES[0];
  const sample = documents.find((d) => d.classification === preview);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h2 className="font-bold">Policy by classification</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            A stamp on view deters a photograph; a stamp on print survives the
            page leaving the building. Both carry enough to identify who the copy
            was rendered for.
          </p>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Classification</Th>
              <Th>On view</Th>
              <Th>On print</Th>
              <Th>Fields stamped</Th>
            </tr>
          </thead>
          <tbody>
            {WATERMARK_POLICIES.map((row) => (
              <tr
                key={row.classification}
                className="cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                onClick={() => setPreview(row.classification)}
              >
                <Td>
                  <span className={`stamp ${classificationTone(row.classification)}`}>
                    {row.classification}
                  </span>
                </Td>
                <Td>
                  <Mark on={row.onView} />
                </Td>
                <Td>
                  <Mark on={row.onPrint} />
                </Td>
                <Td>
                  {row.fields.length === 0 ? (
                    <span className="text-neutral-500 dark:text-neutral-400">
                      No watermark at this level
                    </span>
                  ) : (
                    row.fields.join(" · ")
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div>
            <h2 className="font-bold">What the reader sees</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Rendered for {OPERATOR.name} at {stamp(now)}. Select a row above to
              preview another classification.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-neutral-300 bg-white p-8 dark:border-neutral-700 dark:bg-neutral-950">
            {/* The stamp itself — server-rendered into the page in production. */}
            {policy.onView && (
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                aria-hidden="true"
              >
                <p className="-rotate-[24deg] text-center font-mono text-lg font-semibold uppercase leading-relaxed tracking-[0.2em] text-seal-500/15">
                  {preview}
                  <span className="mt-1 block text-sm tracking-[0.16em]">
                    {OPERATOR.name} · {stamp(now)}
                  </span>
                  {policy.fields.includes("Meeting reference") && (
                    <span className="mt-1 block text-sm tracking-[0.16em]">
                      {sample?.meetingId ?? "MTG-2026-014"}
                    </span>
                  )}
                </p>
              </div>
            )}

            <div className="relative">
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                Republic of Malawi · Cabinet
              </p>
              <p className="mt-3 text-center text-base font-bold text-neutral-900 dark:text-neutral-100">
                {sample?.title ?? "Cabinet Paper"}
              </p>
              <p className="mt-1 text-center text-xs text-neutral-500 dark:text-neutral-400">
                {sample?.ministry ?? "Originating ministry"} ·{" "}
                {sample?.pages ?? 12} pages
              </p>

              <div className="mt-6 space-y-2" aria-hidden="true">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-2 rounded bg-neutral-100 dark:bg-neutral-800"
                    style={{ width: `${index % 3 === 2 ? 62 : 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {!policy.onView && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No watermark is applied on view at this classification. A print of
              the same document{" "}
              {policy.onPrint ? "is still stamped." : "is not stamped either."}
            </p>
          )}
        </div>

        <aside className="space-y-4">
          <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
              <FiServer size={16} className="text-neutral-400" aria-hidden="true" />
              Applied server-side
            </h3>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              FR-DOC-09 — the stamp is composited into the pages before they are
              sent. There is no overlay for a browser extension to remove, and no
              client setting that suppresses it.
            </p>
          </article>

          <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
              <FiEye size={16} className="text-neutral-400" aria-hidden="true" />
              Every copy is different
            </h3>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Because the stamp carries the reader&apos;s identity and the moment it
              was rendered, a leaked page identifies the copy it came from.
            </p>
          </article>

          <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
              <FiPrinter size={16} className="text-neutral-400" aria-hidden="true" />
              Print carries the version
            </h3>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              The immutable version identifier is rendered into printed output
              alongside the watermark, so a page on a desk can be matched back to
              the version it came from.
            </p>
          </article>
        </aside>
      </section>
    </div>
  );
}
