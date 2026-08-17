"use client";

import { useMemo, useState } from "react";
import { FiCalendar, FiUser } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { filterCls } from "@/common/field";
import { DetailRow } from "@/common/table";
import { Kpi, StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  selectAuditedActors,
  selectAuditLog,
} from "@/core/slices/oversight-slice";
import { AUDITED_ACTIONS, classifyAction } from "@/data/audit";
import EventTable from "../../components/eventTable";

/**
 * FR-AUD-11 — the complete activity history for one named user across a defined
 * period. The period is the part people forget: "what has this officer done" is
 * not answerable without saying since when, so the dates are inputs rather than
 * a fixed window.
 */
export default function UserActivity({ today }: { today: string }) {
  const log = useAppSelector(selectAuditLog);
  const actors = useAppSelector(selectAuditedActors);

  const [actor, setActor] = useState(actors[0] ?? "");
  const [from, setFrom] = useState("2026-08-01");
  const [to, setTo] = useState(today);

  const events = useMemo(
    () =>
      log.filter(
        (e) =>
          e.actor === actor &&
          e.timestamp.slice(0, 10) >= from &&
          e.timestamp.slice(0, 10) <= to,
      ),
    [log, actor, from, to],
  );

  const byKind = useMemo(() => {
    const counts = new Map<string, number>();
    for (const event of events) {
      const kind = classifyAction(event.action);
      counts.set(kind, (counts.get(kind) ?? 0) + 1);
    }
    return AUDITED_ACTIONS.map((kind) => ({ kind, count: counts.get(kind) ?? 0 })).filter(
      (row) => row.count > 0,
    );
  }, [events]);

  const denied = events.filter((e) => e.outcome === "Denied" || e.outcome === "Failed");
  const devices = [...new Set(events.map((e) => e.device).filter(Boolean))] as string[];
  const addresses = [...new Set(events.map((e) => e.ip))];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3 lg:max-w-3xl">
        <Field label="User">
          <select
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            aria-label="Choose a user"
            className={`${filterCls} w-full`}
          >
            {actors.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Field label="From">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            aria-label="Period start"
            className={`${filterCls} w-full`}
          />
        </Field>
        <Field label="To">
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            aria-label="Period end"
            className={`${filterCls} w-full`}
          />
        </Field>
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={FiUser}
            title="No activity in this period"
            description="This user recorded nothing between those dates. For an account that holds an entitlement, that is a finding for the access review rather than a blank screen."
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Events" value={events.length} hint={`${from} to ${to}`} />
            <Kpi
              label="Kinds of act"
              value={byKind.length}
              hint={byKind.map((k) => k.kind.toLowerCase()).join(", ")}
            />
            <Kpi
              label="Refused"
              value={denied.length}
              hint={
                denied.length === 0
                  ? "Nothing this user attempted was refused"
                  : "Attempts the platform declined"
              }
              tone={denied.length > 0 ? "amber" : "green"}
            />
            <Kpi
              label="Devices"
              value={devices.length}
              hint={addresses.length > 1 ? `${addresses.length} source addresses` : addresses[0]}
              tone={devices.length > 1 ? "amber" : "neutral"}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="inline-flex items-center gap-2 font-bold">
                <FiCalendar size={15} className="text-neutral-400" aria-hidden="true" />
                What they did
              </h2>
              <ul className="mt-3 space-y-1.5">
                {byKind.map((row) => (
                  <li
                    key={row.kind}
                    className="flex flex-wrap items-baseline justify-between gap-3 text-sm"
                  >
                    <span className="text-neutral-800 dark:text-neutral-200">
                      {row.kind}
                    </span>
                    <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="inline-flex items-center gap-2 font-bold">
                <FiUser size={15} className="text-neutral-400" aria-hidden="true" />
                Where from
              </h2>
              <div className="mt-3 space-y-0.5">
                <DetailRow label="Role" value={events[0]?.role ?? "—"} />
                <DetailRow
                  label="First event"
                  value={events.at(-1)?.timestamp.replace("T", " ") ?? "—"}
                />
                <DetailRow
                  label="Most recent"
                  value={events[0]?.timestamp.replace("T", " ") ?? "—"}
                />
              </div>
              <ul className="mt-3 space-y-1.5">
                {devices.map((device) => (
                  <li key={device} className="text-sm">
                    <span
                      className="inline-flex items-center gap-2"
                      style={{
                        color: device.startsWith("UNMANAGED")
                          ? "var(--viz-critical)"
                          : undefined,
                      }}
                    >
                      {device}
                      {device.startsWith("UNMANAGED") && (
                        <StatusBadge tone="red">Unmanaged</StatusBadge>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <EventTable events={events} showActor={false} />
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  );
}
