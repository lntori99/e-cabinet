"use client";

import { LuBookOpen } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  opened,
  selectCurrentPack,
  selectOpenDocumentId,
} from "@/core/slices/review-slice";
import type { ReadingItem } from "@/models/response/base-response";
import PaperReader from "../../components/paperReader";
import ReadingList from "../../components/readingList";

/** Papers grouped under the agenda item they belong to — FR-REV-02. */
function byAgendaItem(items: ReadingItem[]) {
  const groups: { title: string; items: ReadingItem[] }[] = [];
  for (const item of items) {
    const group = groups.find((g) => g.title === item.agendaItemTitle);
    if (group) group.items.push(item);
    else groups.push({ title: item.agendaItemTitle, items: [item] });
  }
  return groups;
}

export default function PackReadingRoom({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const pack = useAppSelector(selectCurrentPack);
  const openId = useAppSelector(selectOpenDocumentId);

  if (!pack) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuBookOpen}
          title="No pack is open to you"
          description="Nothing has been released to you yet. A pack appears here as soon as the Secretariat releases it for a sitting you are named on."
        />
      </div>
    );
  }

  const active = pack.items.some((i) => i.documentId === openId)
    ? openId
    : pack.items[0].documentId;

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            {pack.meetingId} · {pack.meetingDate}
          </p>
          <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
            {pack.meetingTitle}
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {pack.items.length} papers ·{" "}
            {pack.items.filter((i) => i.acknowledgedAt).length} acknowledged
          </p>
        </div>

        {byAgendaItem(pack.items).map((group, index) => (
          <div key={group.title} className="space-y-2">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              {index + 1}. {group.title}
            </h3>
            <ReadingList
              items={group.items}
              selectedId={active}
              onSelect={(id) => dispatch(opened(id))}
              emptyMessage="No paper under this item."
            />
          </div>
        ))}
      </div>

      <div className="min-w-0">
        <PaperReader items={pack.items} activeId={active} now={now} />
      </div>
    </div>
  );
}
