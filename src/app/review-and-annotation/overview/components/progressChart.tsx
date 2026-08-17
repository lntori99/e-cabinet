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
import type { ReaderPack } from "@/core/slices/review-slice";
import { PROGRESS_STEP, readingState } from "../../components/readingStatus";

/**
 * Not opened → part read → read → acknowledged is one scale, not four
 * identities, so the segments take one hue in monotone steps with the darkest
 * at the far end. What the reader is looking for is how much dark is left.
 */
const SERIES = [
  { key: "Acknowledged", fill: PROGRESS_STEP.Acknowledged },
  { key: "Read", fill: PROGRESS_STEP.Read },
  { key: "Part read", fill: PROGRESS_STEP["Part read"] },
  { key: "Not opened", fill: PROGRESS_STEP["Not opened"] },
] as const;

type Row = { pack: string; meeting: string } & Record<string, string | number>;

export default function ProgressChart({ packs }: { packs: ReaderPack[] }) {
  const rows = useMemo<Row[]>(
    () =>
      packs.map((pack) => {
        const row: Row = { pack: pack.meetingId, meeting: pack.meetingTitle };
        for (const series of SERIES) row[series.key] = 0;
        for (const item of pack.items) {
          const label = readingState(item).label;
          row[label] = Number(row[label] ?? 0) + 1;
        }
        return row;
      }),
    [packs],
  );

  const keys: SeriesKey[] = SERIES.map((s) => ({ label: s.key, color: s.fill }));

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Pack</Th>
          {SERIES.map((s) => (
            <Th key={s.key} align="right">
              {s.key}
            </Th>
          ))}
          <Th align="right">Papers</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.pack}>
            <Td>
              {row.meeting}
              <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {row.pack}
              </span>
            </Td>
            {SERIES.map((s) => (
              <Td key={s.key} align="right">
                <span className="font-mono">{row[s.key]}</span>
              </Td>
            ))}
            <Td align="right">
              <span className="font-mono font-semibold">
                {SERIES.reduce((sum, s) => sum + Number(row[s.key]), 0)}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Your reading, by pack"
      subtitle="Where you have got to in each pack you can reach. Acknowledging is the last step — it records, with a timestamp, that you have read the paper."
      keys={keys}
      table={table}
    >
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No pack has been released to you.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, rows.length * 66)}>
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
              dataKey="pack"
              width={110}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
              content={ChartTooltip}
            />
            {SERIES.map((series) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                stackId="progress"
                fill={series.fill}
                stroke="var(--viz-surface)"
                strokeWidth={2}
                isAnimationActive={false}
                maxBarSize={22}
                radius={[0, 4, 4, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}
