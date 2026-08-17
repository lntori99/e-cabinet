"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiAlertTriangle, FiCheckCircle, FiEdit3 } from "react-icons/fi";
import { LuFilePlus2 } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { stamp } from "@/common/time";
import { useAppSelector } from "@/core/hook";
import { selectMinistrySubmissions } from "@/core/slices/submissions-slice";
import { paperTemplate } from "@/data/submissionClearance";
import PaperDetail from "../../../components/paperDetail";
import PaperList from "../../../components/paperList";
import { SUBMITTER } from "../../../components/subStatus";

export default function DraftsBoard({ now }: { now: string }) {
  const selector = useMemo(() => selectMinistrySubmissions(SUBMITTER.ministry), []);
  const mine = useAppSelector(selector);
  const drafts = mine.filter((s) => s.status === "Draft");

  const [selectedId, setSelectedId] = useState(drafts[0]?.id ?? "");
  const selected = drafts.find((s) => s.id === selectedId) ?? drafts[0] ?? null;

  if (drafts.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuFilePlus2}
          title="No drafts"
          description="Nothing is part-written. A paper stays here until it conforms to its template and every mandatory field is complete."
          actions={[]}
        />
      </div>
    );
  }

  const template = selected ? paperTemplate(selected.templateId) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          {drafts.length} draft{drafts.length === 1 ? "" : "s"}
        </p>
        <PaperList
          submissions={drafts}
          selectedId={selected?.id ?? ""}
          onSelect={setSelectedId}
          emptyMessage="No drafts."
        />
      </div>

      <div className="min-w-0 space-y-6">
        {selected && template && (
          <>
            <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
                  Template conformance
                </h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                  {template.name} v{template.version}
                </p>
              </header>

              {selected.templateIssues.length === 0 ? (
                <p
                  className="mt-3 flex items-start gap-2 text-sm"
                  style={{ color: "var(--viz-good)" }}
                >
                  <FiCheckCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-neutral-700 dark:text-neutral-300">
                    This draft conforms to its template and can be put forward.
                  </span>
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {selected.templateIssues.map((issue) => (
                    <li key={issue} className="flex items-start gap-2 text-sm">
                      <FiAlertTriangle
                        size={14}
                        className="mt-0.5 shrink-0"
                        style={{ color: "var(--viz-critical)" }}
                        aria-hidden="true"
                      />
                      <span className="text-neutral-700 dark:text-neutral-300">{issue}</span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                Last saved {stamp(selected.createdAt)} · deadline{" "}
                {stamp(selected.deadline)}
              </p>

              <Link
                href="/submission-clearance/papers/new-submission"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700"
              >
                <FiEdit3 size={15} aria-hidden="true" />
                Continue this draft
              </Link>
            </section>

            <PaperDetail submission={selected} now={now} />
          </>
        )}
      </div>
    </div>
  );
}
