"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { FiAlertTriangle, FiCheckCircle, FiClock, FiLock } from "react-icons/fi";
import { agendaItemTypeRule } from "@/data/meetingTypes";
import type { Meeting } from "@/models/response/base-response";
import { deadlineRow, distance, type DeadlineRow } from "../../components/meetingStatus";
import { Table, Td, Th } from "@/common/table";
import ChartFrame from "@/common/chartFrame";

interface Row {
  sitting: string;
  title: string;
  days: number;
  label: string;
  tone: string;
  state: string;
  deadline: string;
}

/** Status, not identity — reserved colours, and never the colour alone. */
const KEY = [
  { label: "Open", icon: FiCheckCircle, color: "var(--viz-good)" },
  { label: "Closing", icon: FiClock, color: "var(--viz-warning)" },
  { label: "Closed", icon: FiLock, color: "var(--viz-axis)" },
  { label: "Breached", icon: FiAlertTriangle, color: "var(--viz-critical)" },
];

function toRow(row: DeadlineRow): Row {
  const state = row.breached ? "Breached" : row.state;
  const tone =
    state === "Breached"
      ? "var(--viz-critical)"
      : state === "Closing"
        ? "var(--viz-warning)"
        : state === "Closed"
          ? "var(--viz-axis)"
          : "var(--viz-good)";

  return {
    sitting: row.meeting.id,
    title: row.meeting.title,
    days: Math.round((row.hoursLeft / 24) * 10) / 10,
    label: distance(row.hoursLeft),
    tone,
    state,
    deadline: row.meeting.submissionDeadline.replace("T", " "),
  };
}

function RunwayTooltip({ active, payload }: TooltipContentProps) {
  const row = payload?.[0]?.payload as Row | undefined;
  if (!active || !row) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
      <p className="font-medium text-neutral-900 dark:text-neutral-100">
        {row.title}
      </p>
      <p className="mt-1.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {row.label}
        </span>{" "}
        <span className="text-neutral-500 dark:text-neutral-400">· {row.state}</span>
      </p>
      <p className="mt-0.5 font-mono text-neutral-500 dark:text-neutral-400">
        {row.deadline}
      </p>
    </div>
  );
}

export default function RunwayChart({
  sittings,
  now,
}: {
  sittings: Meeting[];
  now: string;
}) {
  const rows = useMemo(
    () =>
      sittings
        .map((m) =>
          toRow(
            deadlineRow(m, now, (item) => agendaItemTypeRule(item.type).requiresPaper),
          ),
        )
        .sort((a, b) => a.days - b.days),
    [sittings, now],
  );

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Sitting</Th>
          <Th>Deadline</Th>
          <Th align="right">Days</Th>
          <Th>State</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.sitting}>
            <Td>
              {row.title}
              <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {row.sitting}
              </span>
            </Td>
            <Td>
              <span className="font-mono">{row.deadline}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{row.days}</span>
            </Td>
            <Td>{row.state}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Submission runway"
      subtitle="Days until each sitting's submission window shuts. Bars left of the line are windows that have already closed."
      table={table}
    >
      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
        {KEY.map(({ label, icon: Icon, color }) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300"
          >
            <Icon size={13} style={{ color }} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No sitting is currently taking submissions.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(190, rows.length * 62)}>
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="var(--viz-grid)" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
              tickFormatter={(value: number) => `${value}d`}
            />
            <YAxis
              type="category"
              dataKey="sitting"
              width={104}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
            />
            <ReferenceLine x={0} stroke="var(--viz-axis)" />
            <Tooltip
              cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
              content={RunwayTooltip}
            />
            <Bar
              dataKey="days"
              isAnimationActive={false}
              maxBarSize={22}
              radius={[0, 4, 4, 0]}
            >
              {rows.map((row) => (
                <Cell key={row.sitting} fill={row.tone} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}
