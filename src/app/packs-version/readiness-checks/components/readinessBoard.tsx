"use client";

import { useMemo, useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiFlag, FiXCircle } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectMeetings } from "@/core/slices/meetings-slice";
import { selectPacks } from "@/core/slices/packs-slice";
import { selectUsers } from "@/core/slices/users-slice";
import type { Pack } from "@/models/response/base-response";
import { OverrideModal } from "../../components/packModals";
import {
  PACK_TONE,
  readinessChecks,
  readinessSummary,
  type ReadinessCheck,
} from "../../components/packStatus";

function CheckRow({ check }: { check: ReadinessCheck }) {
  const Icon = check.passed
    ? FiCheckCircle
    : check.severity === "blocker"
      ? FiXCircle
      : FiAlertTriangle;
  const color = check.passed
    ? "var(--viz-good)"
    : check.severity === "blocker"
      ? "var(--viz-critical)"
      : "var(--viz-warning)";

  return (
    <li className="flex items-start gap-2.5 py-2.5">
      <Icon size={15} className="mt-0.5 shrink-0" style={{ color }} aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {check.label}
        </span>
        <span className="block text-xs text-neutral-500 dark:text-neutral-400">
          {check.detail}
        </span>
      </span>
      {!check.passed && (
        <span
          className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-widest"
          style={{ color }}
        >
          {check.severity}
        </span>
      )}
    </li>
  );
}

export default function ReadinessBoard() {
  const packs = useAppSelector(selectPacks);
  const meetings = useAppSelector(selectMeetings);
  const users = useAppSelector(selectUsers);
  const [overriding, setOverriding] = useState<{
    pack: Pack;
    failures: ReadinessCheck[];
  } | null>(null);

  const rows = useMemo(
    () =>
      packs
        .filter((p) => p.state === "In assembly" || p.state === "Frozen")
        .map((pack) => {
          const meeting = meetings.find((m) => m.id === pack.meetingId);
          const checks = readinessChecks(pack, meeting, users);
          return { pack, checks, ...readinessSummary(checks) };
        }),
    [packs, meetings, users],
  );

  return (
    <div className="space-y-6">
      {rows.length === 0 && (
        <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No pack is waiting to be released.
        </p>
      )}

      {rows.map(({ pack, checks, failed, blockers, passed }) => (
        <section
          key={pack.id}
          className="rounded-lg border bg-white dark:bg-neutral-900"
          style={{
            borderColor: passed
              ? undefined
              : blockers.length > 0
                ? "var(--viz-critical)"
                : "var(--viz-warning)",
          }}
        >
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {pack.id} · {pack.meetingId}
              </p>
              <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                {pack.title}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={PACK_TONE[pack.state]}>{pack.state}</StatusBadge>
              <StatusBadge tone={passed ? "green" : blockers.length > 0 ? "red" : "amber"}>
                {passed ? "Ready" : `${failed.length} failing`}
              </StatusBadge>
            </div>
          </header>

          <div className="px-5 py-2">
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {checks.map((check) => (
                <CheckRow key={check.id} check={check} />
              ))}
            </ul>
          </div>

          {pack.override && (
            <div
              className="mx-5 mb-4 rounded-lg border p-3"
              style={{ borderColor: "var(--viz-serious)" }}
            >
              <p
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: "var(--viz-serious)" }}
              >
                <FiFlag size={14} aria-hidden="true" />
                Override {pack.override.reference}
              </p>
              <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                {pack.override.reason}
              </p>
              <div className="mt-2 space-y-0.5">
                <DetailRow
                  label="Recorded by"
                  value={`${pack.override.by} · ${stamp(pack.override.at)}`}
                />
                <DetailRow
                  label="Checks accepted"
                  value={pack.override.failuresAccepted.join("; ")}
                />
              </div>
            </div>
          )}

          {!passed && !pack.override && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Release is blocked until these are cleared, or a Secretariat
                override is recorded against the pack.
              </p>
              <button
                type="button"
                onClick={() => setOverriding({ pack, failures: failed })}
                className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-4 py-2 text-sm font-semibold text-seal-500 transition hover:bg-seal-500 hover:text-white"
              >
                <FiFlag size={15} aria-hidden="true" />
                Record an override
              </button>
            </div>
          )}
        </section>
      ))}

      {overriding && (
        <OverrideModal
          pack={overriding.pack}
          failures={overriding.failures}
          onClose={() => setOverriding(null)}
        />
      )}
    </div>
  );
}
