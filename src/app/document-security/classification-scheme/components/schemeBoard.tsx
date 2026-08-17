"use client";

import { FiAlertTriangle, FiCheckCircle, FiShield } from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { classificationTone } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectDocuments } from "@/core/slices/documents-slice";
import {
  CLASSIFICATION_DEFAULTS,
  handlingRule,
} from "@/data/documentSecurity";
import {
  CLASSIFICATION_ORDER,
  CLASSIFICATION_STEP,
} from "../../components/docStatus";

export default function SchemeBoard() {
  const documents = useAppSelector(selectDocuments);
  const unclassified = documents.filter((d) => !d.classification);

  return (
    <div className="space-y-8">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{
          borderColor:
            unclassified.length === 0 ? "var(--viz-good)" : "var(--viz-critical)",
        }}
      >
        {unclassified.length === 0 ? (
          <FiCheckCircle
            size={18}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-good)" }}
            aria-hidden="true"
          />
        ) : (
          <FiAlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-critical)" }}
            aria-hidden="true"
          />
        )}
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {unclassified.length === 0
              ? `All ${documents.length} documents carry a classification`
              : `${unclassified.length} documents have no classification`}
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-DOC-01 — the platform does not permit an unclassified document to
            exist. A paper without a label cannot be saved, submitted or packed;
            there is no &ldquo;classify later&rdquo; state.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-bold">The labels</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Strongest first. The scale is an order, not a set of names — every
            handling rule downstream depends on where a label sits in it.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {CLASSIFICATION_ORDER.map((label, index) => {
            const rule = handlingRule(label);
            const held = documents.filter((d) => d.classification === label).length;

            return (
              <article
                key={label}
                className="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div
                  className="h-1.5 w-full"
                  style={{ background: CLASSIFICATION_STEP[label] }}
                  aria-hidden="true"
                />
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className={`stamp ${classificationTone(label)}`}>
                      <FiShield size={10} />
                      {label}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      Level {CLASSIFICATION_ORDER.length - index}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
                    {rule.whoMayView}
                  </p>

                  <div className="mt-3 space-y-0.5">
                    <DetailRow label="Documents held" value={held} />
                    <DetailRow
                      label="Access after the sitting"
                      value={
                        rule.retentionDays === 0
                          ? "Ends at meeting end"
                          : `${rule.retentionDays} days`
                      }
                    />
                    <DetailRow
                      label="Watermark"
                      value={rule.watermark ? "Applied" : "Not applied"}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-bold">Defaults by meeting type</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            The label a paper is created with. A submitter may raise it at
            submission; lowering it is a reclassification and takes a decision.
          </p>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Meeting type</Th>
              <Th>Default classification</Th>
              <Th>Effect on the pack</Th>
            </tr>
          </thead>
          <tbody>
            {CLASSIFICATION_DEFAULTS.map((row) => (
              <tr key={row.meetingType}>
                <Td>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {row.meetingType}
                  </span>
                </Td>
                <Td>
                  <span className={`stamp ${classificationTone(row.classification)}`}>
                    {row.classification}
                  </span>
                </Td>
                <Td>
                  The pack inherits the highest classification it contains, so one
                  paper at this level lifts the whole pack to it.
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </div>
  );
}
