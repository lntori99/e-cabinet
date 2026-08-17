"use client";

import { FiAlertTriangle, FiCopy, FiLock } from "react-icons/fi";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import type { Pack } from "@/models/response/base-response";
import { PACK_TONE, acknowledgementTally, staleHolders } from "./packStatus";

export default function PackList({
  packs,
  selectedId,
  onSelect,
  emptyMessage,
}: {
  packs: Pack[];
  selectedId: string;
  onSelect: (id: string) => void;
  emptyMessage: string;
}) {
  if (packs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {packs.map((pack) => {
        const active = pack.id === selectedId;
        const stale = staleHolders(pack);
        const tally = acknowledgementTally(pack);

        return (
          <li key={pack.id}>
            <button
              type="button"
              onClick={() => onSelect(pack.id)}
              aria-current={active ? "true" : undefined}
              className={`w-full rounded-lg border p-3 text-left transition ${
                active
                  ? "border-state-500 bg-state-50 dark:border-state-700 dark:bg-state-900/20"
                  : "border-neutral-200 bg-white hover:border-state-300 dark:border-neutral-800 dark:bg-neutral-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {pack.id}
                </span>
                <StatusBadge tone={PACK_TONE[pack.state]}>{pack.state}</StatusBadge>
              </div>

              <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
                {pack.title}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {pack.meetingId} · {pack.kind} · {pack.items.length} items
              </p>

              <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1">
                  <FiCopy size={10} aria-hidden="true" />
                  {pack.currentVersionId}
                </span>
                {pack.frozenAt && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <FiLock size={10} aria-hidden="true" /> Frozen
                    </span>
                  </>
                )}
                {pack.state === "Released" && (
                  <>
                    <span>·</span>
                    <span>
                      {tally.read} of {tally.total} read
                    </span>
                  </>
                )}
                {stale.length > 0 && (
                  <>
                    <span>·</span>
                    <span
                      className="inline-flex items-center gap-1"
                      style={{ color: "var(--viz-critical)" }}
                    >
                      <FiAlertTriangle size={10} aria-hidden="true" />
                      {stale.length} on a superseded version
                    </span>
                  </>
                )}
              </p>

              {pack.releasedAt && (
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Released {stamp(pack.releasedAt)}
                </p>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
