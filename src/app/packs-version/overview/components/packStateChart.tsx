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
import type { TooltipContentProps } from "recharts";
import ChartFrame from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import type { Pack, PackState } from "@/models/response/base-response";

/** The lifecycle order — a pack only ever moves down this list. */
const LIFECYCLE: PackState[] = ["In assembly", "Frozen", "Released", "Recalled"];

interface Row {
  state: string;
  packs: number;
  items: number;
  note: string;
}

function StateTooltip({ active, payload }: TooltipContentProps) {
  const row = payload?.[0]?.payload as Row | undefined;
  if (!active || !row) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
      <p className="font-medium text-neutral-900 dark:text-neutral-100">{row.state}</p>
      <p className="mt-1.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {row.packs}
        </span>{" "}
        <span className="text-neutral-500 dark:text-neutral-400">
          pack{row.packs === 1 ? "" : "s"} · {row.items} agenda items
        </span>
      </p>
      <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">{row.note}</p>
    </div>
  );
}

const NOTE: Record<PackState, string> = {
  "In assembly": "Contents can still change",
  Frozen: "Closed to change, awaiting release",
  Released: "With participants",
  Recalled: "Access revoked",
  Superseded: "Replaced by a later version",
};

/**
 * One measure across a lifecycle, so the order is carried by the axis and the
 * bars take a single hue — colouring the states apart would spend the identity
 * channel on something the sequence already says.
 */
export default function PackStateChart({ packs }: { packs: Pack[] }) {
  const rows = useMemo<Row[]>(
    () =>
      LIFECYCLE.map((state) => {
        const held = packs.filter((p) => p.state === state);
        return {
          state,
          packs: held.length,
          items: held.reduce((sum, p) => sum + p.items.length, 0),
          note: NOTE[state],
        };
      }),
    [packs],
  );

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>State</Th>
          <Th align="right">Packs</Th>
          <Th align="right">Agenda items</Th>
          <Th>Meaning</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.state}>
            <Td>{row.state}</Td>
            <Td align="right">
              <span className="font-mono">{row.packs}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{row.items}</span>
            </Td>
            <Td>{row.note}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Packs by state"
      subtitle="Where every pack on the register sits in the lifecycle. A pack only moves down this list — assembly, freeze, release — and never back."
      table={table}
    >
      <ResponsiveContainer width="100%" height={210}>
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
            dataKey="state"
            width={104}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
            content={StateTooltip}
          />
          <Bar
            dataKey="packs"
            fill="var(--viz-1)"
            isAnimationActive={false}
            maxBarSize={18}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
