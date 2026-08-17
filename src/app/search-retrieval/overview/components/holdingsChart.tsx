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
import type { ArchiveRecord } from "@/models/response/base-response";
import { ALL_KINDS, KIND_COLOR } from "../../components/searchEngine";

type Row = { year: string } & Record<string, string | number>;

/**
 * FR-SCH-02 governs this chart as much as it governs the result list: the
 * corpus handed in has already been through the entitlement filter, so a record
 * the viewer may not see does not make a bar one pixel taller. A count is
 * metadata, and metadata about an unauthorised document is exactly what the
 * requirement forbids.
 */
export default function HoldingsChart({ records }: { records: ArchiveRecord[] }) {
  const rows = useMemo<Row[]>(() => {
    const years = [...new Set(records.map((r) => r.date.slice(0, 4)))]
      .filter(Boolean)
      .sort();
    return years.map((year) => {
      const inYear = records.filter((r) => r.date.startsWith(year));
      const row: Row = { year };
      for (const kind of ALL_KINDS) {
        row[kind] = inYear.filter((r) => r.kind === kind).length;
      }
      return row;
    });
  }, [records]);

  const keys: SeriesKey[] = ALL_KINDS.map((kind) => ({
    label: kind,
    color: KIND_COLOR[kind],
  }));

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Year</Th>
          {ALL_KINDS.map((kind) => (
            <Th key={kind} align="right">
              {kind}s
            </Th>
          ))}
          <Th align="right">Total</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row.year)}>
            <Td>
              <span className="font-mono">{row.year}</span>
            </Td>
            {ALL_KINDS.map((kind) => (
              <Td key={kind} align="right">
                <span className="font-mono">{row[kind]}</span>
              </Td>
            ))}
            <Td align="right">
              <span className="font-mono font-semibold">
                {ALL_KINDS.reduce((sum, kind) => sum + Number(row[kind]), 0)}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="What the archive holds, by year"
      subtitle="Papers, decisions and actions are three kinds of record, not three stages of one, so each keeps its own colour wherever it appears. Only what you are entitled to see is counted here."
      keys={keys}
      table={table}
    >
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          The archive is empty.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
            />
            <YAxis
              width={32}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
              content={ChartTooltip}
            />
            {ALL_KINDS.map((kind, index) => (
              <Bar
                key={kind}
                dataKey={kind}
                stackId="holdings"
                fill={KIND_COLOR[kind]}
                stroke="var(--viz-surface)"
                strokeWidth={2}
                isAnimationActive={false}
                maxBarSize={38}
                radius={index === ALL_KINDS.length - 1 ? [4, 4, 0, 0] : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}
