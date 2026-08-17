"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import ChartFrame from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import type { AccessDay } from "@/models/response/base-response";

/** "2026-08-14" → "14 Aug", which is all an axis tick needs to carry. */
function tick(date: string) {
  const [, month, day] = date.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(day)} ${months[Number(month) - 1]}`;
}

function DenialTooltip({ active, payload }: TooltipContentProps) {
  const row = payload?.[0]?.payload as AccessDay | undefined;
  if (!active || !row) return null;

  const rate = ((row.denied / (row.granted + row.denied)) * 100).toFixed(1);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
      <p className="font-medium text-neutral-900 dark:text-neutral-100">
        {tick(row.date)}
      </p>
      <p className="mt-1.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {row.denied}
        </span>{" "}
        <span className="text-neutral-500 dark:text-neutral-400">denied</span>
      </p>
      <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
        {row.granted} granted · {rate}% refused
      </p>
    </div>
  );
}

/**
 * One series, so no legend — the title says what is plotted. Denial is a
 * pass/fail measure rather than an identity, so it wears the reserved critical
 * step instead of a series colour, and the count of grants stays in the table
 * where it cannot be mistaken for a second line on the same scale.
 */
export default function DenialsChart({ days }: { days: AccessDay[] }) {
  const peak = days.reduce((worst, day) => (day.denied > worst.denied ? day : worst), days[0]);

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Day</Th>
          <Th align="right">Granted</Th>
          <Th align="right">Denied</Th>
          <Th align="right">Refused</Th>
        </tr>
      </thead>
      <tbody>
        {[...days].reverse().map((day) => (
          <tr key={day.date}>
            <Td>
              <span className="font-mono">{day.date}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{day.granted}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{day.denied}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">
                {((day.denied / (day.granted + day.denied)) * 100).toFixed(1)}%
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Refused authorisations, last 14 days"
      subtitle={`Every request the server declined. The run since 12 August peaks at ${peak.denied} on ${tick(peak.date)} — worth an entry in the audit review.`}
      table={table}
    >
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={days} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
          <XAxis
            dataKey="date"
            tickFormatter={tick}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
          />
          <YAxis
            allowDecimals={false}
            width={32}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ stroke: "var(--viz-axis)", strokeWidth: 1 }}
            content={DenialTooltip}
          />
          <Line
            type="monotone"
            isAnimationActive={false}
            dataKey="denied"
            stroke="var(--viz-critical)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={false}
            activeDot={{
              r: 4,
              fill: "var(--viz-critical)",
              stroke: "var(--viz-surface)",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
