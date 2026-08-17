"use client";

import { FiAlertTriangle, FiEye, FiUsers } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { Kpi, StatusBadge } from "@/common/ui";
import { selectPersonalData } from "@/core/slices/governance-slice";

/**
 * FR-DAT-07 — Release 2. Identification and reporting of personal information
 * held within Cabinet records. The count that matters is data subjects rather
 * than records: one annexe listing three million beneficiaries is a bigger data
 * protection question than a hundred attendance lists.
 */
export default function PersonalDataBoard() {
  const findings = selectPersonalData();

  const subjects = findings.reduce((sum, f) => sum + f.subjects, 0);
  const unconfirmed = findings.filter((f) => !f.confirmed);

  return (
    <div className="space-y-6">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-warning)" }}
      >
        <FiAlertTriangle
          size={18}
          className="mt-0.5 shrink-0"
          style={{ color: "var(--viz-warning)" }}
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            Release 2 — identification, not decision
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            This screen says where personal information sits and how many people
            it concerns. It does not decide what to do about it: a subject access
            request, a correction or an erasure is a legal act with its own
            authority, and a Cabinet record under retention is rarely erasable at
            all. What the platform owes is an accurate answer to "what do you
            hold about me".
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Records with findings" value={findings.length} hint="Across the register" />
        <Kpi
          label="Data subjects touched"
          value={subjects.toLocaleString()}
          hint="Distinct people, not records"
        />
        <Kpi
          label="Awaiting confirmation"
          value={unconfirmed.length}
          hint="Automated findings a person has not yet checked"
          tone={unconfirmed.length > 0 ? "amber" : "green"}
        />
      </div>

      {findings.map((finding) => (
        <article
          key={finding.id}
          className="rounded-lg border bg-white dark:bg-neutral-900"
          style={{
            borderColor: finding.confirmed ? "var(--viz-grid)" : "var(--viz-warning)",
          }}
        >
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {finding.id} · {finding.recordId} · detected {finding.detectedAt}
              </p>
              <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                {finding.recordTitle}
              </h2>
            </div>
            <StatusBadge tone={finding.confirmed ? "green" : "amber"}>
              {finding.confirmed ? "Confirmed" : "Not yet confirmed"}
            </StatusBadge>
          </header>

          <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
            <div className="space-y-0.5">
              <DetailRow label="What is held" value={finding.category} />
              <DetailRow
                label="Data subjects"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <FiUsers size={12} className="text-neutral-400" aria-hidden="true" />
                    {finding.subjects.toLocaleString()}
                  </span>
                }
              />
            </div>
            <div className="space-y-0.5">
              <DetailRow label="Lawful basis" value={finding.basis} />
              <DetailRow
                label="Confirmation"
                value={
                  finding.confirmed ? (
                    "Checked by an officer"
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5"
                      style={{ color: "var(--viz-warning)" }}
                    >
                      <FiEye size={12} aria-hidden="true" />
                      Recovered by optical character recognition — needs a person
                    </span>
                  )
                }
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
