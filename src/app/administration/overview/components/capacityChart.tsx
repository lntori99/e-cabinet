"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiAlertTriangle } from "react-icons/fi";
import ChartFrame, { ChartTooltip } from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import { CAPACITY_WARNING_PERCENT } from "@/data/administration";
import type { ServiceHealth } from "@/models/response/base-response";

/**
 * FR-ADM-06 — storage capacity. One measure across named stores, so one hue and
 * no legend: the store is named on the axis beside its own bar. The warning
 * level is a dashed reference line rather than a second colour, because a bar
 * past it is a fact about the line and not a category of its own.
 */
export default function CapacityChart({ services }: { services: ServiceHealth[] }) {
  const rows = useMemo(
    () =>
      services
        .filter((s) => s.usedPercent !== undefined)
        .map((s) => ({
          name: s.name,
          used: s.usedPercent as number,
          detail: s.detail,
        }))
        .sort((a, b) => a.used - b.used),
    [services],
  );

  const over = rows.filter((r) => r.used >= CAPACITY_WARNING_PERCENT);

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Store</Th>
          <Th align="right">Used</Th>
          <Th>Detail</Th>
        </tr>
      </thead>
      <tbody>
        {[...rows].reverse().map((row) => (
          <tr key={row.name}>
            <Td>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {row.name}
              </span>
            </Td>
            <Td align="right">
              <span
                className="font-mono"
                style={{
                  color:
                    row.used >= CAPACITY_WARNING_PERCENT
                      ? "var(--viz-critical)"
                      : undefined,
                }}
              >
                {row.used}%
              </span>
            </Td>
            <Td>
              <span className="text-neutral-600 dark:text-neutral-400">{row.detail}</span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Storage capacity"
      subtitle="How full each store is. The audit store only ever grows, because nothing in it is deleted — so the number to watch there is the trend rather than the level."
      table={table}
    >
      <ResponsiveContainer width="100%" height={Math.max(160, rows.length * 46)}>
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid horizontal={false} stroke="var(--viz-grid)" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
            tickFormatter={(value: number) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={118}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
          />
          <ReferenceLine
            x={CAPACITY_WARNING_PERCENT}
            stroke="var(--viz-axis)"
            strokeDasharray="4 3"
          />
          <Tooltip
            cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
            content={ChartTooltip}
          />
          <Bar
            dataKey="used"
            name="Used (%)"
            fill="var(--viz-1)"
            isAnimationActive={false}
            maxBarSize={18}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <p className="mt-2 inline-flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
        <svg width="22" height="8" aria-hidden="true">
          <line
            x1="0"
            y1="4"
            x2="22"
            y2="4"
            stroke="var(--viz-axis)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        </svg>
        Capacity warning · {CAPACITY_WARNING_PERCENT}%
      </p>

      {over.length > 0 && (
        <p
          className="mt-2 flex items-start gap-2 text-sm"
          style={{ color: "var(--viz-critical)" }}
        >
          <FiAlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {over.map((r) => r.name).join(", ")} {over.length === 1 ? "is" : "are"} past
            the warning level. A store that fills stops accepting writes, and an
            audit write that fails fails the operation behind it.
          </span>
        </p>
      )}
    </ChartFrame>
  );
}
