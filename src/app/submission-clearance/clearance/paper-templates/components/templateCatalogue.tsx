"use client";

import { FiCheck, FiFileText, FiLock } from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { OPERATOR } from "@/core/app-constants";
import { useAppSelector } from "@/core/hook";
import { selectSubmissions } from "@/core/slices/submissions-slice";
import { PAPER_TEMPLATES } from "@/data/submissionClearance";

export default function TemplateCatalogue() {
  const submissions = useAppSelector(selectSubmissions);

  const refused = submissions.filter((s) => s.templateIssues.length > 0);

  return (
    <div className="space-y-8">
      <p className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
        <FiLock size={14} className="shrink-0 text-neutral-400" aria-hidden="true" />
        Configuration is read-only in this build. You are signed in as{" "}
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {OPERATOR.role}
        </span>
        — publishing a new template version will be gated on that role once roles
        come from the session.
      </p>

      <div className="grid gap-4 xl:grid-cols-2">
        {PAPER_TEMPLATES.map((template) => {
          const inUse = submissions.filter((s) => s.templateId === template.id).length;

          return (
            <article
              key={template.id}
              className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {template.id} · v{template.version}
                  </p>
                  <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                    {template.name}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {template.appliesTo}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                  <FiFileText size={11} aria-hidden="true" />
                  {inUse} in use
                </span>
              </header>

              <div className="px-5 py-4">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                  Required sections
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {template.requiredSections.map((section) => (
                    <li
                      key={section}
                      className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                    >
                      <FiCheck
                        size={13}
                        className="mt-1 shrink-0"
                        style={{ color: "var(--viz-good)" }}
                        aria-hidden="true"
                      />
                      {section}
                    </li>
                  ))}
                </ul>

                <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                  Maximum {template.maxPages} pages · last updated{" "}
                  {template.updatedAt}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="font-bold">Papers held for non-conformance</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Drafts that would be refused as they stand. The submitter sees the same
            list on their own screen, so nobody is guessing what is missing.
          </p>
        </div>

        {refused.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Nothing on the register fails its template.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Paper</Th>
                <Th>Ministry</Th>
                <Th>What would refuse it</Th>
              </tr>
            </thead>
            <tbody>
              {refused.map((submission) => (
                <tr key={submission.id}>
                  <Td>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {submission.title}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {submission.id}
                    </span>
                  </Td>
                  <Td>{submission.metadata.originatingMinistry}</Td>
                  <Td>
                    <ul className="space-y-1">
                      {submission.templateIssues.map((issue) => (
                        <li key={issue} style={{ color: "var(--viz-critical)" }}>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}
