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
import { expiryBand, type ExpiryBand } from "@/core/slices/governance-slice";
import { seedRetentionClasses } from "@/data/dataGovernance";
import type { RetainedRecord } from "@/models/response/base-response";

/**
 * How long each class has left to run. The bands are ordered — passed, within
 * six months, within five years, beyond — so they wear the one-hue ordinal ramp
 * and read as a scale rather than as four unrelated things.
 *
 * "Permanent" is not a longer version of "beyond": it is a different kind of
 * answer, so it takes the neutral axis step and sits at the end rather than
 * pretending to be the far edge of the same scale.
 */
const BANDS: { band: ExpiryBand; color: string }[] = [
  { band: "Passed", color: "var(--viz-ramp-2)" },
  { band: "Within 6 months", color: "var(--viz-ramp-3)" },
  { band: "Within 5 years", color: "var(--viz-ramp-4)" },
  { band: "Beyond", color: "var(--viz-ramp-5)" },
  { band: "Permanent", color: "var(--viz-axis)" },
];

type Row = { klass: string } & Record<string, string | number>;

export default function ExpiryChart({
  records,
  today,
}: {
  records: RetainedRecord[];
  today: string;
}) {
  const rows = useMemo<Row[]>(
    () =>
      seedRetentionClasses.map((klass) => {
        const mine = records.filter((r) => r.retentionClassId === klass.id);
        const row: Row = {
          klass: klass.name.replace(" — National Archives", "").replace(" — working material", ""),
        };
        for (const { band } of BANDS) {
          row[band] = mine.filter((r) => expiryBand(r, today) === band).length;
        }
        return row;
      }),
    [records, today],
  );

  const keys: SeriesKey[] = BANDS.map(({ band, color }) => ({ label: band, color }));

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Class</Th>
          {BANDS.map(({ band }) => (
            <Th key={band} align="right">
              {band}
            </Th>
          ))}
          <Th align="right">Held</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row.klass)}>
            <Td>{row.klass}</Td>
            {BANDS.map(({ band }) => (
              <Td key={band} align="right">
                <span className="font-mono">{row[band]}</span>
              </Td>
            ))}
            <Td align="right">
              <span className="font-mono font-semibold">
                {BANDS.reduce((sum, { band }) => sum + Number(row[band]), 0)}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="How long each class has left"
      subtitle="Records by retention class and time to expiry. The shades run in order, so a bar that is pale at its left-hand end is a class with records already past their date — held only because a hold is in force, or waiting on a deletion nobody has approved."
      keys={keys}
      table={table}
    >
      <ResponsiveContainer width="100%" height={Math.max(180, rows.length * 46)}>
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
            dataKey="klass"
            width={128}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
            content={ChartTooltip}
          />
          {BANDS.map(({ band, color }, index) => (
            <Bar
              key={band}
              dataKey={band}
              stackId="expiry"
              fill={color}
              stroke="var(--viz-surface)"
              strokeWidth={2}
              isAnimationActive={false}
              maxBarSize={22}
              radius={index === BANDS.length - 1 ? [0, 4, 4, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
