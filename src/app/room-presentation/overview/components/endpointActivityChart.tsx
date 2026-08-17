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
import type { EndpointDay } from "@/models/response/base-response";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function tick(date: string) {
  const [, month, day] = date.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]}`;
}

/** Three kinds of event, not three degrees of one — categorical slots. */
const SERIES = [
  { key: "signIns", label: "Sign-ins", color: "var(--viz-1)" },
  { key: "changes", label: "Administrative changes", color: "var(--viz-2)" },
  { key: "errors", label: "Device errors", color: "var(--viz-3)" },
] as const;

export default function EndpointActivityChart({ days }: { days: EndpointDay[] }) {
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
      title="Endpoint activity, last 14 days"
      subtitle="Every sign-in, administrative change, application access, software update and device error on a room endpoint reaches the central log. These are the three worth watching day to day."
      keys={keys}
      table={table}
    >
      <ResponsiveContainer width="100%" height={250}>
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
