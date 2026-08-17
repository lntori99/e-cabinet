"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FiAlertTriangle, FiCheckCircle, FiClock, FiCopy } from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { distance, hoursUntil, stamp } from "@/common/time";
import { Kpi, StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectMeetings } from "@/core/slices/meetings-slice";
import {
  selectAcknowledgementGaps,
  selectPacks,
  selectVersionGaps,
} from "@/core/slices/packs-slice";
import { selectUsers } from "@/core/slices/users-slice";
import { PACK_TONE, readinessChecks, readinessSummary } from "../../components/packStatus";
import AcknowledgementChart from "./acknowledgementChart";
import PackStateChart from "./packStateChart";

export default function PackDashboard({ now }: { now: string }) {
  const packs = useAppSelector(selectPacks);
  const meetings = useAppSelector(selectMeetings);
  const users = useAppSelector(selectUsers);
  const versionGaps = useAppSelector(selectVersionGaps);
  const ackGaps = useAppSelector(selectAcknowledgementGaps);

  const inAssembly = packs.filter((p) => p.state === "In assembly");
  const frozen = packs.filter((p) => p.state === "Frozen");
  const released = packs.filter((p) => p.state === "Released");

  /** FR-PCK-16 — readiness recomputed for every pack still to be released. */
  const failing = useMemo(
    () =>
      [...inAssembly, ...frozen]
        .map((pack) => {
          const meeting = meetings.find((m) => m.id === pack.meetingId);
          const checks = readinessChecks(pack, meeting, users);
          return { pack, ...readinessSummary(checks) };
        })
        .filter((row) => !row.passed),
    [inAssembly, frozen, meetings, users],
  );

  /** FR-PCK-04 — cut-offs still ahead, soonest first. */
  const cutOffs = packs
    .filter((p) => p.state === "In assembly")
    .sort((a, b) => a.freezeCutOff.localeCompare(b.freezeCutOff));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="In assembly"
          value={inAssembly.length}
          hint={
            cutOffs[0]
              ? `Next cut-off ${distance(hoursUntil(cutOffs[0].freezeCutOff, now))}`
              : "No cut-off ahead"
          }
        />
        <Kpi
          label="Frozen, awaiting release"
          value={frozen.length}
          hint="Closed to change — release or replace"
          tone={frozen.length > 0 ? "amber" : "neutral"}
        />
        <Kpi
          label="Version gaps"
          value={versionGaps.reduce((sum, gap) => sum + gap.holders.length, 0)}
          hint={
            versionGaps.length === 0
              ? "Everyone holds the current version"
              : `Across ${versionGaps.length} released pack${versionGaps.length === 1 ? "" : "s"}`
          }
          tone={versionGaps.length === 0 ? "green" : "red"}
        />
        <Kpi
          label="Not yet read"
          value={ackGaps.length}
          hint={`${released.length} released pack${released.length === 1 ? "" : "s"} out with participants`}
          tone={ackGaps.length === 0 ? "green" : "amber"}
        />
      </div>

      {versionGaps.length > 0 && (
        <section
          className="rounded-lg border bg-white dark:bg-neutral-900"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <h2
              className="flex items-center gap-2 font-bold"
              style={{ color: "var(--viz-critical)" }}
            >
              <FiAlertTriangle size={16} aria-hidden="true" />
              Participants on a superseded version
            </h2>
            <Link
              href="/packs-version/versions"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Version history →
            </Link>
          </header>

          <div className="px-5 py-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              This is the failure the version controls exist to prevent: two people
              in the same sitting reading different documents.
            </p>

            <ul className="mt-3 divide-y divide-neutral-100 dark:divide-neutral-800">
              {versionGaps.flatMap(({ pack, holders }) =>
                holders.map((holder) => (
                  <li
                    key={`${pack.id}-${holder.participantId}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-2.5"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {holder.name}
                      </span>
                      <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                        {pack.title} · {holder.ministry}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-2 font-mono text-xs">
                      <span style={{ color: "var(--viz-critical)" }}>
                        {holder.versionId}
                      </span>
                      <FiCopy size={12} className="text-neutral-400" aria-hidden="true" />
                      <span className="text-neutral-500 dark:text-neutral-400">
                        {pack.currentVersionId}
                      </span>
                    </span>
                  </li>
                )),
              )}
            </ul>
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <PackStateChart packs={packs} />
        <AcknowledgementChart packs={packs} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">Upcoming freeze cut-offs</h2>
            <Link
              href="/packs-version/in-assembly"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              In assembly →
            </Link>
          </div>

          {cutOffs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              No pack is still open for assembly.
            </p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Pack</Th>
                  <Th>Cut-off</Th>
                  <Th align="right">Items</Th>
                </tr>
              </thead>
              <tbody>
                {cutOffs.map((pack) => {
                  const left = hoursUntil(pack.freezeCutOff, now);
                  return (
                    <tr key={pack.id}>
                      <Td>
                        {pack.title}
                        <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                          {pack.id}
                        </span>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                          <FiClock
                            size={13}
                            style={{
                              color: left <= 48 ? "var(--viz-warning)" : "var(--viz-axis)",
                            }}
                            aria-hidden="true"
                          />
                          {distance(left)}
                        </span>
                        <span className="mt-0.5 block font-mono text-xs text-neutral-500 dark:text-neutral-400">
                          {stamp(pack.freezeCutOff)}
                        </span>
                      </Td>
                      <Td align="right">
                        <span className="font-mono">{pack.items.length}</span>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">Readiness failures</h2>
            <Link
              href="/packs-version/readiness-checks"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Readiness checks →
            </Link>
          </div>

          {failing.length === 0 ? (
            <p className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              <FiCheckCircle
                size={15}
                style={{ color: "var(--viz-good)" }}
                aria-hidden="true"
              />
              Every pack passes its pre-release check.
            </p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Pack</Th>
                  <Th>Failing</Th>
                  <Th>State</Th>
                </tr>
              </thead>
              <tbody>
                {failing.map(({ pack, failed, blockers }) => (
                  <tr key={pack.id}>
                    <Td>
                      {pack.title}
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {pack.id}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className="font-medium"
                        style={{
                          color:
                            blockers.length > 0
                              ? "var(--viz-critical)"
                              : "var(--viz-warning)",
                        }}
                      >
                        {failed.length} check{failed.length === 1 ? "" : "s"}
                        {blockers.length > 0 ? ` · ${blockers.length} blocking` : ""}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        {failed.map((c) => c.label).join("; ")}
                      </span>
                      {pack.override && (
                        <span
                          className="mt-1 block text-xs"
                          style={{ color: "var(--viz-serious)" }}
                        >
                          Override {pack.override.reference} recorded
                        </span>
                      )}
                    </Td>
                    <Td>
                      <StatusBadge tone={PACK_TONE[pack.state]}>{pack.state}</StatusBadge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </section>
      </div>
    </div>
  );
}
