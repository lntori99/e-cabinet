"use client";

import { FiAlertTriangle, FiCheckCircle, FiMail, FiSend } from "react-icons/fi";
import { LuMailCheck } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectReleasedPacks } from "@/core/slices/packs-slice";
import { notifyHolder } from "@/core/thunks-packs";
import { acknowledgementTally } from "../../components/packStatus";

export default function AcknowledgementBoard() {
  const dispatch = useAppDispatch();
  const released = useAppSelector(selectReleasedPacks);

  if (released.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuMailCheck}
          title="Nothing to acknowledge"
          description="No pack has been released, so there is no receipt or read status to report."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {released.map((pack) => {
        const tally = acknowledgementTally(pack);
        const percent = tally.total === 0 ? 0 : (tally.read / tally.total) * 100;

        return (
          <section key={pack.id} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
                  {pack.title}
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {pack.id} · {pack.currentVersionId} · released{" "}
                  {pack.releasedAt ? stamp(pack.releasedAt) : ""}
                </p>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {tally.read} of {tally.total} read · {tally.none} never received
              </p>
            </div>

            <div
              className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
              role="img"
              aria-label={`${tally.read} of ${tally.total} participants have read this pack`}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${percent}%`, background: "var(--viz-ramp-3)" }}
              />
            </div>

            <Table>
              <thead>
                <tr>
                  <Th>Participant</Th>
                  <Th>Received</Th>
                  <Th>Read</Th>
                  <Th>Version held</Th>
                  <Th align="right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {pack.acknowledgements.map((ack) => {
                  const stale = ack.versionId !== pack.currentVersionId;
                  return (
                    <tr
                      key={ack.participantId}
                      className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                    >
                      <Td>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {ack.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                          {ack.ministry}
                        </span>
                      </Td>
                      <Td>
                        {ack.receivedAt ? (
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono">
                            <FiMail size={12} className="text-neutral-400" aria-hidden="true" />
                            {stamp(ack.receivedAt)}
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5"
                            style={{ color: "var(--viz-warning)" }}
                          >
                            <FiAlertTriangle size={12} aria-hidden="true" />
                            Not delivered
                          </span>
                        )}
                      </Td>
                      <Td>
                        {ack.readAt ? (
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono">
                            <FiCheckCircle
                              size={12}
                              style={{ color: "var(--viz-good)" }}
                              aria-hidden="true"
                            />
                            {stamp(ack.readAt)}
                          </span>
                        ) : (
                          <span className="text-neutral-500 dark:text-neutral-400">
                            Not opened
                          </span>
                        )}
                      </Td>
                      <Td>
                        <span
                          className="font-mono"
                          style={{ color: stale ? "var(--viz-critical)" : undefined }}
                        >
                          {ack.versionId}
                        </span>
                        {stale && (
                          <span
                            className="mt-0.5 block text-xs"
                            style={{ color: "var(--viz-critical)" }}
                          >
                            Superseded — current is {pack.currentVersionId}
                          </span>
                        )}
                      </Td>
                      <Td align="right">
                        {stale ? (
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                notifyHolder({
                                  packId: pack.id,
                                  participantId: ack.participantId,
                                  name: ack.name,
                                  versionId: pack.currentVersionId,
                                }),
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                          >
                            <FiSend size={14} aria-hidden="true" />
                            Serve replacement
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            Current
                          </span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </section>
        );
      })}
    </div>
  );
}
