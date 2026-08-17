"use client";

import { useState } from "react";
import { FiCopy, FiEyeOff, FiSend, FiXOctagon } from "react-icons/fi";
import { LuSend } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { stamp } from "@/common/time";
import { useAppSelector } from "@/core/hook";
import { selectReleasedPacks } from "@/core/slices/packs-slice";
import PackDetail from "../../components/packDetail";
import PackList from "../../components/packList";
import { RecallModal, ReplaceModal } from "../../components/packModals";
import { acknowledgementTally } from "../../components/packStatus";

export default function ReleasedBoard() {
  const released = useAppSelector(selectReleasedPacks);
  const [selectedId, setSelectedId] = useState("");
  const [replacing, setReplacing] = useState(false);
  const [recalling, setRecalling] = useState(false);

  const selected = released.find((p) => p.id === selectedId) ?? released[0] ?? null;

  if (released.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuSend}
          title="Nothing has been released"
          description="No pack is currently with participants. A pack appears here once it has been released to the authorised participants of its sitting."
        />
      </div>
    );
  }

  const tally = selected ? acknowledgementTally(selected) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          {released.length} with participants
        </p>
        <PackList
          packs={released}
          selectedId={selected?.id ?? ""}
          onSelect={setSelectedId}
          emptyMessage="Nothing has been released."
        />
      </div>

      <div className="min-w-0">
        {selected && tally && (
          <PackDetail
            pack={selected}
            actions={
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <span className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                    <FiSend size={14} className="text-neutral-400" aria-hidden="true" />
                    Released {selected.releasedAt ? stamp(selected.releasedAt) : ""} by{" "}
                    {selected.releasedBy}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-300">
                    {tally.read} of {tally.total} read
                  </span>
                  {selected.partialReleases.length > 0 && (
                    <span className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                      <FiEyeOff size={14} className="text-neutral-400" aria-hidden="true" />
                      {selected.partialReleases.length} partial copies
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setReplacing(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
                  >
                    <FiCopy size={15} aria-hidden="true" />
                    Create replacement version
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecalling(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-4 py-2 text-sm font-semibold text-seal-500 transition hover:bg-seal-500 hover:text-white"
                  >
                    <FiXOctagon size={15} aria-hidden="true" />
                    Recall this pack
                  </button>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  A replacement supersedes this version and leaves it retrievable
                  for audit. A recall revokes access outright — use it when the
                  pack should never have gone out, not when it merely needs
                  correcting.
                </p>
              </div>
            }
          />
        )}
      </div>

      {replacing && selected && (
        <ReplaceModal pack={selected} onClose={() => setReplacing(false)} />
      )}
      {recalling && selected && (
        <RecallModal pack={selected} onClose={() => setRecalling(false)} />
      )}
    </div>
  );
}
