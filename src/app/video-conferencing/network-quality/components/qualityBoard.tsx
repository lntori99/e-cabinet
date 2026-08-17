"use client";

import { useState } from "react";
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
import { FiActivity, FiZap } from "react-icons/fi";
import ChartFrame, { ChartTooltip } from "@/common/chartFrame";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectVideoSessions } from "@/core/slices/video-slice";
import { QUALITY_TONE, meanBitrate, worstLoss } from "../../components/videoStatus";

const ACCEPTABLE_LOSS = 2;

/**
 * Two measures, two charts. Bitrate is in thousands of kilobits and loss is a
 * single-digit percentage — on one axis the loss line would lie flat on the
 * baseline and say nothing, so they are plotted separately against a shared
 * x-axis instead of forced onto a second scale.
 */
export default function QualityBoard() {
  const sessions = useAppSelector(selectVideoSessions);
  const withQuality = sessions.filter((s) => s.quality.length > 0);
  const [selectedId, setSelectedId] = useState(withQuality[0]?.id ?? "");

  const session =
    withQuality.find((s) => s.id === selectedId) ?? withQuality[0] ?? null;

  if (!session) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        No session has run long enough to report quality history.
      </p>
    );
  }

  const table = (
    <Table>
      <thead>
        <tr>
          <Th align="right">Minute</Th>
          <Th align="right">Bitrate</Th>
          <Th align="right">Packet loss</Th>
          <Th align="right">Latency</Th>
        </tr>
      </thead>
      <tbody>
        {session.quality.map((sample) => (
          <tr key={sample.minute}>
            <Td align="right">
              <span className="font-mono">{sample.minute}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{sample.bitrateKbps.toLocaleString()} kbps</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{sample.packetLossPercent}%</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{sample.latencyMs} ms</span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  const axis = (
    <>
      <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
      <XAxis
        dataKey="minute"
        tickLine={false}
        axisLine={false}
        tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
        tickFormatter={(value: number) => `${value}m`}
      />
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5">
        {withQuality.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            aria-pressed={item.id === session.id}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              item.id === session.id
                ? "border-state-600 bg-state-600 text-white"
                : "border-neutral-300 text-neutral-600 hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
            }`}
          >
            {item.meetingTitle}
          </button>
        ))}
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              {session.id} · {session.meetingId}
            </p>
            <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
              {session.meetingTitle}
            </h2>
          </div>
          <StatusBadge tone={QUALITY_TONE[session.qualityRating]}>
            {session.qualityRating}
          </StatusBadge>
        </header>

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="space-y-0.5">
            <DetailRow
              label="Mean bitrate"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <FiZap size={12} className="text-neutral-400" aria-hidden="true" />
                  {meanBitrate(session).toLocaleString()} kbps
                </span>
              }
            />
            <DetailRow
              label="Worst packet loss"
              value={
                <span
                  style={{
                    color:
                      worstLoss(session) > ACCEPTABLE_LOSS
                        ? "var(--viz-critical)"
                        : undefined,
                  }}
                >
                  {worstLoss(session)}%
                </span>
              }
            />
          </div>
          <div className="space-y-0.5">
            <DetailRow label="Samples" value={`${session.quality.length} · every 10 minutes`} />
            <DetailRow
              label="Prioritisation"
              value="QoS marked at the edge; conferencing takes precedence over bulk transfer"
            />
          </div>
        </div>
      </section>

      <ChartFrame
        title="Adaptive bitrate"
        subtitle="What the encoder settled on as the link changed. A dip here is the platform protecting audio at the expense of picture, which is the right trade in a Cabinet sitting."
        table={table}
      >
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={session.quality} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            {axis}
            <YAxis
              width={52}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
              tickFormatter={(value: number) => `${value / 1000}k`}
            />
            <Tooltip
              cursor={{ stroke: "var(--viz-axis)", strokeWidth: 1 }}
              content={ChartTooltip}
            />
            <Line
              type="monotone"
              dataKey="bitrateKbps"
              name="Bitrate (kbps)"
              stroke="var(--viz-1)"
              strokeWidth={2}
              strokeLinecap="round"
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 4, fill: "var(--viz-1)", stroke: "var(--viz-surface)", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame
        title="Packet loss"
        subtitle={`The measure that decides whether people can hear each other. The line marks ${ACCEPTABLE_LOSS}% — above it, voice starts to break up.`}
        table={
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            The same samples are tabulated under the bitrate chart above.
          </p>
        }
      >
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={session.quality} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            {axis}
            <YAxis
              width={52}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
              tickFormatter={(value: number) => `${value.toFixed(1)}%`}
            />
            <ReferenceLine
              y={ACCEPTABLE_LOSS}
              stroke="var(--viz-axis)"
              label={{
                value: `${ACCEPTABLE_LOSS}% — voice breaks up`,
                position: "insideTopLeft",
                fill: "var(--viz-axis)",
                fontSize: 11,
              }}
            />
            <Tooltip
              cursor={{ stroke: "var(--viz-axis)", strokeWidth: 1 }}
              content={ChartTooltip}
            />
            <Line
              type="monotone"
              dataKey="packetLossPercent"
              name="Packet loss (%)"
              stroke="var(--viz-critical)"
              strokeWidth={2}
              strokeLinecap="round"
              dot={false}
              isAnimationActive={false}
              activeDot={{
                r: 4,
                fill: "var(--viz-critical)",
                stroke: "var(--viz-surface)",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <FiActivity size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        Bitrate and loss are plotted separately on purpose. They share an x-axis
        but not a scale — on one axis the loss line would sit flat against the
        baseline and tell you nothing.
      </p>
    </div>
  );
}
