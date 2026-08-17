"use client";

import { FiGitBranch, FiLock, FiRepeat, FiArrowDown } from "react-icons/fi";
import { OPERATOR } from "@/core/app-constants";
import { useAppSelector } from "@/core/hook";
import { selectSubmissions } from "@/core/slices/submissions-slice";
import {
  CLEARANCE_PATHS,
  FINANCIAL_THRESHOLD_MWK,
} from "@/data/submissionClearance";
import type { StageMode } from "@/models/response/base-response";
import { money } from "../../../components/subStatus";

const MODE_ICON: Record<StageMode, typeof FiArrowDown> = {
  Sequential: FiArrowDown,
  Parallel: FiRepeat,
  Conditional: FiGitBranch,
};

const MODE_NOTE: Record<StageMode, string> = {
  Sequential: "Waits for everything before it",
  Parallel: "Runs alongside its neighbours",
  Conditional: "Applies only when its condition holds",
};

export default function PathCatalogue() {
  const submissions = useAppSelector(selectSubmissions);

  return (
    <div className="space-y-8">
      <p className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
        <FiLock size={14} className="shrink-0 text-neutral-400" aria-hidden="true" />
        Configuration is read-only in this build. You are signed in as{" "}
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {OPERATOR.role}
        </span>
        — editing a path will be gated on that role once roles come from the
        session.
      </p>

      <div className="grid gap-4 xl:grid-cols-2">
        {CLEARANCE_PATHS.map((path) => {
          const mandatory = path.stages.filter((s) => s.mandatory).length;
          const total = path.stages.reduce((sum, s) => sum + s.serviceHours, 0);

          return (
            <article
              key={path.id}
              className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <header className="border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {path.id}
                </p>
                <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                  {path.name}
                </h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {path.appliesWhen}
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                  {path.stages.length} stages · {mandatory} mandatory · {total}h end to
                  end
                </p>
              </header>

              <ol className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {path.stages.map((stage, index) => {
                  const Icon = MODE_ICON[stage.mode];
                  return (
                    <li key={stage.stage} className="flex items-start gap-3 px-5 py-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-state-600/10 font-mono text-[10px] font-semibold text-state-700 dark:bg-state-900/40 dark:text-state-400">
                        {index + 1}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {stage.stage}
                          </span>
                          {!stage.mandatory && (
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                              optional
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                          {stage.actorRole} · {stage.serviceHours}h service time
                        </span>
                        {stage.condition && (
                          <span className="mt-1 block text-xs text-neutral-600 dark:text-neutral-300">
                            {stage.condition}
                          </span>
                        )}
                      </span>

                      <span className="flex shrink-0 items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                        <Icon size={13} aria-hidden="true" />
                        {stage.mode}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </article>
          );
        })}
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
            Stage modes
          </h2>
          <ul className="mt-3 space-y-3">
            {(Object.keys(MODE_NOTE) as StageMode[]).map((mode) => {
              const Icon = MODE_ICON[mode];
              return (
                <li key={mode} className="flex items-start gap-2.5">
                  <Icon
                    size={15}
                    className="mt-0.5 shrink-0 text-neutral-400"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {mode}
                    </span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                      {MODE_NOTE[mode]}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
            Conditions in force
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            The attribute tests that decide whether a conditional stage applies to
            a given paper.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-baseline justify-between gap-3">
              <span className="text-neutral-700 dark:text-neutral-300">
                Financial clearance threshold
              </span>
              <span className="font-mono text-neutral-900 dark:text-neutral-100">
                {money(FINANCIAL_THRESHOLD_MWK)}
              </span>
            </li>
            <li className="flex items-baseline justify-between gap-3">
              <span className="text-neutral-700 dark:text-neutral-300">
                Papers currently above it
              </span>
              <span className="font-mono text-neutral-900 dark:text-neutral-100">
                {
                  submissions.filter(
                    (s) => s.metadata.financialAmountMwk >= FINANCIAL_THRESHOLD_MWK,
                  ).length
                }
              </span>
            </li>
            <li className="flex items-baseline justify-between gap-3">
              <span className="text-neutral-700 dark:text-neutral-300">
                Emergency path in use
              </span>
              <span className="font-mono text-neutral-900 dark:text-neutral-100">
                {submissions.filter((s) => s.templateId === "TPL-EMERGENCY").length}
              </span>
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}
