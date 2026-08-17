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
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiSlash,
  FiXCircle,
} from "react-icons/fi";
import ChartFrame, { ChartTooltip } from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import type { DeviceCompliance, ManagedDevice } from "@/models/response/base-response";

/**
 * FR-ADM-08 — device compliance by ministry. Compliance is a state rather than
 * an identity, so it wears the reserved status steps, and because status colour
 * is never allowed to carry the meaning on its own the key pairs each step with
 * an icon and its word.
 */
const STATES: {
  state: DeviceCompliance;
  color: string;
  icon: typeof FiCheckCircle;
}[] = [
  { state: "Compliant", color: "var(--viz-good)", icon: FiCheckCircle },
  { state: "At risk", color: "var(--viz-warning)", icon: FiAlertTriangle },
  { state: "Non-compliant", color: "var(--viz-critical)", icon: FiXCircle },
  { state: "Wiped", color: "var(--viz-axis)", icon: FiSlash },
];

type Row = { ministry: string } & Record<string, string | number>;

export default function ComplianceChart({ devices }: { devices: ManagedDevice[] }) {
  const rows = useMemo<Row[]>(() => {
    const names = [...new Set(devices.map((d) => d.ministry))].sort();
    return names.map((ministry) => {
      const mine = devices.filter((d) => d.ministry === ministry);
      const row: Row = {
        ministry: ministry
          .replace("Ministry of ", "")
          .replace("Office of the President & Cabinet", "OPC"),
      };
      for (const { state } of STATES) {
        row[state] = mine.filter((d) => d.compliance === state).length;
      }
      return row;
    });
  }, [devices]);

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Ministry</Th>
          {STATES.map(({ state }) => (
            <Th key={state} align="right">
              {state}
            </Th>
          ))}
          <Th align="right">Devices</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row.ministry)}>
            <Td>{row.ministry}</Td>
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
      title="Device compliance, by ministry"
      subtitle="Every enrolled endpoint and room device against its policy baseline. A wiped device is neither compliant nor a problem — it is a device that no longer holds anything."
      table={table}
    >
      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
        {STATES.map(({ state, color, icon: Icon }) => (
          <li
            key={state}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300"
          >
            <Icon size={13} style={{ color }} aria-hidden="true" />
            {state}
          </li>
        ))}
      </ul>

      <ResponsiveContainer width="100%" height={Math.max(160, rows.length * 40)}>
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
            width={92}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
            content={ChartTooltip}
          />
          {STATES.map(({ state, color }, index) => (
            <Bar
              key={state}
              dataKey={state}
              stackId="compliance"
              fill={color}
              stroke="var(--viz-surface)"
              strokeWidth={2}
              isAnimationActive={false}
              maxBarSize={20}
              radius={index === STATES.length - 1 ? [0, 4, 4, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
