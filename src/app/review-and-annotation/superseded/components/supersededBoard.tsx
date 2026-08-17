"use client";

import Link from "next/link";
import { FiAlertTriangle, FiArrowRight, FiBookOpen } from "react-icons/fi";
import { LuCircleCheckBig } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { opened, selectSuperseded } from "@/core/slices/review-slice";
import { ANNOTATION_TONE } from "../../components/readingStatus";

export default function SupersededBoard() {
  const dispatch = useAppDispatch();
  const rows = useAppSelector(selectSuperseded);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuCircleCheckBig}
          title="Nothing you annotated has been replaced"
          description="Every paper you have notes on is still the current version. If one is replaced, it appears here with your notes intact against the version you read."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rows.map(({ item, annotations }) => (
        <section
          key={item.documentId}
          className="rounded-lg border bg-white dark:bg-neutral-900"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {item.documentId} · {item.meetingId}
              </p>
              <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                {item.documentTitle}
              </h2>
            </div>
            <span className={`stamp ${classificationTone(item.classification)}`}>
              {item.classification}
            </span>
          </header>

          <div className="space-y-4 px-5 py-4">
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
                A newer version exists. Read {item.supersededByVersionId} before the
                sitting — what you noted below may have changed.
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm text-neutral-500 line-through dark:text-neutral-400">
                {item.versionId}
              </span>
              <FiArrowRight size={14} className="text-neutral-400" aria-hidden="true" />
              <span className="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {item.supersededByVersionId}
              </span>
              <StatusBadge tone="red">Superseded</StatusBadge>
            </div>

            <div className="space-y-0.5">
              <DetailRow label="Agenda item" value={item.agendaItemTitle} />
              <DetailRow
                label="You acknowledged"
                value={
                  item.acknowledgedAt
                    ? `${stamp(item.acknowledgedAt)} — against ${item.versionId}`
                    : "Not acknowledged"
                }
              />
              <DetailRow
                label="Notes retained"
                value={`${annotations.length} against the superseded version`}
              />
            </div>

            {annotations.length > 0 && (
              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                  Your notes, kept where you made them
                </h3>
                <ul className="mt-2 space-y-2">
                  {annotations.map((note) => (
                    <li
                      key={note.id}
                      className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={ANNOTATION_TONE[note.kind]}>
                          {note.kind}
                        </StatusBadge>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                          page {note.page} · {note.versionId} · {stamp(note.createdAt)}
                        </span>
                      </div>
                      {note.anchorText && (
                        <p className="mt-2 border-l-2 border-signal-400 pl-3 text-sm italic text-neutral-600 dark:text-neutral-300">
                          “{note.anchorText}”
                        </p>
                      )}
                      <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                        {note.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              href="/review-and-annotation/current-pack"
              onClick={() => dispatch(opened(item.documentId))}
              className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700"
            >
              <FiBookOpen size={15} aria-hidden="true" />
              Open the paper
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}
