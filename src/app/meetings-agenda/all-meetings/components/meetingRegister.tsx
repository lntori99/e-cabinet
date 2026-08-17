"use client";

import { FiRepeat } from "react-icons/fi";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectFilteredMeetings,
  selectSelectedMeetingId,
  selectStatusFilter,
  selected,
  statusFilterChanged,
  submissionsClosed,
} from "@/core/slices/meetings-slice";
import { STATUS_TONE } from "../../components/meetingStatus";

const FILTERS = [
  "All",
  "Submissions Open",
  "Pack Assembly",
  "Pack Frozen",
  "Concluded",
];

/**
 * FR-MTG-01 — the register of sittings. Selecting one drives the detail pane;
 * the status chips and the free-text query narrow it without changing what a
 * row says.
 */
export default function MeetingRegister({
  query,
  now,
}: {
  query: string;
  now: string;
}) {
  const dispatch = useAppDispatch();
  const meetings = useAppSelector(selectFilteredMeetings);
  const selectedId = useAppSelector(selectSelectedMeetingId);
  const filter = useAppSelector(selectStatusFilter);

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? meetings.filter((m) =>
        [m.id, m.title, m.venue, m.type, m.chair].some((field) =>
          field.toLowerCase().includes(needle),
        ),
      )
    : meetings;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => dispatch(statusFilterChanged(f))}
            aria-pressed={filter === f}
            className={`rounded-full border px-2.5 py-1 text-xs transition ${
              filter === f
                ? "border-state-600 bg-state-600 text-white"
                : "border-neutral-300 text-neutral-600 hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
        {visible.length} of {meetings.length} sittings
      </p>

      <ul className="space-y-2">
        {visible.map((m) => {
          const active = m.id === selectedId;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => dispatch(selected(m.id))}
                aria-current={active ? "true" : undefined}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  active
                    ? "border-state-500 bg-state-50 dark:border-state-700 dark:bg-state-900/20"
                    : "border-neutral-200 bg-white hover:border-state-300 dark:border-neutral-800 dark:bg-neutral-900"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {m.id}
                  </span>
                  <StatusBadge tone={STATUS_TONE[m.status]}>{m.status}</StatusBadge>
                </div>
                <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
                  {m.title}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {m.date} · {m.time} · {m.venue}
                </p>
                <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <span>{m.agenda.length} items</span>
                  <span>·</span>
                  <span>{m.participants.length} participants</span>
                  {m.recurrence !== "None" && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <FiRepeat size={10} /> {m.recurrence}
                      </span>
                    </>
                  )}
                  {submissionsClosed(m, now) && (
                    <>
                      <span>·</span>
                      <span className="text-signal-500">Submissions closed</span>
                    </>
                  )}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      {visible.length === 0 && (
        <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          {needle
            ? `Nothing in the register matches “${query.trim()}”.`
            : "No sittings match this filter."}
        </p>
      )}
    </div>
  );
}
