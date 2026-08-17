"use client";

import type { ReactNode } from "react";
import { FiAlertTriangle, FiCalendar, FiTrendingUp, FiUser } from "react-icons/fi";
import { StatusBadge } from "@/common/ui";
import type { ActionRecord } from "@/models/response/base-response";
import {
  ACTION_TONE,
  STANDING_TONE,
  deadlineWords,
  standing,
} from "./decisionStatus";

/**
 * One action, written the same way wherever it appears. The Secretariat and the
 * ministries look at the same record from opposite ends, so the facts are laid
 * out identically and only the controls beside them differ.
 */
export default function ActionRow({
  item,
  today,
  decisionTitle,
  controls,
  children,
}: {
  item: ActionRecord;
  today: string;
  /** The agenda item the action came out of, where the caller knows it. */
  decisionTitle?: string;
  controls?: ReactNode;
  children?: ReactNode;
}) {
  const where = standing(item, today);

  return (
    <article className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {item.id} · {item.decisionId}
            {decisionTitle ? ` · ${decisionTitle}` : ""}
          </p>
          <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
            {item.description}
          </h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {item.instructions}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <StatusBadge tone={ACTION_TONE[item.state]}>{item.state}</StatusBadge>
          {where !== "Closed" && (
            <StatusBadge tone={STANDING_TONE[where]}>{where}</StatusBadge>
          )}
        </div>
      </header>

      <div className="grid gap-x-6 gap-y-2 px-5 py-3.5 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Fact icon={FiUser} label="Responsible officer" value={item.officer} />
        <Fact icon={FiUser} label="Ministry" value={item.ministry} />
        <Fact
          icon={FiCalendar}
          label="Deadline"
          value={
            <span
              style={{
                color: where === "Overdue" ? "var(--viz-critical)" : undefined,
              }}
            >
              {item.deadline}
              {/* A closed action is not late, whatever the arithmetic says —
                  what matters once it is shut is when it was shut. */}
              {where === "Closed"
                ? item.closedAt
                  ? ` · closed ${item.closedAt.slice(0, 10)}`
                  : ""
                : ` · ${deadlineWords(item.deadline, today)}`}
            </span>
          }
        />
        <Fact
          icon={item.escalated ? FiAlertTriangle : FiTrendingUp}
          label="Escalation point"
          value={
            item.escalated ? (
              <span style={{ color: "var(--viz-critical)" }}>
                With {item.escalationPoint}
              </span>
            ) : (
              item.escalationPoint
            )
          }
        />
      </div>

      {children}

      {controls && (
        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
          {controls}
        </footer>
      )}
    </article>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FiUser;
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className="mt-0.5 inline-flex items-start gap-1.5 text-neutral-800 dark:text-neutral-200">
        <Icon size={13} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        {value}
      </p>
    </div>
  );
}
