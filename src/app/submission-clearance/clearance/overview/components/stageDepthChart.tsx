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
import type { TooltipContentProps } from "recharts";
import ChartFrame from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import { CLEARANCE_STAGES } from "@/data/submissionClearance";
import type { Submission } from "@/models/response/base-response";

interface Row {
  stage: string;
  waiting: number;
  overdue: number;
  cleared: number;
}

function DepthTooltip({ active, payload }: TooltipContentProps) {
  const row = payload?.[0]?.payload as Row | undefined;
  if (!active || !row) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
      <p className="font-medium text-neutral-900 dark:text-neutral-100">{row.stage}</p>
      <p className="mt-1.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {row.waiting}
        </span>{" "}
        <span className="text-neutral-500 dark:text-neutral-400">
          waiting on a decision
        </span>
      </p>
      <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
        {row.overdue} past service time · {row.cleared} cleared this cycle
      </p>
    </div>
  );
}

/**
 * The stages are a pipeline, so the order is carried by the axis rather than by
 * colour — one measure, one hue. Depth is what a Secretariat officer reads to
 * find the stage that is holding everything up.
 */
export default function StageDepthChart({
  submissions,
  now,
}: {
  submissions: Submission[];
  now: string;
}) {
  const rows = useMemo<Row[]>(
    () =>
      CLEARANCE_STAGES.map((name) => {
        let waiting = 0;
        let overdue = 0;
        let cleared = 0;

        for (const submission of submissions) {
          for (const stage of submission.stages) {
            if (stage.stage !== name) continue;
            if (stage.status === "In progress") {
              waiting += 1;
              if (stage.dueAt && new Date(stage.dueAt) < new Date(now)) overdue += 1;
            }
            if (stage.status === "Approved") cleared += 1;
          }
        }

        return { stage: name, waiting, overdue, cleared };
      }),
    [submissions, now],
  );

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Stage</Th>
          <Th align="right">Waiting</Th>
          <Th align="right">Past service time</Th>
          <Th align="right">Cleared</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.stage}>
            <Td>{row.stage}</Td>
            <Td align="right">
              <span className="font-mono">{row.waiting}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{row.overdue}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{row.cleared}</span>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Queue depth by stage"
      subtitle="Papers sitting at each stage right now, in pipeline order. A stage that is deep is where the clearance chain is slowing down."
      table={table}
    >
      <ResponsiveContainer width="100%" height={230}>
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
            dataKey="stage"
            width={140}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
            content={DepthTooltip}
          />
          <Bar
            dataKey="waiting"
            fill="var(--viz-1)"
            isAnimationActive={false}
            maxBarSize={18}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
