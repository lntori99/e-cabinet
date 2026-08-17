"use client";

import Link from "next/link";
import { FiAlertTriangle, FiBookOpen } from "react-icons/fi";
import { LuFolderOpen } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { opened, selectAnnotations, selectReaderPacks } from "@/core/slices/review-slice";
import { progress, readingState } from "../../components/readingStatus";

export default function PackShelf() {
  const dispatch = useAppDispatch();
  const packs = useAppSelector(selectReaderPacks);
  const annotations = useAppSelector(selectAnnotations);

  if (packs.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuFolderOpen}
          title="No packs"
          description="Nothing has been released to you. Packs appear here once the Secretariat releases them for sittings you are named on."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {packs.map((pack) => {
        const acknowledged = pack.items.filter((i) => i.acknowledgedAt).length;
        const notes = annotations.filter((a) => a.packId === pack.packId).length;

        return (
          <section key={pack.packId} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
                  {pack.meetingTitle}
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {pack.packId} · sat {pack.meetingDate} · {acknowledged} of{" "}
                  {pack.items.length} acknowledged · {notes} of your notes
                </p>
              </div>
              <Link
                href="/review-and-annotation/current-pack"
                onClick={() => dispatch(opened(pack.items[0].documentId))}
                className="inline-flex items-center gap-2 text-sm font-medium text-state-700 hover:underline dark:text-state-400"
              >
                <FiBookOpen size={14} aria-hidden="true" />
                Open in the reading view
              </Link>
            </div>

            <Table>
              <thead>
                <tr>
                  <Th>Paper</Th>
                  <Th>Agenda item</Th>
                  <Th>Classification</Th>
                  <Th align="right">Read</Th>
                  <Th>State</Th>
                </tr>
              </thead>
              <tbody>
                {pack.items.map((item) => {
                  const state = readingState(item);
                  return (
                    <tr
                      key={item.documentId}
                      className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                    >
                      <Td>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {item.documentTitle}
                        </span>
                        <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                          {item.documentId} · {item.versionId}
                        </span>
                        {item.supersededByVersionId && (
                          <span
                            className="mt-1 inline-flex items-center gap-1.5 text-xs"
                            style={{ color: "var(--viz-critical)" }}
                          >
                            <FiAlertTriangle size={11} aria-hidden="true" />
                            Replaced by {item.supersededByVersionId}
                          </span>
                        )}
                      </Td>
                      <Td>{item.agendaItemTitle}</Td>
                      <Td>
                        <span className={`stamp ${classificationTone(item.classification)}`}>
                          {item.classification}
                        </span>
                      </Td>
                      <Td align="right">
                        <span className="font-mono">{progress(item)}%</span>
                        <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                          {item.pagesRead}/{item.pages} pages
                        </span>
                      </Td>
                      <Td>
                        <StatusBadge tone={state.tone}>{state.label}</StatusBadge>
                        {item.acknowledgedAt && (
                          <span className="mt-0.5 block font-mono text-xs text-neutral-500 dark:text-neutral-400">
                            {stamp(item.acknowledgedAt)}
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
