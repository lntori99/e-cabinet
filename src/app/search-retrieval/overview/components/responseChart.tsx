"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import ChartFrame, { ChartTooltip } from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { SEARCH_THRESHOLD_MS } from "@/data/archive";
import type { QueryLogEntry } from "@/models/response/base-response";
import { overThreshold } from "../../components/searchEngine";

/**
 * FR-SCH-08 — response time against the NFR-PER-04 threshold. One measure, one
 * series, so no legend and one hue: the query is named on the axis beside its
 * own bar. The threshold is a reference line rather than a second colour,
 * because a bar over it is a fact about the line, not a category of its own.
 */
export default function ResponseChart({ log }: { log: QueryLogEntry[] }) {
  const rows = useMemo(
    () =>
      [...log]
        .slice(0, 8)
        .reverse()
        .map((entry) => ({
          label: entry.query || "(filters only)",
          ms: entry.elapsedMs,
          at: entry.at,
          results: entry.resultCount,
          actor: entry.actor,
        })),
    [log],
  );

  const breaches = rows.filter((row) => overThreshold(row.ms));

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Query</Th>
          <Th>Ran by</Th>
          <Th align="right">Results</Th>
          <Th align="right">Elapsed</Th>
          <Th>Against threshold</Th>
        </tr>
      </thead>
      <tbody>
        {[...rows].reverse().map((row) => (
          <tr key={`${row.at}-${row.label}`}>
            <Td>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {row.label}
              </span>
              <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {stamp(row.at)}
              </span>
            </Td>
            <Td>{row.actor}</Td>
            <Td align="right">
              <span className="font-mono">{row.results}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{row.ms.toLocaleString()} ms</span>
            </Td>
            <Td>
              <span
                className="inline-flex items-center gap-1.5"
                style={{
                  color: overThreshold(row.ms)
                    ? "var(--viz-critical)"
                    : "var(--viz-good)",
                }}
              >
                {overThreshold(row.ms) ? (
                  <FiAlertTriangle size={12} aria-hidden="true" />
                ) : (
                  <FiCheckCircle size={12} aria-hidden="true" />
                )}
                {overThreshold(row.ms) ? "Over" : "Within"}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Search response time"
      subtitle={`The last ${rows.length} queries, oldest first. The dashed line marks the NFR-PER-04 threshold of ${SEARCH_THRESHOLD_MS.toLocaleString()} ms — a bar past it is a query somebody waited on.`}
      table={table}
    >
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No query has been run yet.
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid horizontal={false} stroke="var(--viz-grid)" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
                tickFormatter={(value: number) => `${value.toLocaleString()}`}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={150}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
              />
              {/* Unlabelled and dashed: the threshold sits near the right edge,
                  so any label on the line itself is clipped. It is named in the
                  key below the plot instead, where it has room. */}
              <ReferenceLine
                x={SEARCH_THRESHOLD_MS}
                stroke="var(--viz-axis)"
                strokeDasharray="4 3"
              />
              <Tooltip
                cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
                content={ChartTooltip}
              />
              <Bar
                dataKey="ms"
                name="Elapsed (ms)"
                fill="var(--viz-1)"
                isAnimationActive={false}
                maxBarSize={16}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
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
            NFR-PER-04 threshold · {SEARCH_THRESHOLD_MS.toLocaleString()} ms
          </p>

          {breaches.length > 0 && (
            <p
              className="mt-3 flex items-start gap-2 text-sm"
              style={{ color: "var(--viz-critical)" }}
            >
              <FiAlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                {breaches.length} of the last {rows.length} queries missed the
                threshold. Each was a full-text search across scanned annexes,
                which is the slowest shape of query the index answers.
              </span>
            </p>
          )}
        </>
      )}
    </ChartFrame>
  );
}
