"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import ChartFrame from "@/common/chartFrame";
import { Table, Td, Th } from "@/common/table";
import type { Classification } from "@/core/app-constants";
import { handlingRule } from "@/data/documentSecurity";
import type { CabinetDocument } from "@/models/response/base-response";
import {
  CLASSIFICATION_ORDER,
  CLASSIFICATION_STEP,
} from "../../components/docStatus";

interface Row {
  label: string;
  documents: number;
  step: string;
  download: string;
  print: string;
}

function ClassificationTooltip({ active, payload }: TooltipContentProps) {
  const row = payload?.[0]?.payload as Row | undefined;
  if (!active || !row) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
      <p className="font-medium text-neutral-900 dark:text-neutral-100">{row.label}</p>
      <p className="mt-1.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {row.documents}
        </span>{" "}
        <span className="text-neutral-500 dark:text-neutral-400">
          document{row.documents === 1 ? "" : "s"} on the register
        </span>
      </p>
      <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
        Download {row.download.toLowerCase()} · print {row.print.toLowerCase()}
      </p>
    </div>
  );
}

/**
 * Classification is ordinal — the labels rank from strongest to weakest — so the
 * bars take one hue in monotone steps. The reader sees the order in the colour
 * as well as in the axis, which is the point: a chart of Cabinet material should
 * make the top of the scale look like the top of the scale.
 */
export default function ClassificationChart({
  documents,
}: {
  documents: CabinetDocument[];
}) {
  const rows = useMemo<Row[]>(
    () =>
      CLASSIFICATION_ORDER.map((label) => {
        const rule = handlingRule(label);
        return {
          label,
          documents: documents.filter((d) => d.classification === label).length,
          step: CLASSIFICATION_STEP[label as Classification],
          download: rule.download,
          print: rule.print,
        };
      }),
    [documents],
  );

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Classification</Th>
          <Th align="right">Documents</Th>
          <Th>Download</Th>
          <Th>Print</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <Td>{row.label}</Td>
            <Td align="right">
              <span className="font-mono">{row.documents}</span>
            </Td>
            <Td>{row.download}</Td>
            <Td>{row.print}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Documents by classification"
      subtitle="Every paper on the register carries a label — FR-DOC-01 does not permit a document to exist without one. The label is what decides who may open it, download it or print it."
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
            dataKey="label"
            width={150}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
            content={ClassificationTooltip}
          />
          <Bar
            dataKey="documents"
            isAnimationActive={false}
            maxBarSize={20}
            radius={[0, 4, 4, 0]}
          >
            {rows.map((row) => (
              <Cell key={row.label} fill={row.step} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
