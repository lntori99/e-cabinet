"use client";

import { useState } from "react";
import { FiCheckCircle, FiEdit3, FiFileText, FiCalendar } from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectEntitlementReports } from "@/core/slices/identity-slice";
import { selectUsers } from "@/core/slices/users-slice";
import { recordReview } from "@/core/thunks-identity";
import { rolePermissions } from "@/data/identityAccess";
import { REVIEW_TONE, userById } from "../../components/iamStatus";

export default function AccessReviewBoard() {
  const dispatch = useAppDispatch();
  const reports = useAppSelector(selectEntitlementReports);
  const users = useAppSelector(selectUsers);
  const [openId, setOpenId] = useState(reports[0]?.userId ?? "");

  const cycle = reports[0]?.cycle ?? "—";
  const attested = reports.filter((r) => r.reviewStatus === "Attested").length;
  const outstanding = reports.length - attested;
  const open = reports.find((r) => r.userId === openId) ?? null;
  const openUser = open ? userById(users, open.userId) : undefined;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
            <FiCalendar size={16} className="text-neutral-400" aria-hidden="true" />
            {cycle} review cycle
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            {attested} of {reports.length} attested
          </p>
        </header>

        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
          role="img"
          aria-label={`${attested} of ${reports.length} reports attested`}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${(attested / Math.max(reports.length, 1)) * 100}%`,
              background: "var(--viz-good)",
            }}
          />
        </div>

        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {outstanding === 0
            ? "Every report in this cycle has been attested."
            : `${outstanding} report${outstanding === 1 ? "" : "s"} still need a reviewer's decision before the cycle can close.`}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Entitlement reports</h2>

        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th align="right">Meetings</Th>
              <Th align="right">Documents</Th>
              <Th>Review</Th>
              <Th align="right">Report</Th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const user = userById(users, report.userId);
              return (
                <tr
                  key={report.userId}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  <Td>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {user?.name ?? report.userId}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {user?.role ?? "Unknown role"} · {report.userId}
                    </span>
                  </Td>
                  <Td align="right">
                    <span className="font-mono">{report.meetings.length}</span>
                  </Td>
                  <Td align="right">
                    <span className="font-mono">{report.documentCount}</span>
                  </Td>
                  <Td>
                    <StatusBadge tone={REVIEW_TONE[report.reviewStatus]}>
                      {report.reviewStatus}
                    </StatusBadge>
                    {report.reviewer && (
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        {report.reviewer}
                        {report.reviewedAt ? ` · ${stamp(report.reviewedAt)}` : ""}
                      </span>
                    )}
                  </Td>
                  <Td align="right">
                    <button
                      type="button"
                      onClick={() => setOpenId(report.userId)}
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
                    >
                      <FiFileText size={14} aria-hidden="true" />
                      Open
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </section>

      {open && openUser && (
        <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                Entitlement report · {open.cycle} · generated {stamp(open.generatedAt)}
              </p>
              <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {openUser.name}
              </h2>
            </div>
            <StatusBadge tone={REVIEW_TONE[open.reviewStatus]}>
              {open.reviewStatus}
            </StatusBadge>
          </header>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div className="space-y-0.5">
              <DetailRow label="Role group" value={openUser.role} />
              <DetailRow label="Ministry" value={openUser.ministry} />
              <DetailRow
                label="Classification ceiling"
                value={rolePermissions(openUser.role).classificationCeiling}
              />
              <DetailRow label="Documents reachable" value={open.documentCount} />
              <DetailRow label="Account status" value={openUser.status} />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                  Meetings reachable
                </h3>
                {open.meetings.length === 0 ? (
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    None. This account administers the platform without reaching
                    Cabinet business.
                  </p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {open.meetings.map((meeting) => (
                      <li
                        key={meeting}
                        className="rounded-full bg-neutral-100 px-2.5 py-1 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      >
                        {meeting}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                  Functions
                </h3>
                <ul className="mt-2 space-y-1">
                  {open.functions.map((fn) => (
                    <li
                      key={fn}
                      className="text-sm text-neutral-700 dark:text-neutral-300"
                    >
                      {fn}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <button
              type="button"
              onClick={() =>
                dispatch(
                  recordReview({
                    userId: open.userId,
                    name: openUser.name,
                    status: "Attested",
                  }),
                )
              }
              className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700"
            >
              <FiCheckCircle size={15} aria-hidden="true" />
              Attest as correct
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch(
                  recordReview({
                    userId: open.userId,
                    name: openUser.name,
                    status: "Changes requested",
                  }),
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              <FiEdit3 size={15} aria-hidden="true" />
              Request changes
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
