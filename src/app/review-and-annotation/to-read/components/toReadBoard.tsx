"use client";

import { useState } from "react";
import { FiClock } from "react-icons/fi";
import { LuCircleCheckBig } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { distance, hoursUntil } from "@/common/time";
import { useAppSelector } from "@/core/hook";
import { selectToRead } from "@/core/slices/review-slice";
import type { ReadingItem } from "@/models/response/base-response";
import PaperReader from "../../components/paperReader";
import ReadingList from "../../components/readingList";

/** Grouped by sitting, soonest first — the order the reading has to happen in. */
function bySitting(items: ReadingItem[]) {
  const groups: { meetingId: string; title: string; date: string; items: ReadingItem[] }[] = [];
  for (const item of items) {
    const group = groups.find((g) => g.meetingId === item.meetingId);
    if (group) group.items.push(item);
    else
      groups.push({
        meetingId: item.meetingId,
        title: item.meetingTitle,
        date: item.meetingDate,
        items: [item],
      });
  }
  return groups;
}

export default function ToReadBoard({ now }: { now: string }) {
  const toRead = useAppSelector(selectToRead);
  const [activeId, setActiveId] = useState("");

  if (toRead.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuCircleCheckBig}
          title="Nothing waiting"
          description="You have acknowledged every paper released to you. Anything new will appear here as soon as its pack goes out."
        />
      </div>
    );
  }

  const active = toRead.some((i) => i.documentId === activeId)
    ? activeId
    : toRead[0].documentId;

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-5">
        {bySitting(toRead).map((group) => {
          const until = hoursUntil(`${group.date}T09:00`, now);
          return (
            <div key={group.meetingId} className="space-y-2">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {group.title}
                </h2>
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <FiClock
                    size={11}
                    style={{ color: until > 0 && until <= 72 ? "var(--viz-warning)" : undefined }}
                    aria-hidden="true"
                  />
                  {group.date} · {distance(until)} · {group.items.length} to read
                </p>
              </div>
              <ReadingList
                items={group.items}
                selectedId={active}
                onSelect={setActiveId}
                emptyMessage="Nothing outstanding for this sitting."
              />
            </div>
          );
        })}
      </div>

      <div className="min-w-0">
        <PaperReader items={toRead} activeId={active} now={now} />
      </div>
    </div>
  );
}
