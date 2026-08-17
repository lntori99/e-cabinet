"use client";

import { FiAlertTriangle, FiArrowRight, FiCheck, FiSlash } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectTemplates } from "@/core/slices/notification-slice";
import { CONTENT_RULES } from "@/data/notifications";
import {
  TRIGGER_REQUIREMENT,
  checkTemplate,
} from "../../components/notificationStatus";

/**
 * FR-NOT-06 and FR-NOT-07 are enforced at template level, which is why they are
 * checkable at all: there is one place a message body can come from, and it is
 * this list. Each body is run against the content rules on render rather than
 * carrying a flag somebody set once.
 */
export default function TemplateBoard() {
  const templates = useAppSelector(selectTemplates);

  return (
    <div className="space-y-6">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <FiSlash size={18} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            There is no field for an attachment
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-NOT-07 is not a rule the sending code obeys — a template has a
            subject, a body and a link, and nowhere to put a file. The material
            stays inside the platform and the recipient is sent to it.
          </p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {CONTENT_RULES.map((rule) => (
              <li
                key={rule}
                className="inline-flex items-start gap-1.5 text-xs text-neutral-600 dark:text-neutral-400"
              >
                <FiCheck
                  size={11}
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--viz-good)" }}
                  aria-hidden="true"
                />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {templates.map((template) => {
        const checks = checkTemplate(template.subject, template.body);
        const failures = checks.filter((c) => !c.passes);

        return (
          <article
            key={template.id}
            className="rounded-lg border bg-white dark:bg-neutral-900"
            style={{
              borderColor:
                failures.length > 0 ? "var(--viz-critical)" : "var(--viz-grid)",
            }}
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {template.id} · {TRIGGER_REQUIREMENT[template.trigger]}
                </p>
                <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                  {template.trigger}
                </h2>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <StatusBadge tone="neutral">{template.channel}</StatusBadge>
                <StatusBadge tone={failures.length > 0 ? "red" : "green"}>
                  {failures.length > 0 ? "Fails the check" : "Passes the check"}
                </StatusBadge>
              </div>
            </header>

            <div className="px-5 py-4">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Subject
                </p>
                <p className="mt-1 font-medium text-neutral-900 dark:text-neutral-100">
                  {template.subject}
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Body
                </p>
                <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                  {template.body}
                </p>
                <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-state-300 px-3 py-1.5 text-sm text-state-700 dark:border-state-700 dark:text-state-400">
                  {template.linkLabel}
                  <FiArrowRight size={13} aria-hidden="true" />
                </p>
                <p className="mt-2 font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                  {template.deepLink}
                </p>
              </div>

              <div className="mt-4 grid gap-x-6 lg:grid-cols-2">
                <div className="space-y-0.5">
                  <DetailRow label="Channel" value={template.channel} />
                  <DetailRow label="Reviewed by" value={template.reviewedBy} />
                </div>
                <div className="space-y-0.5">
                  <DetailRow label="Reviewed" value={template.reviewedAt} />
                  <DetailRow
                    label="Carries an attachment"
                    value={
                      <span
                        className="inline-flex items-center gap-1.5"
                        style={{ color: "var(--viz-good)" }}
                      >
                        <FiSlash size={12} aria-hidden="true" />
                        No — the record has no field for one
                      </span>
                    }
                  />
                </div>
              </div>
            </div>

            {failures.length > 0 && (
              <div
                className="border-t px-5 py-3"
                style={{ borderColor: "var(--viz-critical)" }}
              >
                <ul className="space-y-1.5">
                  {failures.map((check) => (
                    <li
                      key={check.rule}
                      className="inline-flex items-start gap-2 text-sm"
                      style={{ color: "var(--viz-critical)" }}
                    >
                      <FiAlertTriangle
                        size={13}
                        className="mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      {check.rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
