"use client";

import type { ReactNode } from "react";
import {
  FiAlertTriangle,
  FiCopy,
  FiEyeOff,
  FiFileText,
  FiLock,
  FiXOctagon,
  FiZap,
} from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { Tabs } from "@/common/tabs";
import { stamp } from "@/common/time";
import { StatusBadge, classificationTone } from "@/common/ui";
import { OPEN_THRESHOLD_SECONDS } from "@/data/packs";
import type { Pack } from "@/models/response/base-response";
import {
  KIND_TONE,
  PACK_TONE,
  STAGING_TONE,
  acknowledgementTally,
  inheritedClassification,
  staleHolders,
} from "./packStatus";

/**
 * One pack, read the same way wherever it is opened. The version identifier is
 * never more than a glance away, because the whole point of FR-PCK-13 is that
 * nobody should have to ask which version they are looking at.
 */
export default function PackDetail({
  pack,
  actions,
}: {
  pack: Pack;
  actions?: ReactNode;
}) {
  const inherited = inheritedClassification(pack);
  const stale = staleHolders(pack);
  const tally = acknowledgementTally(pack);
  const current = pack.versions.find((v) => v.versionId === pack.currentVersionId);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {pack.id} · {pack.meetingId}
          </p>
          <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {pack.title}
          </h2>
          <p className="mt-1 inline-flex items-center gap-2 font-mono text-xs text-neutral-600 dark:text-neutral-300">
            <FiCopy size={12} className="text-neutral-400" aria-hidden="true" />
            {pack.currentVersionId}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`stamp ${classificationTone(inherited)}`}>{inherited}</span>
          <StatusBadge tone={KIND_TONE[pack.kind]}>{pack.kind}</StatusBadge>
          <StatusBadge tone={PACK_TONE[pack.state]}>{pack.state}</StatusBadge>
        </div>
      </header>

      {pack.state === "Recalled" && (
        <p
          className="mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <FiXOctagon
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-critical)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            <span className="font-medium">
              Recalled {pack.recalledAt ? stamp(pack.recalledAt) : ""} by{" "}
              {pack.recalledBy}. Participant access was revoked.
            </span>{" "}
            {pack.recallReason}
          </span>
        </p>
      )}

      {stale.length > 0 && (
        <p
          className="mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <FiAlertTriangle
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-critical)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            {stale.length} participant{stale.length === 1 ? " is" : "s are"} still
            holding a superseded version. This is the failure the version controls
            exist to prevent — serve them the replacement.
          </span>
        </p>
      )}

      {pack.state === "Frozen" && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900/60">
          <FiLock size={15} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
          <span className="text-neutral-700 dark:text-neutral-300">
            Frozen {pack.frozenAt ? stamp(pack.frozenAt) : ""} by {pack.frozenBy}.
            There is no path to edit the contents — a change requires a replacement
            version, with an authorising officer and a written reason.
          </span>
        </p>
      )}

      <div className="mt-5">
        <Tabs
          key={pack.id}
          defaultId="contents"
          tabs={[
            {
              id: "contents",
              label: `Contents (${pack.items.length})`,
              content: (
                <div className="space-y-4">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-0.5">
                      <DetailRow label="Freeze cut-off" value={stamp(pack.freezeCutOff)} />
                      <DetailRow
                        label="Frozen"
                        value={pack.frozenAt ? `${stamp(pack.frozenAt)} · ${pack.frozenBy}` : "Not yet"}
                      />
                      <DetailRow
                        label="Released"
                        value={
                          pack.releasedAt
                            ? `${stamp(pack.releasedAt)} · ${pack.releasedBy}`
                            : "Not yet"
                        }
                      />
                    </div>
                    <div className="space-y-0.5">
                      <DetailRow
                        label="Inherited classification"
                        value={`${inherited} — highest of ${pack.items.reduce((n, i) => n + i.papers.length, 0)} papers`}
                      />
                      <DetailRow
                        label="Optimised size"
                        value={
                          pack.optimisedMb > 0
                            ? `${pack.optimisedMb} MB from ${pack.originalMb} MB`
                            : `${pack.originalMb} MB, not yet pre-processed`
                        }
                      />
                      <DetailRow
                        label="Opens in"
                        value={
                          pack.openSeconds > 0 ? (
                            <span
                              className="inline-flex items-center gap-1.5"
                              style={{
                                color:
                                  pack.openSeconds <= OPEN_THRESHOLD_SECONDS
                                    ? "var(--viz-good)"
                                    : "var(--viz-warning)",
                              }}
                            >
                              <FiZap size={12} aria-hidden="true" />
                              {pack.openSeconds}s against a {OPEN_THRESHOLD_SECONDS}s
                              threshold
                            </span>
                          ) : (
                            "Not yet measured"
                          )
                        }
                      />
                    </div>
                  </div>

                  {pack.items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                      Nothing has been assembled into this pack yet.
                    </p>
                  ) : (
                    <ol className="space-y-2">
                      {pack.items.map((item) => (
                        <li
                          key={item.agendaItemId}
                          className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <span className="min-w-0">
                              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {item.order}. {item.title}
                              </span>
                              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                                {item.section} · {item.ministry}
                              </span>
                            </span>
                            {item.closedSession && (
                              <span
                                className="inline-flex items-center gap-1.5 text-xs"
                                style={{ color: "var(--viz-serious)" }}
                              >
                                <FiEyeOff size={11} aria-hidden="true" />
                                Closed — omitted from {item.closedParticipantIds.length}{" "}
                                restricted copies
                              </span>
                            )}
                          </div>

                          {item.papers.length === 0 ? (
                            <p
                              className="mt-2 text-xs"
                              style={{ color: "var(--viz-critical)" }}
                            >
                              No paper attached.
                            </p>
                          ) : (
                            <ul className="mt-2 space-y-1">
                              {item.papers.map((paper) => (
                                <li
                                  key={paper.id}
                                  className="flex flex-wrap items-baseline justify-between gap-2 text-xs"
                                >
                                  <span className="inline-flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                                    <FiFileText
                                      size={12}
                                      className="text-neutral-400"
                                      aria-hidden="true"
                                    />
                                    {paper.title}
                                  </span>
                                  <span className="font-mono text-neutral-500 dark:text-neutral-400">
                                    {paper.versionId} · {paper.pages}pp ·{" "}
                                    {paper.classification}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ),
            },
            {
              id: "versions",
              label: `Versions (${pack.versions.length})`,
              content: (
                <ol className="space-y-3">
                  {[...pack.versions].reverse().map((version) => {
                    const isCurrent = version.versionId === pack.currentVersionId;
                    return (
                      <li
                        key={version.versionId}
                        className="rounded-lg border p-3"
                        style={{
                          borderColor: isCurrent ? "var(--viz-good)" : undefined,
                        }}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {version.versionId}
                          </span>
                          <StatusBadge tone={isCurrent ? "green" : "neutral"}>
                            {isCurrent ? "Current" : "Superseded"}
                          </StatusBadge>
                        </div>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                          Created {stamp(version.createdAt)}
                          {version.supersededAt
                            ? ` · superseded ${stamp(version.supersededAt)} by ${version.supersededByVersionId}`
                            : ""}
                        </p>
                        {version.authorisedBy && (
                          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                            <span className="font-medium">
                              Authorised by {version.authorisedBy}.
                            </span>{" "}
                            {version.reason}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ol>
              ),
            },
            {
              id: "acknowledgements",
              label: `Receipts (${tally.total})`,
              content:
                pack.acknowledgements.length === 0 ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    The pack has not been released, so there is nothing to
                    acknowledge yet.
                  </p>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <Th>Participant</Th>
                        <Th>Received</Th>
                        <Th>Read</Th>
                        <Th>Version held</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {pack.acknowledgements.map((ack) => (
                        <tr key={ack.participantId}>
                          <Td>
                            {ack.name}
                            <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                              {ack.ministry}
                            </span>
                          </Td>
                          <Td>
                            <span className="font-mono">
                              {ack.receivedAt ? stamp(ack.receivedAt) : "—"}
                            </span>
                          </Td>
                          <Td>
                            <span className="font-mono">
                              {ack.readAt ? stamp(ack.readAt) : "—"}
                            </span>
                          </Td>
                          <Td>
                            <span
                              className="font-mono"
                              style={{
                                color:
                                  ack.versionId === pack.currentVersionId
                                    ? undefined
                                    : "var(--viz-critical)",
                              }}
                            >
                              {ack.versionId}
                            </span>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ),
            },
            {
              id: "staging",
              label: `Staging (${pack.preStaging.length})`,
              content:
                pack.preStaging.length === 0 ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    This pack has not been pre-staged to any location.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {pack.preStaging.map((target) => (
                      <li
                        key={target.id}
                        className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {target.location}
                          </span>
                          <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                            {target.kind}
                            {target.stagedAt ? ` · ${stamp(target.stagedAt)}` : ""}
                          </span>
                          {target.note && (
                            <span className="mt-1 block text-xs text-neutral-600 dark:text-neutral-300">
                              {target.note}
                            </span>
                          )}
                        </span>
                        <StatusBadge tone={STAGING_TONE[target.status] ?? "neutral"}>
                          {target.status}
                        </StatusBadge>
                      </li>
                    ))}
                  </ul>
                ),
            },
          ]}
        />
      </div>

      {current?.reason && (
        <p className="mt-4 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-300">
          Current version was created as a replacement: {current.reason}
        </p>
      )}

      {actions && (
        <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          {actions}
        </div>
      )}
    </div>
  );
}
