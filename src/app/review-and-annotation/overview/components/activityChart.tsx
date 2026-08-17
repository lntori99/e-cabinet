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
import type { ReviewDay } from "@/models/response/base-response";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function tick(date: string) {
  const [, month, day] = date.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]}`;
}

/** Three kinds of act, not three degrees of one — so, categorical slots. */
const SERIES = [
  { key: "notes", label: "Private notes", color: "var(--viz-1)" },
  { key: "comments", label: "Formal comments", color: "var(--viz-2)" },
  { key: "flags", label: "Flags raised", color: "var(--viz-3)" },
] as const;

export default function ActivityChart({ days }: { days: ReviewDay[] }) {
  const keys: SeriesKey[] = SERIES.map((s) => ({ label: s.label, color: s.color }));

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Day</Th>
          {SERIES.map((s) => (
            <Th key={s.key} align="right">
              {s.label}
            </Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...days].reverse().map((day) => (
          <tr key={day.date}>
            <Td>
              <span className="font-mono">{day.date}</span>
            </Td>
            {SERIES.map((s) => (
              <Td key={s.key} align="right">
                <span className="font-mono">{day[s.key]}</span>
              </Td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Your activity, last 14 days"
      subtitle="Your own record only. Notes are private; comments and flags went to named recipients, which is why they are counted separately."
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
            width={28}
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
