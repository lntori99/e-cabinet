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
import type { Pack } from "@/models/response/base-response";
import { acknowledgementTally } from "../../components/packStatus";

/**
 * Read, received and never opened are degrees of the same thing, not three
 * separate identities, so the segments take one hue in monotone steps — the
 * darkest step is the one that counts.
 */
const SERIES = [
  { key: "Read", fill: "var(--viz-ramp-3)" },
  { key: "Received, not read", fill: "var(--viz-ramp-2)" },
  { key: "No receipt", fill: "var(--viz-ramp-1)" },
] as const;

type Row = { pack: string; title: string } & Record<string, string | number>;

export default function AcknowledgementChart({ packs }: { packs: Pack[] }) {
  const rows = useMemo<Row[]>(
    () =>
      packs
        // Only packs currently with participants. A recalled pack's read count
        // matters, but it belongs on the recall record, not in a live tally.
        .filter((p) => p.state === "Released" && p.acknowledgements.length > 0)
        .map((pack) => {
          const tally = acknowledgementTally(pack);
          return {
            pack: pack.id,
            title: pack.title,
            Read: tally.read,
            "Received, not read": tally.received,
            "No receipt": tally.none,
          };
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
          <Th align="right">Participants</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.pack}>
            <Td>
              {row.title}
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
      title="Acknowledgement by pack"
      subtitle="Per-participant receipt and read status for each pack that has gone out. A pack nobody has opened is not a pack that has been circulated."
      keys={keys}
      table={table}
    >
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No pack has been released yet.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(170, rows.length * 62)}>
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
              width={128}
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
                stackId="ack"
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
