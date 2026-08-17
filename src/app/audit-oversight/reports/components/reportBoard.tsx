"use client";

import { FiBarChart2, FiDownload, FiPlay } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectAuditLog, selectReports } from "@/core/slices/oversight-slice";
import { classifyAction } from "@/data/audit";
import { takeExport } from "@/core/thunks-oversight";

/**
 * FR-AUD-09 — the five reports the requirement names. The row count beside each
 * is computed from the log rather than stored, so a report that would come back
 * empty says so before somebody runs it and concludes the system is broken.
 */
export default function ReportBoard() {
  const dispatch = useAppDispatch();
  const reports = selectReports();
  const log = useAppSelector(selectAuditLog);

  return (
    <div className="space-y-6">
      {reports.map((report) => {
        const rows = log.filter((e) => report.covers.includes(classifyAction(e.action)));

        return (
          <article
            key={report.id}
            className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {report.id} · {report.requirement}
                </p>
                <h2 className="mt-1 inline-flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                  <FiBarChart2 size={15} className="text-neutral-400" aria-hidden="true" />
                  {report.name}
                </h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {report.description}
                </p>
              </div>
              <StatusBadge tone={rows.length === 0 ? "amber" : "neutral"}>
                {rows.length === 0 ? "Would return nothing" : `${rows.length} rows now`}
              </StatusBadge>
            </header>

            <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
              <div className="space-y-0.5">
                <DetailRow label="Draws on" value={report.covers.join(", ")} />
                <DetailRow
                  label="Rows in the readable log"
                  value={`${rows.length}`}
                />
              </div>
              <div className="space-y-0.5">
                <DetailRow
                  label="Last run"
                  value={report.lastRunAt?.replace("T", " ") ?? "Never"}
                />
                <DetailRow
                  label="Returned then"
                  value={
                    report.lastRunRows === undefined
                      ? "—"
                      : `${report.lastRunRows.toLocaleString()} rows`
                  }
                />
              </div>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                A report reads the log. It cannot change it, and running one is
                itself an audited act.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
                >
                  <FiPlay size={14} aria-hidden="true" />
                  Run
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      takeExport(
                        report.name,
                        `Standing report — ${report.name}`,
                        rows.length,
                        "CSV",
                        "Office of the Chief Secretary",
                      ),
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800"
                >
                  <FiDownload size={14} aria-hidden="true" />
                  Export with attestation
                </button>
              </div>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
