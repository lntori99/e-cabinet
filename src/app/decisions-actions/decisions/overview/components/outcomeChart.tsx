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
import ChartFrame, { ChartTooltip } from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import { OUTCOME_TYPES } from "@/data/decisions";
import type { DecisionRecord } from "@/models/response/base-response";

/**
 * One series, so no legend and no per-bar hue: the outcome is named on the axis
 * beside its own bar, and colouring each one differently would be decoration
 * repeating what the label already says.
 */
export default function OutcomeChart({ decisions }: { decisions: DecisionRecord[] }) {
  const rows = useMemo(
    () =>
      OUTCOME_TYPES.map((type) => ({
        outcome: type.code,
        count: decisions.filter((d) => d.outcome === type.code).length,
        meaning: type.meaning,
      })),
    [decisions],
  );

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Outcome</Th>
          <Th>What it means</Th>
          <Th align="right">Decisions</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.outcome}>
            <Td>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {row.outcome}
              </span>
            </Td>
            <Td>
              <span className="text-neutral-600 dark:text-neutral-400">{row.meaning}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{row.count}</span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Decisions by outcome"
      subtitle="The outcome vocabulary is configurable, and every decision carries exactly one of these. A run of deferrals on one policy question is the shape worth noticing."
      table={table}
    >
      <ResponsiveContainer width="100%" height={230}>
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
            dataKey="outcome"
            width={148}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
            content={ChartTooltip}
          />
          <Bar
            dataKey="count"
            name="Decisions"
            fill="var(--viz-1)"
            isAnimationActive={false}
            maxBarSize={16}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
