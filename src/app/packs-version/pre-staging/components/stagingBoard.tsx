"use client";

import {
  FiAlertTriangle,
  FiCheckCircle,
  FiMonitor,
  FiRefreshCw,
  FiServer,
  FiZap,
} from "react-icons/fi";
import { LuServerOff } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { OPEN_THRESHOLD_SECONDS } from "@/data/packs";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectPacks } from "@/core/slices/packs-slice";
import { updateStaging } from "@/core/thunks-packs";
import type { PreStagingTarget } from "@/models/response/base-response";
import { STAGING_TONE } from "../../components/packStatus";

const KIND_ICON = {
  "Cabinet room": FiMonitor,
  "Committee room": FiMonitor,
  "IMAGO endpoint": FiMonitor,
  "Secure store": FiServer,
} as const;

export default function StagingBoard() {
  const dispatch = useAppDispatch();
  const packs = useAppSelector(selectPacks);

  const staged = packs.filter((p) => p.preStaging.length > 0);
  const failures = staged.flatMap((pack) =>
    pack.preStaging.filter((t) => t.status === "Failed").map((target) => ({ pack, target })),
  );

  if (staged.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuServerOff}
          title="Nothing is pre-staged"
          description="No pack has been pushed to a room or secure location yet. Pre-staging usually starts once a pack is frozen."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {failures.length > 0 && (
        <p
          className="flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <FiAlertTriangle
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-critical)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            {failures.length} distribution{failures.length === 1 ? "" : "s"} failed.
            A location that has not taken the pack will pull it over the network on
            the day, which is the case the performance threshold exists to avoid.
          </span>
        </p>
      )}

      {staged.map((pack) => (
        <section key={pack.id} className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
                {pack.title}
              </h2>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {pack.id} · {pack.currentVersionId} · {pack.state}
              </p>
            </div>
            <p className="inline-flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <FiZap
                size={13}
                style={{
                  color:
                    pack.openSeconds > 0 && pack.openSeconds <= OPEN_THRESHOLD_SECONDS
                      ? "var(--viz-good)"
                      : "var(--viz-warning)",
                }}
                aria-hidden="true"
              />
              {pack.optimisedMb} MB optimised from {pack.originalMb} MB · opens in{" "}
              {pack.openSeconds}s
            </p>
          </div>

          <Table>
            <thead>
              <tr>
                <Th>Location</Th>
                <Th>Kind</Th>
                <Th>Staged</Th>
                <Th>Status</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {pack.preStaging.map((target) => {
                const Icon = KIND_ICON[target.kind] ?? FiServer;
                return (
                  <tr
                    key={target.id}
                    className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                  >
                    <Td>
                      <span className="inline-flex items-center gap-2 font-medium text-neutral-900 dark:text-neutral-100">
                        <Icon size={14} className="text-neutral-400" aria-hidden="true" />
                        {target.location}
                      </span>
                      {target.note && (
                        <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                          {target.note}
                        </span>
                      )}
                    </Td>
                    <Td>{target.kind}</Td>
                    <Td>
                      <span className="font-mono">
                        {target.stagedAt ? stamp(target.stagedAt) : "—"}
                      </span>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-2">
                        {target.status === "Staged" && (
                          <FiCheckCircle
                            size={13}
                            style={{ color: "var(--viz-good)" }}
                            aria-hidden="true"
                          />
                        )}
                        {target.status === "Failed" && (
                          <FiAlertTriangle
                            size={13}
                            style={{ color: "var(--viz-critical)" }}
                            aria-hidden="true"
                          />
                        )}
                        <StatusBadge tone={STAGING_TONE[target.status] ?? "neutral"}>
                          {target.status}
                        </StatusBadge>
                      </span>
                    </Td>
                    <Td align="right">
                      {target.status === "Staged" ? (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          In place
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              updateStaging({
                                packId: pack.id,
                                targetId: target.id,
                                location: target.location,
                                status: "Staged" as PreStagingTarget["status"],
                              }),
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-state-600 px-3 py-1.5 text-sm font-medium text-state-700 transition hover:bg-state-600 hover:text-white dark:text-state-400"
                        >
                          <FiRefreshCw size={14} aria-hidden="true" />
                          {target.status === "Failed" ? "Retry" : "Push now"}
                        </button>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </section>
      ))}

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        FR-PCK-14 — packs are pre-processed at assembly so a released pack opens
        inside the {OPEN_THRESHOLD_SECONDS}-second threshold set by NFR-PER-02.
        Pre-staging is the other half of that: the file is already on the endpoint
        before anyone asks for it.
      </p>
    </div>
  );
}
