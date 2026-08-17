"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import ChartFrame, { ChartTooltip } from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import { COMPLIANT_COLOR, FAILING_COLOR } from "../../components/roomStatus";

interface Row {
  control: string;
  detail: string;
  compliant: number;
  failing: number;
}

/**
 * Compliance is pass or fail, not a series identity, so the two segments wear
 * the reserved status steps and are labelled in the key rather than left to
 * colour alone.
 */
export default function BaselineChart({ rows }: { rows: Row[] }) {
  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Control</Th>
          <Th>What it requires</Th>
          <Th align="right">Compliant</Th>
          <Th align="right">Failing</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.control}>
            <Td>{row.control}</Td>
            <Td>{row.detail}</Td>
            <Td align="right">
              <span className="font-mono">{row.compliant}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{row.failing}</span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Security baseline, by control"
      subtitle="Managed endpoints measured against the Windows 11 Professional baseline. A device is counted against every control it fails, so one device can appear in more than one bar."
      table={table}
    >
      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
        <li className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
          <FiCheckCircle size={13} style={{ color: COMPLIANT_COLOR }} aria-hidden="true" />
          Compliant
        </li>
        <li className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
          <FiAlertTriangle size={13} style={{ color: FAILING_COLOR }} aria-hidden="true" />
          Failing
        </li>
      </ul>

      <ResponsiveContainer width="100%" height={250}>
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
            dataKey="control"
            width={168}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
            content={ChartTooltip}
          />
          <Bar
            dataKey="compliant"
            name="Compliant"
            stackId="baseline"
            fill={COMPLIANT_COLOR}
            stroke="var(--viz-surface)"
            strokeWidth={2}
            isAnimationActive={false}
            maxBarSize={20}
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="failing"
            name="Failing"
            stackId="baseline"
            fill={FAILING_COLOR}
            stroke="var(--viz-surface)"
            strokeWidth={2}
            isAnimationActive={false}
            maxBarSize={20}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
