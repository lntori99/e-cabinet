"use client";

import { FiEye, FiUserX, FiXOctagon } from "react-icons/fi";
import { LuShieldCheck } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { classificationTone } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectPacks } from "@/core/slices/packs-slice";
import { acknowledgementTally, inheritedClassification } from "../../components/packStatus";

export default function RecallBoard() {
  const packs = useAppSelector(selectPacks);
  const recalled = packs.filter((p) => p.state === "Recalled");

  if (recalled.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuShieldCheck}
          title="Nothing has been recalled"
          description="No released pack has had to be withdrawn. A recall is recorded here permanently — it is not something that can be tidied away afterwards."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recalled.map((pack) => {
        const tally = acknowledgementTally(pack);

        return (
          <article
            key={pack.id}
            className="rounded-lg border bg-white dark:bg-neutral-900"
            style={{ borderColor: "var(--viz-critical)" }}
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {pack.id} · {pack.meetingId} · {pack.currentVersionId}
                </p>
                <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                  {pack.title}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`stamp ${classificationTone(inheritedClassification(pack))}`}>
                  {inheritedClassification(pack)}
                </span>
                <span className="stamp" style={{ color: "var(--viz-critical)" }}>
                  <FiXOctagon size={10} />
                  Recalled
                </span>
              </div>
            </header>

            <div className="space-y-4 px-5 py-4">
              <p className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                {pack.recallReason}
              </p>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-0.5">
                  <DetailRow
                    label="Released"
                    value={pack.releasedAt ? stamp(pack.releasedAt) : "—"}
                  />
                  <DetailRow
                    label="Recalled"
                    value={
                      pack.recalledAt
                        ? `${stamp(pack.recalledAt)} · ${pack.recalledBy}`
                        : "—"
                    }
                  />
                  <DetailRow
                    label="Time in circulation"
                    value={
                      pack.releasedAt && pack.recalledAt
                        ? `${Math.round(
                            (new Date(pack.recalledAt).getTime() -
                              new Date(pack.releasedAt).getTime()) /
                              60000,
                          )} minutes`
                        : "—"
                    }
                  />
                </div>

                <div className="space-y-0.5">
                  <DetailRow
                    label="Access revoked for"
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        <FiUserX size={12} className="text-neutral-400" aria-hidden="true" />
                        {tally.total} participants
                      </span>
                    }
                  />
                  <DetailRow
                    label="Had opened it"
                    value={
                      <span
                        className="inline-flex items-center gap-1.5"
                        style={{ color: tally.read > 0 ? "var(--viz-critical)" : undefined }}
                      >
                        <FiEye size={12} aria-hidden="true" />
                        {tally.read} of {tally.total}
                      </span>
                    }
                  />
                  <DetailRow label="Items withdrawn" value={pack.items.length} />
                </div>
              </div>

              {tally.read > 0 && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {tally.read} participant{tally.read === 1 ? " had" : "s had"} already
                  opened this pack before it was withdrawn. Revoking access removes
                  the document; it does not undo what was read, which is why the
                  reason above is part of the permanent record.
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
