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
import type { DeliveryRecord } from "@/models/response/base-response";
import { TRIGGER_REQUIREMENT } from "../../components/notificationStatus";

/**
 * One series, so no legend and one hue: the trigger is named on the axis beside
 * its own bar, and a colour per bar would only repeat the label. Triggers that
 * have not fired are left out rather than drawn as an empty row — this is a
 * question about volume, not a checklist of the rules.
 */
export default function TriggerChart({ records }: { records: DeliveryRecord[] }) {
  const rows = useMemo(() => {
    const counts = new Map<string, number>();
    for (const record of records) {
      counts.set(record.trigger, (counts.get(record.trigger) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => a.count - b.count);
  }, [records]);

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Trigger</Th>
          <Th>Requirement</Th>
          <Th align="right">Notifications</Th>
        </tr>
      </thead>
      <tbody>
        {[...rows].reverse().map((row) => (
          <tr key={row.trigger}>
            <Td>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {row.trigger}
              </span>
            </Td>
            <Td>
              <span className="font-mono text-xs">
                {TRIGGER_REQUIREMENT[
                  row.trigger as keyof typeof TRIGGER_REQUIREMENT
                ] ?? "—"}
              </span>
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
      title="What is generating the traffic"
      subtitle="Which events actually fired, rather than which rules exist. A rule that never fires is worth a look; so is one that fires more than anybody expected."
      table={table}
    >
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          Nothing has been sent yet.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(180, rows.length * 30)}>
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
              dataKey="trigger"
              width={182}
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
              name="Notifications"
              fill="var(--viz-1)"
              isAnimationActive={false}
              maxBarSize={14}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}
