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
import type { JoinMode, VideoAttendance, VideoSession } from "@/models/response/base-response";
import { MODE_COLOR } from "../../components/videoStatus";

const MODES: JoinMode[] = ["In the room", "Remote", "External"];

type Row = { session: string; title: string } & Record<string, string | number>;

/**
 * FR-VID-16 — one participant list whether somebody is in the room or dialling
 * in. Plotting the two together is the point: a hybrid sitting has one
 * attendance record, and this is what it looks like.
 */
export default function ParticipationChart({
  sessions,
  attendance,
}: {
  sessions: VideoSession[];
  attendance: VideoAttendance[];
}) {
  const rows = useMemo<Row[]>(
    () =>
      sessions
        .map((session) => {
          const people = attendance.filter(
            (a) => a.sessionId === session.id && a.state !== "Refused",
          );
          if (people.length === 0) return null;
          const row: Row = { session: session.id, title: session.meetingTitle };
          for (const mode of MODES) {
            row[mode] = people.filter((p) => p.mode === mode).length;
          }
          return row;
        })
        .filter((row): row is Row => row !== null),
    [sessions, attendance],
  );

  const keys: SeriesKey[] = MODES.map((mode) => ({
    label: mode,
    color: MODE_COLOR[mode],
  }));

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Session</Th>
          {MODES.map((mode) => (
            <Th key={mode} align="right">
              {mode}
            </Th>
          ))}
          <Th align="right">Total</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.session}>
            <Td>
              {row.title}
              <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {row.session}
              </span>
            </Td>
            {MODES.map((mode) => (
              <Td key={mode} align="right">
                <span className="font-mono">{row[mode]}</span>
              </Td>
            ))}
            <Td align="right">
              <span className="font-mono font-semibold">
                {MODES.reduce((sum, mode) => sum + Number(row[mode]), 0)}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Participation, room and remote"
      subtitle="One participant list per sitting, however people joined. External participation is counted separately because it is exceptional — pre-approved, identity-verified and scoped to the item authorised."
      keys={keys}
      table={table}
    >
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          Nobody has joined a session yet.
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
              dataKey="session"
              width={112}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
              content={ChartTooltip}
            />
            {MODES.map((mode) => (
              <Bar
                key={mode}
                dataKey={mode}
                stackId="participation"
                fill={MODE_COLOR[mode]}
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
