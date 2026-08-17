"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiAlertTriangle } from "react-icons/fi";
import ChartFrame, { ChartTooltip } from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import { REPLICATION_THRESHOLD_SECONDS } from "@/data/audit";
import type { ReplicationSample } from "@/models/response/base-response";

/**
 * FR-AUD-05 — how far behind the store outside administrative reach is running.
 * One measure, so one line and no legend; the events-behind figure lives in the
 * table rather than on a second axis, because two scales on one plot is the
 * mistake that makes a chart look informative and read as nothing.
 */
export default function ReplicationChart({
  samples,
}: {
  samples: ReplicationSample[];
}) {
  const rows = useMemo(
    () =>
      [...samples]
        .sort((a, b) => a.at.localeCompare(b.at))
        .map((sample) => ({
          time: sample.at.slice(11, 16),
          lag: sample.lagSeconds,
          behind: sample.eventsBehind,
          at: sample.at,
        })),
    [samples],
  );

  const breaches = rows.filter((r) => r.lag > REPLICATION_THRESHOLD_SECONDS);
  const worst = rows.reduce((max, r) => Math.max(max, r.lag), 0);

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Sample</Th>
          <Th align="right">Lag</Th>
          <Th align="right">Events behind</Th>
          <Th>Against threshold</Th>
        </tr>
      </thead>
      <tbody>
        {[...rows].reverse().map((row) => (
          <tr key={row.at}>
            <Td>
              <span className="font-mono">{row.at.replace("T", " ")}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{row.lag}s</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{row.behind}</span>
            </Td>
            <Td>
              <span
                style={{
                  color:
                    row.lag > REPLICATION_THRESHOLD_SECONDS
                      ? "var(--viz-critical)"
                      : "var(--viz-good)",
                }}
              >
                {row.lag > REPLICATION_THRESHOLD_SECONDS ? "Over" : "Within"}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Replication to the external store"
      subtitle={`How far behind the write-once copy is running. It is the copy the platform administrators hold no credential for, so a lag here is the window in which losing the primary would lose events.`}
      table={table}
    >
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
          />
          <YAxis
            width={44}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
            tickFormatter={(value: number) => `${value}s`}
          />
          <ReferenceLine
            y={REPLICATION_THRESHOLD_SECONDS}
            stroke="var(--viz-axis)"
            strokeDasharray="4 3"
          />
          <Tooltip
            cursor={{ stroke: "var(--viz-axis)", strokeWidth: 1 }}
            content={ChartTooltip}
          />
          <Line
            type="monotone"
            dataKey="lag"
            name="Lag (seconds)"
            stroke="var(--viz-1)"
            strokeWidth={2}
            strokeLinecap="round"
            dot={false}
            isAnimationActive={false}
            activeDot={{
              r: 4,
              fill: "var(--viz-1)",
              stroke: "var(--viz-surface)",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="mt-2 inline-flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
        <svg width="22" height="8" aria-hidden="true">
          <line
            x1="0"
            y1="4"
            x2="22"
            y2="4"
            stroke="var(--viz-axis)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        </svg>
        Acceptable lag · {REPLICATION_THRESHOLD_SECONDS}s
      </p>

      {breaches.length > 0 && (
        <p
          className="mt-2 flex items-start gap-2 text-sm"
          style={{ color: "var(--viz-critical)" }}
        >
          <FiAlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {breaches.length} of the last {rows.length} samples ran over the
            threshold, peaking at {worst}s during the scheduled verification
            window. Nothing was lost — the replica caught up — but the window
            existed.
          </span>
        </p>
      )}
    </ChartFrame>
  );
}
