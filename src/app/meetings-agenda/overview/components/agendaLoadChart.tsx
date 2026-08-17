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
import { AGENDA_ITEM_TYPES } from "@/data/meetingTypes";
import type { Meeting } from "@/models/response/base-response";
import { Table, Td, Th } from "@/common/table";
import ChartFrame, { ChartTooltip, type SeriesKey } from "@/common/chartFrame";

/**
 * Colour follows the item type, never its size on the day — the slot comes from
 * the type's fixed position in the configured list, so a sitting with no policy
 * papers does not hand slot 1 to something else.
 */
const SLOT = new Map(
  AGENDA_ITEM_TYPES.map((type, index) => [type.name, `var(--viz-${index + 1})`]),
);

type Row = { title: string; sitting: string } & Record<string, string | number>;

export default function AgendaLoadChart({ sittings }: { sittings: Meeting[] }) {
  const { rows, present } = useMemo(() => {
    const rows: Row[] = sittings.map((m) => {
      const row: Row = { title: m.title, sitting: m.id };
      for (const type of AGENDA_ITEM_TYPES) {
        row[type.name] = m.agenda.filter((i) => i.type === type.name).length;
      }
      return row;
    });

    // A type with nothing on any agenda keeps its slot but stays out of the key.
    const present = AGENDA_ITEM_TYPES.filter((type) =>
      rows.some((row) => Number(row[type.name]) > 0),
    ).map((type) => type.name);

    return { rows, present };
  }, [sittings]);

  const keys: SeriesKey[] = present.map((name) => ({
    label: name,
    color: SLOT.get(name) ?? "var(--viz-1)",
  }));

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Sitting</Th>
          {present.map((name) => (
            <Th key={name} align="right">
              {name}
            </Th>
          ))}
          <Th align="right">Total</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.sitting}>
            <Td>
              {row.title}
              <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {row.sitting}
              </span>
            </Td>
            {present.map((name) => (
              <Td key={name} align="right">
                <span className="font-mono">{row[name]}</span>
              </Td>
            ))}
            <Td align="right">
              <span className="font-mono font-semibold">
                {present.reduce((sum, name) => sum + Number(row[name]), 0)}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Agenda load by sitting"
      subtitle="How many items each upcoming sitting is carrying, and of what kind. Policy papers and decision items are the ones that expect a paper before the window shuts."
      keys={keys}
      table={table}
    >
      {rows.length === 0 || present.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No upcoming sitting has an agenda item yet.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(190, rows.length * 62)}>
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
              dataKey="sitting"
              width={104}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
              content={ChartTooltip}
            />
            {AGENDA_ITEM_TYPES.filter((type) => present.includes(type.name)).map(
              (type) => (
                <Bar
                  key={type.name}
                  dataKey={type.name}
                  stackId="load"
                  fill={SLOT.get(type.name)}
                  stroke="var(--viz-surface)"
                  strokeWidth={2}
                  isAnimationActive={false}
                  maxBarSize={22}
                  radius={[0, 4, 4, 0]}
                />
              ),
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}
