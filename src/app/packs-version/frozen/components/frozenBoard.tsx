"use client";

import { useState } from "react";
import { FiCopy, FiEyeOff, FiSend, FiSlash } from "react-icons/fi";
import { LuLock } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectMeetings } from "@/core/slices/meetings-slice";
import { selectPacks } from "@/core/slices/packs-slice";
import { selectUsers } from "@/core/slices/users-slice";
import { releasePack } from "@/core/thunks-packs";
import PackDetail from "../../components/packDetail";
import PackList from "../../components/packList";
import { ReplaceModal } from "../../components/packModals";
import { readinessChecks, readinessSummary } from "../../components/packStatus";

export default function FrozenBoard() {
  const dispatch = useAppDispatch();
  const packs = useAppSelector(selectPacks);
  const meetings = useAppSelector(selectMeetings);
  const users = useAppSelector(selectUsers);

  const frozen = packs.filter((p) => p.state === "Frozen");
  const [selectedId, setSelectedId] = useState("");
  const [replacing, setReplacing] = useState(false);

  const selected = frozen.find((p) => p.id === selectedId) ?? frozen[0] ?? null;

  if (frozen.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuLock}
          title="No pack is frozen"
          description="Nothing is waiting to go out. A pack appears here the moment it is closed at its cut-off."
        />
      </div>
    );
  }

  const meeting = selected
    ? meetings.find((m) => m.id === selected.meetingId)
    : undefined;
  const summary = selected
    ? readinessSummary(readinessChecks(selected, meeting, users))
    : null;
  const blocked = Boolean(summary && !summary.passed && !selected?.override);

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          {frozen.length} awaiting release
        </p>
        <PackList
          packs={frozen}
          selectedId={selected?.id ?? ""}
          onSelect={setSelectedId}
          emptyMessage="Nothing is frozen."
        />
      </div>

      <div className="min-w-0">
        {selected && (
          <PackDetail
            pack={selected}
            actions={
              <div className="space-y-4">
                {selected.partialReleases.length > 0 && (
                  <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                    <p className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      <FiEyeOff size={14} className="text-neutral-400" aria-hidden="true" />
                      {selected.partialReleases.length} partial copies
                    </p>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      FR-PCK-11 — these participants are restricted from a closed
                      item, so their copy omits it entirely rather than showing a
                      gap where it was.
                    </p>
                    <ul className="mt-2 space-y-1">
                      {selected.partialReleases.map((partial) => (
                        <li
                          key={partial.participantId}
                          className="text-xs text-neutral-600 dark:text-neutral-300"
                        >
                          {partial.name} — omits {partial.omittedItemTitles.join("; ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {blocked ? (
                      <span
                        className="inline-flex items-center gap-2"
                        style={{ color: "var(--viz-critical)" }}
                      >
                        <FiSlash size={14} aria-hidden="true" />
                        Readiness check failing — release needs an override first.
                      </span>
                    ) : (
                      `Releases to ${meeting?.participants.length ?? 0} authorised participants of ${selected.meetingId}.`
                    )}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setReplacing(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
                    >
                      <FiCopy size={15} aria-hidden="true" />
                      Create replacement
                    </button>
                    <button
                      type="button"
                      disabled={blocked}
                      onClick={() =>
                        dispatch(
                          releasePack(
                            selected,
                            (meeting?.participants ?? []).map((p) => ({
                              id: p.id,
                              name: p.name,
                              ministry: p.ministry,
                            })),
                          ),
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiSend size={15} aria-hidden="true" />
                      Release to participants
                    </button>
                  </div>
                </div>
              </div>
            }
          />
        )}
      </div>

      {replacing && selected && (
        <ReplaceModal pack={selected} onClose={() => setReplacing(false)} />
      )}
    </div>
  );
}
