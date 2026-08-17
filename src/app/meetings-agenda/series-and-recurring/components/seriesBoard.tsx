"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FiRepeat, FiUsers } from "react-icons/fi";
import { LuCalendarRange } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectSeriesGroups,
  selectStandaloneMeetings,
  selected,
} from "@/core/slices/meetings-slice";
import type { Meeting } from "@/models/response/base-response";
import { STATUS_TONE, isActive } from "../../components/meetingStatus";
import { DetailRow, Table, Td, Th } from "@/common/table";

/**
 * What the series carries between sittings: items marked as standing, plus any
 * item that has appeared under the same title more than once. Both are what the
 * next sitting inherits rather than something the Secretariat retypes.
 */
function standingAgenda(sittings: Meeting[]) {
  const seen = new Map<string, { title: string; section: string; count: number; standing: boolean }>();

  for (const sitting of sittings) {
    for (const item of sitting.agenda) {
      const key = item.title.toLowerCase();
      const entry = seen.get(key);
      if (entry) {
        entry.count += 1;
        entry.standing = entry.standing || item.type === "Standing Item";
      } else {
        seen.set(key, {
          title: item.title,
          section: item.section,
          count: 1,
          standing: item.type === "Standing Item",
        });
      }
    }
  }

  return [...seen.values()]
    .filter((entry) => entry.standing || entry.count > 1)
    .sort((a, b) => b.count - a.count);
}

/** Participants named on every sitting in the series — the list that carries. */
function carriedParticipants(sittings: Meeting[]) {
  if (sittings.length === 0) return [];
  const [first, ...rest] = sittings;
  return first.participants.filter((p) =>
    rest.every((sitting) => sitting.participants.some((x) => x.name === p.name)),
  );
}

function SeriesCard({
  seriesId,
  recurrence,
  type,
  sittings,
}: {
  seriesId: string;
  recurrence: Meeting["recurrence"];
  type: Meeting["type"];
  sittings: Meeting[];
}) {
  const dispatch = useAppDispatch();
  const standing = useMemo(() => standingAgenda(sittings), [sittings]);
  const carried = useMemo(() => carriedParticipants(sittings), [sittings]);
  const next = sittings.filter(isActive).at(-1) ?? null;

  return (
    <article className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {seriesId}
          </p>
          <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
            {type}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
          <FiRepeat size={11} aria-hidden="true" /> {recurrence}
        </span>
      </header>

      <div className="space-y-5 p-5">
        <div className="space-y-0.5">
          <DetailRow label="Sittings in the series" value={sittings.length} />
          <DetailRow
            label="Next sitting"
            value={next ? `${next.date} · ${next.time}` : "None scheduled"}
          />
          <DetailRow label="Carried participants" value={carried.length} />
        </div>

        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Standing agenda
          </h4>
          {standing.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Nothing has recurred across these sittings yet.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {standing.map((entry) => (
                <li
                  key={entry.title}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 text-neutral-700 dark:text-neutral-300">
                    {entry.title}
                    <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                      {entry.section}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                    {entry.standing ? "Standing" : `${entry.count}×`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Carried participant list
          </h4>
          {carried.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              No one is named on every sitting in this series.
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {carried.map((p) => (
                <li
                  key={p.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  <FiUsers size={10} className="text-neutral-400" aria-hidden="true" />
                  {p.name}
                  <span className="text-neutral-500 dark:text-neutral-400">
                    · {p.capacity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Sittings
          </h4>
          <ul className="mt-2 divide-y divide-neutral-100 dark:divide-neutral-800">
            {sittings.map((sitting) => (
              <li
                key={sitting.id}
                className="flex flex-wrap items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <Link
                    href="/meetings-agenda/all-meetings"
                    onClick={() => dispatch(selected(sitting.id))}
                    className="text-sm font-medium text-neutral-900 hover:text-state-700 dark:text-neutral-100 dark:hover:text-state-400"
                  >
                    {sitting.title}
                  </Link>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {sitting.date} · {sitting.time} · {sitting.agenda.length} items
                  </p>
                </div>
                <StatusBadge tone={STATUS_TONE[sitting.status]}>
                  {sitting.status}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export default function SeriesBoard() {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectSeriesGroups);
  const standalone = useAppSelector(selectStandaloneMeetings);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Recurring series</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {groups.length} series on the register
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              icon={LuCalendarRange}
              title="No series yet"
              description="Give a meeting a recurrence when you create it and its sittings are grouped here, sharing a standing agenda and a participant list."
            />
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {groups.map((group) => (
              <SeriesCard key={group.seriesId} {...group} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">One-off sittings</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {standalone.length} outside any series
          </p>
        </div>

        {standalone.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Every sitting on the register belongs to a series.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Sitting</Th>
                <Th>Type</Th>
                <Th>Sits</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {standalone.map((m) => (
                <tr
                  key={m.id}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  <Td>
                    <Link
                      href="/meetings-agenda/all-meetings"
                      onClick={() => dispatch(selected(m.id))}
                      className="font-semibold text-neutral-900 hover:text-state-700 dark:text-neutral-100 dark:hover:text-state-400"
                    >
                      {m.title}
                    </Link>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {m.id}
                    </span>
                  </Td>
                  <Td>{m.type}</Td>
                  <Td>
                    {m.date}
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {m.time} · {m.venue}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge tone={STATUS_TONE[m.status]}>{m.status}</StatusBadge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}
