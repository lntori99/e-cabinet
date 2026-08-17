"use client";

import { useState } from "react";
import { FiClock, FiLink, FiLock } from "react-icons/fi";
import { LuPackageOpen } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { distance, hoursUntil, stamp } from "@/common/time";
import { classificationTone } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectMeetings } from "@/core/slices/meetings-slice";
import { selectPacks } from "@/core/slices/packs-slice";
import { selectUsers } from "@/core/slices/users-slice";
import { freezePack } from "@/core/thunks-packs";
import PackDetail from "../../components/packDetail";
import PackList from "../../components/packList";
import {
  inheritedClassification,
  readinessChecks,
  readinessSummary,
} from "../../components/packStatus";

export default function AssemblyBoard({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const packs = useAppSelector(selectPacks);
  const meetings = useAppSelector(selectMeetings);
  const users = useAppSelector(selectUsers);

  const assembling = packs.filter((p) => p.state === "In assembly");
  const [selectedId, setSelectedId] = useState("");
  const selected = assembling.find((p) => p.id === selectedId) ?? assembling[0] ?? null;

  if (assembling.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuPackageOpen}
          title="Nothing is being assembled"
          description="Every pack on the register has been frozen or released. A new pack opens here as soon as a sitting starts gathering cleared papers."
        />
      </div>
    );
  }

  const meeting = selected
    ? meetings.find((m) => m.id === selected.meetingId)
    : undefined;
  const checks = selected ? readinessChecks(selected, meeting, users) : [];
  const summary = readinessSummary(checks);
  const cutOffLeft = selected ? hoursUntil(selected.freezeCutOff, now) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          {assembling.length} in assembly
        </p>
        <PackList
          packs={assembling}
          selectedId={selected?.id ?? ""}
          onSelect={setSelectedId}
          emptyMessage="Nothing is being assembled."
        />
      </div>

      <div className="min-w-0 space-y-6">
        {selected && (
          <>
            <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
                Generated front matter
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                FR-PCK-02 — the cover, contents and agenda are produced from the
                sitting. Each entry links to the papers behind it, so the pack has
                no hand-maintained index to fall out of step.
              </p>

              <div className="mt-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                  Republic of Malawi · Cabinet
                </p>
                <p className="mt-2 text-center text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {meeting?.title ?? selected.title}
                </p>
                <p className="mt-1 text-center text-sm text-neutral-600 dark:text-neutral-400">
                  {meeting ? `${meeting.date} · ${meeting.time} · ${meeting.venue}` : ""}
                </p>
                <p className="mt-3 text-center">
                  <span
                    className={`stamp ${classificationTone(inheritedClassification(selected))}`}
                  >
                    {inheritedClassification(selected)}
                  </span>
                </p>
                <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {selected.currentVersionId}
                </p>

                <hr className="my-4 border-neutral-200 dark:border-neutral-800" />

                <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                  Contents
                </h3>
                {selected.items.length === 0 ? (
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    No item has been added yet.
                  </p>
                ) : (
                  <ol className="mt-2 space-y-1.5">
                    {selected.items.map((item) => (
                      <li key={item.agendaItemId} className="register-row text-sm">
                        <span className="inline-flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                          <FiLink size={11} className="text-neutral-400" aria-hidden="true" />
                          {item.order}. {item.title}
                        </span>
                        <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                          {item.papers.length} paper{item.papers.length === 1 ? "" : "s"}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </section>

            <PackDetail
              pack={selected}
              actions={
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                    <FiClock size={14} className="text-neutral-400" aria-hidden="true" />
                    Cut-off {stamp(selected.freezeCutOff)} · {distance(cutOffLeft)}
                    {summary.blockers.length > 0 && (
                      <span style={{ color: "var(--viz-critical)" }}>
                        · {summary.blockers.length} blocking check
                        {summary.blockers.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => dispatch(freezePack(selected))}
                    className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700"
                  >
                    <FiLock size={15} aria-hidden="true" />
                    Freeze the pack
                  </button>
                </div>
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
