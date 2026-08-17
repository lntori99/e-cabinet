"use client";

import { FiAlertTriangle, FiBell, FiCheckCircle, FiClock, FiX } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectWindows } from "@/core/slices/admin-slice";
import { cancelWindow, notifyWindow } from "@/core/thunks-admin";
import type { MaintenanceWindow } from "@/models/response/base-response";

const AUDIENCE = ["Cabinet Members", "Secretariat", "Ministry Submitters"];

const STATE_TONE: Record<
  MaintenanceWindow["state"],
  "green" | "amber" | "red" | "neutral" | "blue"
> = {
  Scheduled: "amber",
  "In progress": "blue",
  Completed: "green",
  Cancelled: "neutral",
};

/**
 * FR-ADM-10 — scheduled windows, with participant notification and graceful
 * suspension. The clash check is the part that earns the screen: a window that
 * takes conferencing down during a Cabinet sitting is technically a valid
 * window and practically a disaster.
 */
export default function MaintenanceBoard() {
  const dispatch = useAppDispatch();
  const windows = useAppSelector(selectWindows);

  const upcoming = windows.filter(
    (w) => w.state === "Scheduled" || w.state === "In progress",
  );
  const past = windows.filter(
    (w) => w.state === "Completed" || w.state === "Cancelled",
  );

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-bold">Scheduled</h2>
        {upcoming.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              icon={FiCheckCircle}
              title="Nothing is scheduled"
              description="No maintenance window is planned. Windows appear here as they are raised."
            />
          </div>
        ) : (
          upcoming.map((window) => (
            <WindowCard
              key={window.id}
              window={window}
              onNotify={() => dispatch(notifyWindow(window, AUDIENCE))}
              onCancel={() =>
                dispatch(
                  cancelWindow(
                    window,
                    window.clashesWith
                      ? "Withdrawn — collided with a sitting"
                      : "Withdrawn by the administrator",
                  ),
                )
              }
            />
          ))
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-bold">Past</h2>
          {past.map((window) => (
            <WindowCard key={window.id} window={window} />
          ))}
        </section>
      )}
    </div>
  );
}

function WindowCard({
  window,
  onNotify,
  onCancel,
}: {
  window: MaintenanceWindow;
  onNotify?: () => void;
  onCancel?: () => void;
}) {
  const open = window.state === "Scheduled" || window.state === "In progress";

  return (
    <article
      className="rounded-lg border bg-white dark:bg-neutral-900"
      style={{
        borderColor: window.clashesWith
          ? "var(--viz-critical)"
          : open && !window.notifiedAt
            ? "var(--viz-warning)"
            : "var(--viz-grid)",
      }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {window.id} · FR-ADM-10
          </p>
          <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
            {window.title}
          </h3>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            <FiClock size={13} className="text-neutral-400" aria-hidden="true" />
            {stamp(window.startsAt)} to {stamp(window.endsAt)}
          </p>
        </div>
        <StatusBadge tone={STATE_TONE[window.state]}>{window.state}</StatusBadge>
      </header>

      {window.clashesWith && (
        <p
          className="flex items-start gap-2 border-b px-5 py-3 text-sm"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <FiAlertTriangle
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-critical)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            This window collides with {window.clashesWith}. Taking conferencing
            down during a sitting is a valid window and an unusable one — move it
            or withdraw it.
          </span>
        </p>
      )}

      <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
        <div className="space-y-0.5">
          <DetailRow label="Affects" value={window.affectedServices.join(", ")} />
          <DetailRow
            label="Suspension"
            value={
              window.gracefulSuspension
                ? "Graceful — sessions are drained, not dropped"
                : "Immediate"
            }
          />
          <DetailRow label="Raised by" value={window.raisedBy} />
        </div>
        <div className="space-y-0.5">
          <DetailRow
            label="Notified"
            value={
              window.notifiedAt ? (
                stamp(window.notifiedAt)
              ) : (
                <span style={{ color: "var(--viz-warning)" }}>Not yet</span>
              )
            }
          />
          <DetailRow
            label="Who was told"
            value={
              window.notifiedGroups.length > 0
                ? window.notifiedGroups.join(", ")
                : "Nobody yet"
            }
          />
        </div>
      </div>

      {open && (onNotify || onCancel) && (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Notification goes out through FR-NOT, to the same named groups as any
            other platform notice.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
              >
                <FiX size={14} aria-hidden="true" />
                Withdraw
              </button>
            )}
            {onNotify && (
              <button
                type="button"
                onClick={onNotify}
                className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800"
              >
                <FiBell size={14} aria-hidden="true" />
                {window.notifiedAt ? "Notify again" : "Notify participants"}
              </button>
            )}
          </div>
        </footer>
      )}
    </article>
  );
}
