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
import { FiAlertTriangle, FiCheckCircle, FiClock } from "react-icons/fi";
import ChartFrame, { ChartTooltip } from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import { CHANNELS } from "@/data/notifications";
import type { DeliveryRecord, DeliveryState } from "@/models/response/base-response";
import { DELIVERY_COLOR } from "../../components/notificationStatus";

const STATES: { state: DeliveryState; icon: typeof FiCheckCircle }[] = [
  { state: "Delivered", icon: FiCheckCircle },
  { state: "Pending", icon: FiClock },
  { state: "Failed", icon: FiAlertTriangle },
];

type Row = { channel: string } & Record<string, string | number>;

/**
 * Delivery outcome is a state rather than a category, so it wears the reserved
 * status steps — and because status colour alone is never allowed to carry the
 * meaning, the key beneath the title pairs each step with an icon and its word.
 */
export default function DeliveryChart({ records }: { records: DeliveryRecord[] }) {
  const rows = useMemo<Row[]>(
    () =>
      CHANNELS.map((channel) => {
        const mine = records.filter((r) => r.channel === channel);
        const row: Row = { channel };
        for (const { state } of STATES) {
          row[state] = mine.filter((r) => r.state === state).length;
        }
        return row;
      }),
    [records],
  );

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Channel</Th>
          {STATES.map(({ state }) => (
            <Th key={state} align="right">
              {state}
            </Th>
          ))}
          <Th align="right">Sent</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row.channel)}>
            <Td>{row.channel}</Td>
            {STATES.map(({ state }) => (
              <Td key={state} align="right">
                <span className="font-mono">{row[state]}</span>
              </Td>
            ))}
            <Td align="right">
              <span className="font-mono font-semibold">
                {STATES.reduce((sum, { state }) => sum + Number(row[state]), 0)}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Delivery outcome, by channel"
      subtitle="What happened to every notification the platform sent. A failure on one channel is not a failure to notify — the same event usually went out in-platform as well — but it is still somebody who did not get the message they were owed."
      table={table}
    >
      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
        {STATES.map(({ state, icon: Icon }) => (
          <li
            key={state}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300"
          >
            <Icon
              size={13}
              style={{ color: DELIVERY_COLOR[state] }}
              aria-hidden="true"
            />
            {state}
          </li>
        ))}
      </ul>

      <ResponsiveContainer width="100%" height={180}>
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
            dataKey="channel"
            width={88}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
            content={ChartTooltip}
          />
          {STATES.map(({ state }, index) => (
            <Bar
              key={state}
              dataKey={state}
              stackId="delivery"
              fill={DELIVERY_COLOR[state]}
              stroke="var(--viz-surface)"
              strokeWidth={2}
              isAnimationActive={false}
              maxBarSize={22}
              radius={index === STATES.length - 1 ? [0, 4, 4, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
