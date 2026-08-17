"use client";

import { useMemo } from "react";
import { ATTENDANCE_MODES } from "@/data/meetingTypes";
import type { AttendanceMode, Meeting } from "@/models/response/base-response";

/**
 * FR-MTG-13 — physical presence, video participation and apologies across the
 * register. "Not recorded" is the absence of an answer rather than a fourth
 * kind of attendance, so it wears the neutral track instead of a series colour.
 */
const FILL: Record<AttendanceMode, string> = {
  Physical: "var(--viz-1)",
  Video: "var(--viz-2)",
  Apology: "var(--viz-3)",
  "Not recorded": "var(--viz-grid)",
};

export default function AttendanceMeter({ meetings }: { meetings: Meeting[] }) {
  const { counts, total } = useMemo(() => {
    const counts = Object.fromEntries(
      ATTENDANCE_MODES.map((mode) => [mode, 0]),
    ) as Record<AttendanceMode, number>;

    for (const meeting of meetings) {
      for (const participant of meeting.participants) {
        counts[participant.attendance] += 1;
      }
    }

    return {
      counts,
      total: Object.values(counts).reduce((sum, n) => sum + n, 0),
    };
  }, [meetings]);

  const recorded = total - counts["Not recorded"];

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
          Attendance recorded
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          {recorded} of {total} seats
        </p>
      </header>

      {total === 0 ? (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          No participant has been named on a sitting yet.
        </p>
      ) : (
        <>
          <div
            className="mt-4 flex h-3 gap-[2px] overflow-hidden rounded-full"
            role="img"
            aria-label={ATTENDANCE_MODES.map(
              (mode) => `${mode}: ${counts[mode]}`,
            ).join(", ")}
          >
            {ATTENDANCE_MODES.filter((mode) => counts[mode] > 0).map((mode) => (
              <span
                key={mode}
                style={{
                  background: FILL[mode],
                  width: `${(counts[mode] / total) * 100}%`,
                }}
              />
            ))}
          </div>

          <ul className="mt-4 space-y-2">
            {ATTENDANCE_MODES.map((mode) => (
              <li
                key={mode}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px] border border-neutral-200 dark:border-neutral-700"
                    style={{ background: FILL[mode] }}
                    aria-hidden="true"
                  />
                  {mode}
                </span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">
                  {counts[mode]}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
