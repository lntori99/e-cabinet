"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiInbox,
} from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectCentre } from "@/core/slices/notification-slice";
import { markAllRead, markRead } from "@/core/thunks-notifications";
import {
  TRIGGER_REQUIREMENT,
  triggerTone,
} from "../../components/notificationStatus";

type Cut = "Outstanding" | "Everything";

/**
 * FR-NOT-09 — the in-platform centre. It opens on what is outstanding rather
 * than on everything, because the question a Minister has at nine in the
 * morning is what is waiting on them, not what they have already read.
 */
export default function CentreBoard({ today }: { today: string }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCentre);
  const [cut, setCut] = useState<Cut>("Outstanding");

  const shown = cut === "Outstanding" ? items.filter((i) => !i.read) : items;
  const unread = items.filter((i) => !i.read).length;
  const actionable = items.filter((i) => !i.read && i.actionable).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(["Outstanding", "Everything"] as Cut[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCut(option)}
              aria-pressed={cut === option}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                cut === option
                  ? "border-state-600 bg-state-600 text-white"
                  : "border-neutral-300 text-neutral-600 hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
              }`}
            >
              {option}
              {option === "Outstanding" ? ` · ${unread}` : ` · ${items.length}`}
            </button>
          ))}
        </div>

        {unread > 0 && (
          <button
            type="button"
            onClick={() => dispatch(markAllRead())}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
          >
            <FiCheck size={14} aria-hidden="true" />
            Mark all read
          </button>
        )}
      </div>

      {actionable > 0 && (
        <p
          className="flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--viz-warning)" }}
        >
          <FiClock
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-warning)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            {actionable} of these {actionable === 1 ? "is" : "are"} waiting on you
            to do something rather than only to read it.
          </span>
        </p>
      )}

      {shown.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={FiCheckCircle}
            title="Nothing is outstanding"
            description="You have read everything addressed to you. New items arrive here as events happen."
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((item) => {
            const overdue = item.dueAt !== undefined && item.dueAt < today;

            return (
              <li
                key={item.id}
                className="rounded-lg border bg-white dark:bg-neutral-900"
                style={{
                  borderColor: item.read
                    ? "var(--viz-grid)"
                    : overdue
                      ? "var(--viz-critical)"
                      : "var(--viz-warning)",
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {TRIGGER_REQUIREMENT[item.trigger]} · {stamp(item.at)}
                    </p>
                    <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                      {item.headline}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {item.detail}
                    </p>
                    {item.dueAt && (
                      <p
                        className="mt-1 inline-flex items-center gap-1.5 text-xs"
                        style={{
                          color: overdue ? "var(--viz-critical)" : undefined,
                        }}
                      >
                        <FiClock size={11} aria-hidden="true" />
                        {overdue ? "Was due" : "Due"} {item.dueAt}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <StatusBadge tone={triggerTone(item.trigger)}>
                      {item.trigger}
                    </StatusBadge>
                    {!item.read && <StatusBadge tone="amber">Unread</StatusBadge>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    The material is not in this notice. Following the link opens
                    it inside the platform, where your entitlements decide what
                    you see.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => dispatch(markRead(item.id))}
                        className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
                      >
                        <FiCheck size={14} aria-hidden="true" />
                        Mark read
                      </button>
                    )}
                    <Link
                      href={item.deepLink}
                      onClick={() => dispatch(markRead(item.id))}
                      className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800"
                    >
                      {item.linkLabel}
                      <FiArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <FiInbox size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        FR-NOT-07 — every item here is a pointer. Nothing in the centre carries
        the material, in the same way that nothing in an email does.
      </p>
    </div>
  );
}
