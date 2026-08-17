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
import { ROLE_GROUPS, rolePermissions } from "@/data/identityAccess";
import type { CabinetUser } from "@/models/response/base-response";

interface Row {
  group: string;
  active: number;
  total: number;
  ceiling: string;
}

function RoleTooltip({ active, payload }: TooltipContentProps) {
  const row = payload?.[0]?.payload as Row | undefined;
  if (!active || !row) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
      <p className="font-medium text-neutral-900 dark:text-neutral-100">{row.group}</p>
      <p className="mt-1.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {row.active}
        </span>{" "}
        <span className="text-neutral-500 dark:text-neutral-400">
          active of {row.total} accounts
        </span>
      </p>
      <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
        Ceiling: {row.ceiling}
      </p>
    </div>
  );
}

/**
 * One measure, one hue: the bars are seven names, not seven series, so colouring
 * them apart would spend the identity channel on something the labels already
 * carry.
 */
export default function RoleMixChart({ users }: { users: CabinetUser[] }) {
  const rows = useMemo<Row[]>(
    () =>
      ROLE_GROUPS.map((group) => {
        const held = users.filter((u) => u.role === group);
        return {
          group,
          active: held.filter((u) => u.status === "Active").length,
          total: held.length,
          ceiling: rolePermissions(group).classificationCeiling,
        };
      }),
    [users],
  );

  const table = (
    <Table>
      <thead>
        <tr>
          <Th>Role group</Th>
          <Th align="right">Active</Th>
          <Th align="right">Accounts</Th>
          <Th>Classification ceiling</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.group}>
            <Td>{row.group}</Td>
            <Td align="right">
              <span className="font-mono">{row.active}</span>
            </Td>
            <Td align="right">
              <span className="font-mono">{row.total}</span>
            </Td>
            <Td>{row.ceiling}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <ChartFrame
      title="Active accounts by role group"
      subtitle="The seven role groups of proposal Section 13. A group with no active account still holds its permission set — it is a rule waiting for a user, not an absence."
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
            dataKey="group"
            width={150}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--viz-axis)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.35 }}
            content={RoleTooltip}
          />
          <Bar
            dataKey="active"
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
