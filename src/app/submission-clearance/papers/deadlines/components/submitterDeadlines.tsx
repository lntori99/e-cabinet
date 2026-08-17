"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FiAlertTriangle, FiCheckCircle, FiClock, FiLock } from "react-icons/fi";
import { distance, hoursUntil, stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectMeetings } from "@/core/slices/meetings-slice";
import { selectMinistrySubmissions } from "@/core/slices/submissions-slice";
import { SUBMISSION_TONE, SUBMITTER } from "../../../components/subStatus";

export default function SubmitterDeadlines({ now }: { now: string }) {
  const meetings = useAppSelector(selectMeetings);
  const selector = useMemo(() => selectMinistrySubmissions(SUBMITTER.ministry), []);
  const mine = useAppSelector(selector);

  const open = meetings
    .filter((m) => m.status !== "Concluded" && m.status !== "Cancelled")
    .sort((a, b) => a.submissionDeadline.localeCompare(b.submissionDeadline));

  return (
    <div className="space-y-4">
      {open.map((meeting) => {
        const left = hoursUntil(meeting.submissionDeadline, now);
        const closed = left <= 0;
        const papers = mine.filter((s) => s.metadata.meetingId === meeting.id);
        const late = papers.filter((s) => s.late);

        return (
          <section
            key={meeting.id}
            className="rounded-lg border bg-white dark:bg-neutral-900"
            style={{
              borderColor: closed
                ? undefined
                : left <= 72
                  ? "var(--viz-warning)"
                  : undefined,
            }}
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {meeting.id} · sits {meeting.date}
                </p>
                <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                  {meeting.title}
                </h2>
              </div>

              <span className="flex items-center gap-2 text-sm font-medium">
                {closed ? (
                  <>
                    <FiLock
                      size={14}
                      style={{ color: "var(--viz-axis)" }}
                      aria-hidden="true"
                    />
                    Closed {distance(left)}
                  </>
                ) : (
                  <>
                    <FiClock
                      size={14}
                      style={{
                        color: left <= 72 ? "var(--viz-warning)" : "var(--viz-good)",
                      }}
                      aria-hidden="true"
                    />
                    Closes {distance(left)}
                  </>
                )}
              </span>
            </header>

            <div className="px-5 py-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Cut-off {stamp(meeting.submissionDeadline)}.{" "}
                {papers.length === 0
                  ? "Your ministry has nothing in against this sitting."
                  : `${papers.length} paper${papers.length === 1 ? "" : "s"} from ${SUBMITTER.ministry}.`}
              </p>

              {late.length > 0 && (
                <p
                  className="mt-2 flex items-center gap-2 text-sm"
                  style={{ color: "var(--viz-warning)" }}
                >
                  <FiAlertTriangle size={14} aria-hidden="true" />
                  {late.length} flagged late — waiting on Secretariat authorisation.
                </p>
              )}

              {papers.length > 0 && (
                <ul className="mt-3 divide-y divide-neutral-100 dark:divide-neutral-800">
                  {papers.map((paper) => (
                    <li
                      key={paper.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-2.5"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {paper.title}
                        </span>
                        <span className="block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                          {paper.id}
                          {paper.submittedAt
                            ? ` · submitted ${stamp(paper.submittedAt)}`
                            : " · not yet submitted"}
                        </span>
                      </span>
                      <StatusBadge tone={SUBMISSION_TONE[paper.status]}>
                        {paper.status}
                      </StatusBadge>
                    </li>
                  ))}
                </ul>
              )}

              {!closed && (
                <Link
                  href="/submission-clearance/papers/new-submission"
                  className="mt-4 inline-block text-sm font-medium text-state-700 hover:underline dark:text-state-400"
                >
                  Submit a paper for this sitting →
                </Link>
              )}
            </div>
          </section>
        );
      })}

      {open.length === 0 && (
        <p className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
          <FiCheckCircle
            size={15}
            style={{ color: "var(--viz-good)" }}
            aria-hidden="true"
          />
          No sitting is currently taking papers.
        </p>
      )}
    </div>
  );
}
