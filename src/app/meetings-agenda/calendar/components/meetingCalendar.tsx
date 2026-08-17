"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiRepeat } from "react-icons/fi";
import { StatusBadge } from "@/common/ui";
import { btnGhost } from "@/common/field";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectMeetings, selected, submissionsClosed } from "@/core/slices/meetings-slice";
import type { Meeting } from "@/models/response/base-response";
import { STATUS_TONE } from "../../components/meetingStatus";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Local-date key, avoiding the UTC shift that toISOString would introduce. */
function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Monday-first offset for the 1st of the month. */
function leadingBlanks(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

/**
 * Month view of the sittings register. Cancelled meetings stay visible so a
 * gap in the calendar is never silently a meeting that was called off.
 */
export default function MeetingCalendar({ today }: { today: string }) {
  const dispatch = useAppDispatch();
  const meetings = useAppSelector(selectMeetings);

  const [year, month] = useMemo(() => {
    const [y, m] = today.split("-").map(Number);
    return [y, m - 1];
  }, [today]);

  const [view, setView] = useState({ year, month });

  const byDate = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const m of meetings) {
      const list = map.get(m.date) ?? [];
      list.push(m);
      map.set(m.date, list);
    }
    return map;
  }, [meetings]);

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const blanks = leadingBlanks(view.year, view.month);
  const cells: (number | null)[] = [
    ...Array<null>(blanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function shift(by: number) {
    setView(({ year: y, month: m }) => {
      const next = m + by;
      if (next < 0) return { year: y - 1, month: 11 };
      if (next > 11) return { year: y + 1, month: 0 };
      return { year: y, month: next };
    });
  }

  const monthMeetings = meetings
    .filter((m) => m.date.startsWith(`${view.year}-${String(view.month + 1).padStart(2, "0")}`))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          {MONTHS[view.month]} {view.year}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shift(-1)}
            className="rounded-lg border border-neutral-300 p-2 text-neutral-600 transition hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
          >
            <FiChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => setView({ year, month })}
            className={`${btnGhost} px-3 py-1.5 text-xs`}
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shift(1)}
            className="rounded-lg border border-neutral-300 p-2 text-neutral-600 transition hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
          >
            <FiChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px] overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
          <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="px-2 py-2 text-center font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const key = day ? dateKey(view.year, view.month, day) : `blank-${i}`;
              const dayMeetings = day ? (byDate.get(key) ?? []) : [];
              const isToday = key === today;
              return (
                <div
                  key={key}
                  className={`min-h-[104px] border-b border-r border-neutral-100 p-1.5 last:border-r-0 dark:border-neutral-800 ${
                    day ? "" : "bg-neutral-50/60 dark:bg-neutral-900/40"
                  }`}
                >
                  {day && (
                    <>
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                          isToday
                            ? "bg-state-600 font-bold text-white"
                            : "text-neutral-500 dark:text-neutral-400"
                        }`}
                      >
                        {day}
                      </span>
                      <ul className="mt-1 space-y-1">
                        {dayMeetings.map((m) => (
                          <li key={m.id}>
                            <Link
                              href="/meetings-agenda/all-meetings"
                              onClick={() => dispatch(selected(m.id))}
                              className={`block rounded border-l-2 px-1.5 py-1 text-[11px] leading-tight transition hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                                m.status === "Cancelled"
                                  ? "border-seal-500 text-neutral-400 line-through"
                                  : "border-state-500 text-neutral-700 dark:text-neutral-300"
                              }`}
                            >
                              <span className="block font-medium">{m.time}</span>
                              <span className="block truncate">{m.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section>
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          Sittings this month
        </h3>
        {monthMeetings.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            No sittings scheduled in {MONTHS[view.month]}.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {monthMeetings.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <Link
                    href="/meetings-agenda/all-meetings"
                    onClick={() => dispatch(selected(m.id))}
                    className="font-medium text-neutral-900 hover:text-state-700 dark:text-neutral-100 dark:hover:text-state-400"
                  >
                    {m.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {m.date} · {m.time} · {Math.round(m.durationMinutes / 60)}h ·{" "}
                    {m.venue}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {m.recurrence !== "None" && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                      <FiRepeat size={10} /> {m.recurrence}
                    </span>
                  )}
                  {submissionsClosed(m, today) && (
                    <StatusBadge tone="amber">Submissions closed</StatusBadge>
                  )}
                  <StatusBadge tone={STATUS_TONE[m.status]}>{m.status}</StatusBadge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
