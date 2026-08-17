"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { FiAlertTriangle, FiCheckCircle, FiClock } from "react-icons/fi";
import ChartFrame from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import type { VideoSession } from "@/models/response/base-response";
import { QUALITY_COLOR, meanBitrate, worstLoss } from "../../components/videoStatus";

/** Above this, voice starts to break up for somebody in the meeting. */
const ACCEPTABLE_LOSS = 2;

interface Row {
  session: string;
  title: string;
  loss: number;
  bitrate: number;
  rating: VideoSession["qualityRating"];
  tone: string;
}

const KEY = [
  { label: "Good", icon: FiCheckCircle, color: QUALITY_COLOR.Good },
  { label: "Fair", icon: FiClock, color: QUALITY_COLOR.Fair },
  { label: "Poor", icon: FiAlertTriangle, color: QUALITY_COLOR.Poor },
];

function QualityTooltip({ active, payload }: TooltipContentProps) {
  const row = payload?.[0]?.payload as Row | undefined;
  if (!active || !row) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
      <p className="font-medium text-neutral-900 dark:text-neutral-100">{row.title}</p>
      <p className="mt-1.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {row.loss}%
        </span>{" "}
        <span className="text-neutral-500 dark:text-neutral-400">
          worst packet loss · {row.rating.toLowerCase()}
        </span>
      </p>
      <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
        Mean bitrate {row.bitrate.toLocaleString()} kbps
      </p>
    </div>
  );
}

/**
 * The worst sample rather than the average: a call that was perfect for fifty
 * minutes and unusable for five is remembered for the five.
 */
export default function QualityChart({ sessions }: { sessions: VideoSession[] }) {
  const rows = useMemo<Row[]>(
    () =>
      sessions
        .filter((s) => s.quality.length > 0)
        .map((session) => ({
          session: session.id,
          title: session.meetingTitle,
          loss: Math.round(worstLoss(session) * 10) / 10,
          bitrate: meanBitrate(session),
          rating: session.qualityRating,
          tone: QUALITY_COLOR[session.qualityRating],
        }))
        .sort((a, b) => b.loss - a.loss),
    [sessions],
  );

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Session</Th>
          <Th align="right">Worst loss</Th>
          <Th align="right">Mean bitrate</Th>
          <Th>Rating</Th>
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
            <Td align="right">
              <span className="font-mono">{row.loss}%</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{row.bitrate.toLocaleString()}</span>
            </Td>
            <Td>{row.rating}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Worst packet loss, by session"
      subtitle={`The worst minute of each session rather than its average. The line marks ${ACCEPTABLE_LOSS}% — above it, somebody in the meeting heard voice break up.`}
      table={table}
    >
      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
        {KEY.map(({ label, icon: Icon, color }) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300"
          >
            <Icon size={13} style={{ color }} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No session has run long enough to report quality.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, rows.length * 62)}>
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="var(--viz-grid)" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
              tickFormatter={(value: number) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="session"
              width={112}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
            />
            <ReferenceLine x={ACCEPTABLE_LOSS} stroke="var(--viz-axis)" />
            <Tooltip
              cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
              content={QualityTooltip}
            />
            <Bar
              dataKey="loss"
              isAnimationActive={false}
              maxBarSize={20}
              radius={[0, 4, 4, 0]}
            >
              {rows.map((row) => (
                <Cell key={row.session} fill={row.tone} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}
