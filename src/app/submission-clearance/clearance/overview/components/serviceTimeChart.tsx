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
import { FiAlertTriangle, FiCheckCircle, FiClock } from "react-icons/fi";
import ChartFrame from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import { distance, hoursUntil } from "@/common/time";
import type { Submission } from "@/models/response/base-response";

interface Row {
  paper: string;
  title: string;
  stage: string;
  hours: number;
  label: string;
  state: string;
  tone: string;
}

/** Status, not identity — reserved steps, always beside their word. */
const KEY = [
  { label: "Inside service time", icon: FiCheckCircle, color: "var(--viz-good)" },
  { label: "Due within 6 hours", icon: FiClock, color: "var(--viz-warning)" },
  { label: "Escalated", icon: FiAlertTriangle, color: "var(--viz-critical)" },
];

function ServiceTooltip({ active, payload }: TooltipContentProps) {
  const row = payload?.[0]?.payload as Row | undefined;
  if (!active || !row) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
      <p className="font-medium text-neutral-900 dark:text-neutral-100">{row.title}</p>
      <p className="mt-1.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {row.label}
        </span>{" "}
        <span className="text-neutral-500 dark:text-neutral-400">at {row.stage}</span>
      </p>
      <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">{row.state}</p>
    </div>
  );
}

/**
 * FR-SUB-14 — how much service time each paper in flight has left. Bars left of
 * the line have run past their configured time and are escalated.
 */
export default function ServiceTimeChart({
  submissions,
  now,
}: {
  submissions: Submission[];
  now: string;
}) {
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (const submission of submissions) {
      for (const stage of submission.stages) {
        if (stage.status !== "In progress" || !stage.dueAt) continue;
        const hours = hoursUntil(stage.dueAt, now);
        out.push({
          paper: submission.id,
          title: submission.title,
          stage: stage.stage,
          hours: Math.round(hours * 10) / 10,
          label: distance(hours),
          state:
            hours < 0
              ? "Past its configured service time"
              : `${stage.serviceHours}h service time · ${stage.actor ?? stage.actorRole}`,
          tone:
            hours < 0
              ? "var(--viz-critical)"
              : hours <= 6
                ? "var(--viz-warning)"
                : "var(--viz-good)",
        });
      }
    }
    return out.sort((a, b) => a.hours - b.hours);
  }, [submissions, now]);

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Paper</Th>
          <Th>Stage</Th>
          <Th align="right">Hours left</Th>
          <Th>State</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.paper}-${row.stage}`}>
            <Td>
              {row.title}
              <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {row.paper}
              </span>
            </Td>
            <Td>{row.stage}</Td>
            <Td align="right">
              <span className="font-mono">{row.hours}</span>
            </Td>
            <Td>{row.state}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Service time remaining"
      subtitle="Hours left on each stage currently awaiting a decision. Anything left of the line has breached its configured service time."
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
          Nothing is currently awaiting a clearance decision.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, rows.length * 56)}>
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
              tickFormatter={(value: number) => `${value}h`}
            />
            <YAxis
              type="category"
              dataKey="paper"
              width={104}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
            />
            <ReferenceLine x={0} stroke="var(--viz-axis)" />
            <Tooltip
              cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
              content={ServiceTooltip}
            />
            <Bar
              dataKey="hours"
              isAnimationActive={false}
              maxBarSize={20}
              radius={[0, 4, 4, 0]}
            >
              {rows.map((row) => (
                <Cell key={`${row.paper}-${row.stage}`} fill={row.tone} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}
