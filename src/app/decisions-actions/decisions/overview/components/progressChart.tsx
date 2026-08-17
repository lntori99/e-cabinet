"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartFrame, { ChartTooltip, type SeriesKey } from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import type { ActionRecord, ActionState } from "@/models/response/base-response";

/**
 * The four states an action passes through, in order. Order is the meaning
 * here — an action does not go from "closed" back to "in progress" — so this
 * wears the one-hue ordinal ramp rather than four identities, and each ministry
 * bar reads as a row filling from left to right.
 */
const STAGES: { state: ActionState; color: string }[] = [
  { state: "Not started", color: "var(--viz-ramp-2)" },
  { state: "In progress", color: "var(--viz-ramp-3)" },
  { state: "Submitted for closure", color: "var(--viz-ramp-4)" },
  { state: "Closed", color: "var(--viz-ramp-5)" },
];

type Row = { ministry: string } & Record<string, string | number>;

export default function ProgressChart({ actions }: { actions: ActionRecord[] }) {
  const rows = useMemo<Row[]>(() => {
    const names = [...new Set(actions.map((a) => a.ministry))].sort();
    return names.map((ministry) => {
      const mine = actions.filter((a) => a.ministry === ministry);
      const row: Row = { ministry: ministry.replace("Ministry of ", "") };
      for (const stage of STAGES) {
        row[stage.state] = mine.filter((a) => a.state === stage.state).length;
      }
      return row;
    });
  }, [actions]);

  const keys: SeriesKey[] = STAGES.map((stage) => ({
    label: stage.state,
    color: stage.color,
  }));

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Ministry</Th>
          {STAGES.map((stage) => (
            <Th key={stage.state} align="right">
              {stage.state}
            </Th>
          ))}
          <Th align="right">Total</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row.ministry)}>
            <Td>{row.ministry}</Td>
            {STAGES.map((stage) => (
              <Td key={stage.state} align="right">
                <span className="font-mono">{row[stage.state]}</span>
              </Td>
            ))}
            <Td align="right">
              <span className="font-mono font-semibold">
                {STAGES.reduce((sum, stage) => sum + Number(row[stage.state]), 0)}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Action progress, by ministry"
      subtitle="Where each ministry's actions stand in the cycle. The shades run in order — not started through to closed — so a bar that is dark at the right-hand end is a ministry that has finished what it was given."
      keys={keys}
      table={table}
    >
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No action has been raised yet.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, rows.length * 52)}>
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="var(--viz-grid)" />
            <XAxis
              type="number"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="ministry"
              width={96}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
              content={ChartTooltip}
            />
            {STAGES.map((stage) => (
              <Bar
                key={stage.state}
                dataKey={stage.state}
                stackId="progress"
                fill={stage.color}
                stroke="var(--viz-surface)"
                strokeWidth={2}
                isAnimationActive={false}
                maxBarSize={20}
                radius={[0, 4, 4, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}
