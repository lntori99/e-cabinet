"use client";

import {
  FiDownload,
  FiPrinter,
  FiSlash,
  FiVideo,
  FiWifiOff,
  FiCopy,
} from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectDocuments } from "@/core/slices/documents-slice";
import { HANDLING_RULES, handlingRule } from "@/data/documentSecurity";
import type { HandlingRight } from "@/models/response/base-response";
import { RIGHT_TONE } from "../../components/docStatus";

function Right({ value }: { value: HandlingRight }) {
  return (
    <StatusBadge tone={RIGHT_TONE[value]}>
      {value === "Blocked" ? "Blocked" : value}
    </StatusBadge>
  );
}

export default function HandlingBoard() {
  const documents = useAppSelector(selectDocuments);

  /** Documents whose stored rights disagree with their classification's rule. */
  const drift = documents.filter((doc) => {
    const rule = handlingRule(doc.classification);
    return (
      (rule.download === "Blocked" && doc.downloadable) ||
      (rule.print === "Blocked" && doc.printable) ||
      (rule.watermark && !doc.watermarked)
    );
  });

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Table>
          <thead>
            <tr>
              <Th>Classification</Th>
              <Th>Who may view</Th>
              <Th>Download</Th>
              <Th>Print</Th>
              <Th>Offline</Th>
              <Th>Recording</Th>
              <Th align="right">Retention</Th>
            </tr>
          </thead>
          <tbody>
            {HANDLING_RULES.map((rule) => (
              <tr key={rule.classification}>
                <Td>
                  <span className={`stamp ${classificationTone(rule.classification)}`}>
                    {rule.classification}
                  </span>
                </Td>
                <Td>{rule.whoMayView}</Td>
                <Td>
                  <Right value={rule.download} />
                </Td>
                <Td>
                  <Right value={rule.print} />
                </Td>
                <Td>
                  <Right value={rule.offline} />
                </Td>
                <Td>
                  <Right value={rule.recording} />
                </Td>
                <Td align="right">
                  <span className="font-mono whitespace-nowrap">
                    {rule.retentionDays === 0
                      ? "Meeting end"
                      : `${rule.retentionDays} days`}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-600 dark:text-neutral-300">
          <li className="inline-flex items-center gap-1.5">
            <FiSlash size={13} className="text-neutral-400" aria-hidden="true" />
            Blocked — the affordance is not offered and the request is refused
            server-side
          </li>
          <li className="inline-flex items-center gap-1.5">
            <FiDownload size={13} className="text-neutral-400" aria-hidden="true" />
            Authorised roles — permitted only where the role and the meeting state
            both allow it
          </li>
        </ul>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
            <FiPrinter size={16} className="text-neutral-400" aria-hidden="true" />
            Every print is recorded
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-DOC-11 — a permitted print is still an event: who printed, what,
            when, and under which classification. The record is written before the
            job is released, so an interrupted print is still accounted for.
          </p>
        </article>

        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
            <FiCopy size={16} className="text-neutral-400" aria-hidden="true" />
            Copy, extract and capture
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-DOC-12 — the viewer suppresses copy, extract and screen-capture
            affordances as far as the platform allows, and records attempts where
            they are detectable. It is a deterrent and a record, not a guarantee
            against a camera.
          </p>
        </article>

        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
            <FiWifiOff size={16} className="text-neutral-400" aria-hidden="true" />
            Offline is the narrowest right
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Where it is permitted at all, offline review is limited to managed
            devices with encrypted storage and a time-bound token — and is never
            enabled on a shared room device.
          </p>
        </article>

        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
            <FiVideo size={16} className="text-neutral-400" aria-hidden="true" />
            Recording follows the paper
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            A session that has a TOP SECRET paper on the agenda cannot be
            recorded, whatever the room is configured to do.
          </p>
        </article>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-bold">Documents whose rights disagree with their label</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Stored handling flags are compared against the rule for the document&apos;s
            classification. A disagreement means the label was changed and
            something did not follow — the rule wins on the next access decision.
          </p>
        </div>

        {drift.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Every document is held on the rights its classification allows.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Document</Th>
                <Th>Classification</Th>
                <Th>Disagreement</Th>
              </tr>
            </thead>
            <tbody>
              {drift.map((doc) => {
                const rule = handlingRule(doc.classification);
                const issues: string[] = [];
                if (rule.download === "Blocked" && doc.downloadable) {
                  issues.push("marked downloadable where the rule blocks download");
                }
                if (rule.print === "Blocked" && doc.printable) {
                  issues.push("marked printable where the rule blocks print");
                }
                if (rule.watermark && !doc.watermarked) {
                  issues.push("not watermarked where the rule requires it");
                }

                return (
                  <tr key={doc.id}>
                    <Td>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {doc.title}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {doc.id} · {doc.ministry}
                      </span>
                    </Td>
                    <Td>
                      <span className={`stamp ${classificationTone(doc.classification)}`}>
                        {doc.classification}
                      </span>
                    </Td>
                    <Td>
                      <span style={{ color: "var(--viz-warning)" }}>
                        {issues.join("; ")}
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}
