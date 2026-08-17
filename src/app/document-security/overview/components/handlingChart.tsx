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
import ChartFrame, { ChartTooltip, type SeriesKey } from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import type { HandlingDay } from "@/models/response/base-response";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function tick(date: string) {
  const [, month, day] = date.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]}`;
}

/**
 * Two series of the same measure — actions taken on documents — so they take
 * categorical slots rather than status colours. Refusals are counted in the
 * table rather than plotted as a third line: they sit an order of magnitude
 * below the others, and a shared axis would flatten them into the baseline.
 */
const SERIES = [
  { key: "prints", label: "Prints", color: "var(--viz-1)" },
  { key: "downloads", label: "Downloads", color: "var(--viz-2)" },
] as const;

export default function HandlingChart({ days }: { days: HandlingDay[] }) {
  const keys: SeriesKey[] = SERIES.map((s) => ({ label: s.label, color: s.color }));
  const blocked = days.reduce((sum, day) => sum + day.blocked, 0);

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Day</Th>
          <Th align="right">Prints</Th>
          <Th align="right">Downloads</Th>
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
              <span className="font-mono">{day.prints}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{day.downloads}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{day.blocked}</span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Print and download activity"
      subtitle={`Every print is recorded against the person who made it — FR-DOC-11. ${blocked} attempts were refused outright in this period by the handling rules.`}
      keys={keys}
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
            content={ChartTooltip}
          />
          {SERIES.map((series) => (
            <Line
              key={series.key}
              type="monotone"
              dataKey={series.key}
              name={series.label}
              stroke={series.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              isAnimationActive={false}
              activeDot={{
                r: 4,
                fill: series.color,
                stroke: "var(--viz-surface)",
                strokeWidth: 2,
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
