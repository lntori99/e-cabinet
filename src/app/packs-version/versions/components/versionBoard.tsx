"use client";

import { FiAlertTriangle, FiArrowDown, FiCheckCircle, FiCopy, FiSend } from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectPacks, selectVersionGaps } from "@/core/slices/packs-slice";
import { notifyHolder } from "@/core/thunks-packs";

export default function VersionBoard() {
  const dispatch = useAppDispatch();
  const packs = useAppSelector(selectPacks);
  const gaps = useAppSelector(selectVersionGaps);

  const replaced = packs.filter((p) => p.versions.length > 1);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Participants on a superseded version</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {gaps.reduce((sum, gap) => sum + gap.holders.length, 0)} to serve
          </p>
        </div>

        {gaps.length === 0 ? (
          <p className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
            <FiCheckCircle
              size={15}
              style={{ color: "var(--viz-good)" }}
              aria-hidden="true"
            />
            Everyone holding a released pack is on its current version.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Participant</Th>
                <Th>Pack</Th>
                <Th>Holding</Th>
                <Th>Current</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {gaps.flatMap(({ pack, holders }) =>
                holders.map((holder) => (
                  <tr
                    key={`${pack.id}-${holder.participantId}`}
                    className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                  >
                    <Td>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {holder.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        {holder.ministry}
                      </span>
                    </Td>
                    <Td>
                      {pack.title}
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {pack.id}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className="inline-flex items-center gap-1.5 font-mono"
                        style={{ color: "var(--viz-critical)" }}
                      >
                        <FiAlertTriangle size={12} aria-hidden="true" />
                        {holder.versionId}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono">{pack.currentVersionId}</span>
                    </Td>
                    <Td align="right">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            notifyHolder({
                              packId: pack.id,
                              participantId: holder.participantId,
                              name: holder.name,
                              versionId: pack.currentVersionId,
                            }),
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                      >
                        <FiSend size={14} aria-hidden="true" />
                        Serve replacement
                      </button>
                    </Td>
                  </tr>
                )),
              )}
            </tbody>
          </Table>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Replacement history</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {replaced.length} pack{replaced.length === 1 ? "" : "s"} replaced
          </p>
        </div>

        {replaced.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            No pack has been replaced. Every pack on the register is still on the
            version it was frozen at.
          </p>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {replaced.map((pack) => (
              <article
                key={pack.id}
                className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              >
                <header className="border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {pack.id} · {pack.meetingId}
                  </p>
                  <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                    {pack.title}
                  </h3>
                </header>

                <ol className="divide-y divide-neutral-100 px-5 dark:divide-neutral-800">
                  {[...pack.versions].reverse().map((version, index) => {
                    const isCurrent = version.versionId === pack.currentVersionId;
                    return (
                      <li key={version.versionId} className="py-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="inline-flex items-center gap-2 font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {index > 0 && (
                              <FiArrowDown
                                size={12}
                                className="text-neutral-400"
                                aria-hidden="true"
                              />
                            )}
                            <FiCopy size={12} className="text-neutral-400" aria-hidden="true" />
                            {version.versionId}
                          </span>
                          <StatusBadge tone={isCurrent ? "green" : "neutral"}>
                            {isCurrent ? "Current" : "Superseded"}
                          </StatusBadge>
                        </div>

                        <div className="mt-2 space-y-0.5">
                          <DetailRow label="Created" value={stamp(version.createdAt)} />
                          {version.authorisedBy && (
                            <DetailRow label="Authorised by" value={version.authorisedBy} />
                          )}
                          {version.supersededAt && (
                            <DetailRow
                              label="Superseded"
                              value={`${stamp(version.supersededAt)} by ${version.supersededByVersionId}`}
                            />
                          )}
                        </div>

                        {version.reason && (
                          <p className="mt-2 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                            {version.reason}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        FR-PCK-13 — every version identifier shown here is the one rendered into
        the document itself, on screen and in any printed or watermarked output.
        A page in someone&apos;s hand can always be traced back to a row on this
        screen.
      </p>
    </div>
  );
}
