"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FiAlertTriangle, FiCheckCircle, FiClock, FiLock } from "react-icons/fi";
import { LuCalendarCheck } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectMeetings, selected } from "@/core/slices/meetings-slice";
import { agendaItemTypeRule } from "@/data/meetingTypes";
import {
  deadlineRow,
  distance,
  isActive,
  type DeadlineRow,
  type DeadlineState,
} from "../../components/meetingStatus";
import { Table, Td, Th } from "@/common/table";

/** Status is state, not identity — each one ships with its own icon and word. */
const STATE_UI: Record<
  DeadlineState,
  { icon: typeof FiClock; color: string; note: string }
> = {
  Open: {
    icon: FiCheckCircle,
    color: "var(--viz-good)",
    note: "Ministries can still submit",
  },
  Closing: {
    icon: FiClock,
    color: "var(--viz-warning)",
    note: "Under three days left",
  },
  Closed: {
    icon: FiLock,
    color: "var(--viz-axis)",
    note: "Window shut — no further submissions",
  },
};

function StateCell({ row }: { row: DeadlineRow }) {
  const ui = STATE_UI[row.state];
  const Icon = row.breached ? FiAlertTriangle : ui.icon;
  const color = row.breached ? "var(--viz-critical)" : ui.color;

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap font-medium">
      <Icon size={14} style={{ color }} aria-hidden="true" />
      {row.breached ? "Breached" : row.state}
    </span>
  );
}

export default function DeadlineBoard({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const meetings = useAppSelector(selectMeetings);

  const rows = useMemo(
    () =>
      meetings
        .filter(isActive)
        .map((m) =>
          deadlineRow(m, now, (item) => agendaItemTypeRule(item.type).requiresPaper),
        )
        .sort((a, b) => a.hoursLeft - b.hoursLeft),
    [meetings, now],
  );

  const tally = {
    Breached: rows.filter((r) => r.breached).length,
    Closed: rows.filter((r) => r.state === "Closed" && !r.breached).length,
    Closing: rows.filter((r) => r.state === "Closing").length,
    Open: rows.filter((r) => r.state === "Open").length,
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuCalendarCheck}
          title="No open submission windows"
          description="Every sitting on the register has concluded or been called off. A window appears here as soon as a new meeting is created."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Breached", "var(--viz-critical)", FiAlertTriangle],
            ["Closed", "var(--viz-axis)", FiLock],
            ["Closing", "var(--viz-warning)", FiClock],
            ["Open", "var(--viz-good)", FiCheckCircle],
          ] as const
        ).map(([label, color, Icon]) => (
          <div
            key={label}
            className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              <Icon size={13} style={{ color }} aria-hidden="true" />
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {tally[label]}
            </p>
          </div>
        ))}
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Sitting</Th>
            <Th>Submission deadline</Th>
            <Th>Window</Th>
            <Th align="right">Papers expected</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const m = row.meeting;
            const expecting = m.agenda.filter(
              (i) => agendaItemTypeRule(i.type).requiresPaper,
            ).length;
            const received = expecting - row.missingPapers;

            return (
              <tr
                key={m.id}
                className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
              >
                <Td>
                  <Link
                    href="/meetings-agenda/all-meetings"
                    onClick={() => dispatch(selected(m.id))}
                    className="font-semibold text-neutral-900 hover:text-state-700 dark:text-neutral-100 dark:hover:text-state-400"
                  >
                    {m.title}
                  </Link>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {m.id} · sits {m.date}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono">
                    {m.submissionDeadline.replace("T", " ")}
                  </span>
                </Td>
                <Td>
                  <span className="whitespace-nowrap">
                    {distance(row.hoursLeft)}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {row.breached
                      ? `${row.missingPapers} item${row.missingPapers === 1 ? "" : "s"} never arrived`
                      : STATE_UI[row.state].note}
                  </span>
                </Td>
                <Td align="right">
                  <span className="font-mono">
                    {received} / {expecting}
                  </span>
                  {expecting === 0 && (
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      No papers expected
                    </span>
                  )}
                </Td>
                <Td>
                  <div className="space-y-1.5">
                    <StateCell row={row} />
                    <StatusBadge tone={row.breached ? "red" : "neutral"}>
                      {m.status}
                    </StatusBadge>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        A sitting counts as breached when its window has shut while agenda items
        that expect a paper — policy papers and decision items — still have none
        attached. Oral, information and standing items are not counted against it.
      </p>
    </div>
  );
}
