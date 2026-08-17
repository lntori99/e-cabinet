"use client";

import {
  FiAlertTriangle,
  FiCheckCircle,
  FiMonitor,
  FiSlash,
} from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { classifyAction } from "@/data/audit";
import type { AuditEvent, AuditOutcome } from "@/models/response/base-response";

export const SEVERITY_TONE: Record<AuditEvent["severity"], "green" | "amber" | "red"> = {
  info: "green",
  warning: "amber",
  critical: "red",
};

const OUTCOME_COLOR: Record<AuditOutcome, string> = {
  Success: "var(--viz-good)",
  Denied: "var(--viz-warning)",
  Failed: "var(--viz-critical)",
};

const OUTCOME_ICON: Record<AuditOutcome, typeof FiCheckCircle> = {
  Success: FiCheckCircle,
  Denied: FiSlash,
  Failed: FiAlertTriangle,
};

/**
 * FR-AUD-02 — every column the requirement names, in one place, so the log
 * looks the same wherever it is read: as the whole log, as one document's
 * history, or as one user's activity.
 *
 * The outcome column never guesses. Those fields are optional on the type only
 * because they were added after the first call sites were written, and the
 * reducer fills them on every new event — so if a row shows "Not recorded",
 * that is the truth about the row rather than a default standing in for it. An
 * audit console that assumed "Success" would have reported a failed sign-in as
 * a successful one.
 */
export default function EventTable({
  events,
  showActor = true,
  showObject = true,
}: {
  events: AuditEvent[];
  showActor?: boolean;
  showObject?: boolean;
}) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Timestamp</Th>
          {showActor && <Th>Actor</Th>}
          <Th>Action</Th>
          {showObject && <Th>Object</Th>}
          <Th>Source</Th>
          <Th>Outcome</Th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => {
          const outcome = event.outcome;
          const Icon = outcome ? OUTCOME_ICON[outcome] : null;

          return (
            <tr
              key={event.id}
              className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
            >
              <Td>
                <span className="whitespace-nowrap font-mono">
                  {event.timestamp.replace("T", " ").slice(0, 19)}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {event.id}
                </span>
              </Td>

              {showActor && (
                <Td>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {event.actor}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {event.role}
                  </span>
                </Td>
              )}

              <Td>
                <span className="text-neutral-800 dark:text-neutral-200">
                  {event.action}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {classifyAction(event.action)}
                </span>
              </Td>

              {showObject && (
                <Td>
                  <span className="font-mono text-xs">{event.target}</span>
                  {event.objectVersion && (
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {event.objectVersion}
                    </span>
                  )}
                </Td>
              )}

              <Td>
                <span className="whitespace-nowrap font-mono text-xs">{event.ip}</span>
                <span className="mt-0.5 flex items-start gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <FiMonitor size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {event.device ?? "—"}
                </span>
              </Td>

              <Td>
                {outcome && Icon ? (
                  <span
                    className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm"
                    style={{ color: OUTCOME_COLOR[outcome] }}
                  >
                    <Icon size={12} aria-hidden="true" />
                    {outcome}
                  </span>
                ) : (
                  <span className="whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    Not recorded
                  </span>
                )}
                {event.severity !== "info" && (
                  <span className="mt-1 block">
                    <StatusBadge tone={SEVERITY_TONE[event.severity]}>
                      {event.severity}
                    </StatusBadge>
                  </span>
                )}
              </Td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
