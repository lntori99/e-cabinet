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
import { FiAlertTriangle } from "react-icons/fi";
import ChartFrame, { ChartTooltip } from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import { RECORD_KINDS } from "@/data/dataGovernance";
import type { RetainedRecord } from "@/models/response/base-response";

/**
 * FR-DAT-02 names six kinds of Cabinet record that must be preserved, so all
 * six are plotted whether or not they have anything in them. A kind at zero is
 * either a kind with nothing in it yet or a kind nothing is preserving, and the
 * reader is entitled to ask which — a chart that quietly omitted it would not
 * let them.
 *
 * One series, so one hue and no legend: the kind is named on the axis.
 */
export default function KindChart({ records }: { records: RetainedRecord[] }) {
  const rows = useMemo(
    () =>
      RECORD_KINDS.map((kind) => ({
        kind,
        count: records.filter((r) => r.kind === kind).length,
      })).sort((a, b) => a.count - b.count),
    [records],
  );

  const missing = rows.filter((r) => r.count === 0);

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Kind</Th>
          <Th align="right">Under retention</Th>
          <Th>Preserved</Th>
        </tr>
      </thead>
      <tbody>
        {[...rows].reverse().map((row) => (
          <tr key={row.kind}>
            <Td>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {row.kind}
              </span>
            </Td>
            <Td align="right">
              <span className="font-mono">{row.count}</span>
            </Td>
            <Td>
              <span
                style={{
                  color: row.count === 0 ? "var(--viz-warning)" : "var(--viz-good)",
                }}
              >
                {row.count === 0 ? "Nothing held" : "Yes"}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="What is under retention"
      subtitle="The six kinds of Cabinet record FR-DAT-02 requires to be preserved, all six plotted. A kind holding nothing is worth a question rather than a blank space."
      table={table}
    >
      <ResponsiveContainer width="100%" height={Math.max(180, rows.length * 32)}>
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
            dataKey="kind"
            width={92}
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
            name="Records"
            fill="var(--viz-1)"
            isAnimationActive={false}
            maxBarSize={16}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {missing.length > 0 && (
        <p
          className="mt-3 flex items-start gap-2 text-xs"
          style={{ color: "var(--viz-warning)" }}
        >
          <FiAlertTriangle size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {missing.map((m) => m.kind.toLowerCase()).join(", ")} holds nothing in
            the register.
          </span>
        </p>
      )}
    </ChartFrame>
  );
}
