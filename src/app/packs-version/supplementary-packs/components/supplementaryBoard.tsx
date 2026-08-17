"use client";

import { useState } from "react";
import { FiCornerDownRight, FiInfo } from "react-icons/fi";
import { LuPackagePlus } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectPacks, selectSupplementaryPacks } from "@/core/slices/packs-slice";
import PackDetail from "../../components/packDetail";
import PackList from "../../components/packList";
import { PACK_TONE } from "../../components/packStatus";

export default function SupplementaryBoard() {
  const supplementary = useAppSelector(selectSupplementaryPacks);
  const packs = useAppSelector(selectPacks);
  const [selectedId, setSelectedId] = useState("");

  const selected =
    supplementary.find((p) => p.id === selectedId) ?? supplementary[0] ?? null;
  const primary = selected
    ? packs.find((p) => p.id === selected.primaryPackId)
    : undefined;

  if (supplementary.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuPackagePlus}
          title="No supplementary packs"
          description="Nothing has been issued after a primary pack. A supplementary appears here as soon as one is assembled against a sitting whose pack has already gone out."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
        <FiInfo size={15} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        A supplementary is additional material with its own version identifier and
        its own receipts. It does not supersede the primary pack, and the primary
        pack's version is unaffected by it.
      </p>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            {supplementary.length} issued
          </p>
          <PackList
            packs={supplementary}
            selectedId={selected?.id ?? ""}
            onSelect={setSelectedId}
            emptyMessage="No supplementary packs."
          />
        </div>

        <div className="min-w-0 space-y-6">
          {selected && primary && (
            <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
                Issued against
              </h2>
              <div className="mt-3 flex items-start gap-3">
                <FiCornerDownRight
                  size={16}
                  className="mt-1 shrink-0 text-neutral-400"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {primary.title}
                    </span>
                    <StatusBadge tone={PACK_TONE[primary.state]}>
                      {primary.state}
                    </StatusBadge>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <DetailRow label="Primary pack" value={primary.id} />
                    <DetailRow
                      label="Primary version"
                      value={primary.currentVersionId}
                    />
                    <DetailRow
                      label="Primary released"
                      value={primary.releasedAt ? stamp(primary.releasedAt) : "Not yet"}
                    />
                    <DetailRow
                      label="This supplementary"
                      value={`${selected.currentVersionId} · ${selected.state}`}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {selected && <PackDetail pack={selected} />}
        </div>
      </div>
    </div>
  );
}
