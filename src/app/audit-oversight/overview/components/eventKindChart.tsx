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
import { AUDITED_ACTIONS, classifyAction } from "@/data/audit";
import type { AuditEvent } from "@/models/response/base-response";

/**
 * FR-AUD-01 names eight kinds of act that must be recorded, so all eight are
 * plotted — including the ones at zero. This is a coverage chart as much as a
 * volume chart: a kind with no events either did not happen or is not being
 * recorded, and the reader is entitled to ask which.
 *
 * One series, so no legend and one hue. The kind is named on the axis beside
 * its own bar.
 */
export default function EventKindChart({ events }: { events: AuditEvent[] }) {
  const rows = useMemo(() => {
    const counts = new Map<string, number>();
    for (const kind of AUDITED_ACTIONS) counts.set(kind, 0);
    for (const event of events) {
      const kind = classifyAction(event.action);
      counts.set(kind, (counts.get(kind) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([kind, count]) => ({ kind, count }))
      .sort((a, b) => a.count - b.count);
  }, [events]);

  const missing = rows.filter((r) => r.count === 0);

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Kind</Th>
          <Th align="right">Events</Th>
          <Th>Recorded</Th>
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
                {row.count === 0 ? "Nothing in this period" : "Yes"}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Events by kind"
      subtitle="The eight kinds of act FR-AUD-01 requires to be recorded, all eight plotted. A kind sitting at zero either did not happen or is not reaching the log, and only one of those is acceptable."
      table={table}
    >
      <ResponsiveContainer width="100%" height={Math.max(200, rows.length * 30)}>
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
            width={150}
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
            name="Events"
            fill="var(--viz-1)"
            isAnimationActive={false}
            maxBarSize={14}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {missing.length > 0 && (
        <p className="mt-3 text-xs" style={{ color: "var(--viz-warning)" }}>
          {missing.length} of the eight recorded no events:{" "}
          {missing.map((m) => m.kind.toLowerCase()).join(", ")}.
        </p>
      )}
    </ChartFrame>
  );
}
