"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiAlertOctagon,
  FiBellOff,
  FiCheckCircle,
  FiPackage,
  FiSlash,
} from "react-icons/fi";
import { LuCalendarCheck } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectDisruptedMeetings,
  selectMeetings,
  selected,
} from "@/core/slices/meetings-slice";
import type { Meeting } from "@/models/response/base-response";
import DisruptMeetingModal from "../../components/disruptMeetingModal";
import { STATUS_TONE, isActive } from "../../components/meetingStatus";
import { DetailRow, Table, Td, Th } from "@/common/table";

function DisruptionCard({ meeting }: { meeting: Meeting }) {
  const dispatch = useAppDispatch();
  const d = meeting.disruption;
  if (!d) return null;

  const cancelled = d.kind === "Cancelled";

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {meeting.id} · {meeting.type}
          </p>
          <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
            {meeting.title}
          </h3>
        </div>
        <span
          className="stamp"
          style={{ color: cancelled ? "var(--viz-critical)" : "var(--viz-warning)" }}
        >
          {cancelled ? <FiSlash size={10} /> : <FiAlertOctagon size={10} />}
          {d.kind}
        </span>
      </header>

      <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
        {d.reason}
      </p>

      <div className="mt-3 space-y-0.5">
        <DetailRow
          label={cancelled ? "Was to sit" : "Now sits"}
          value={`${meeting.date} · ${meeting.time}`}
        />
        {!cancelled && d.postponedToDate && (
          <DetailRow label="Moved to" value={`${d.postponedToDate} · ${d.postponedToTime ?? meeting.time}`} />
        )}
        <DetailRow
          label="Packs"
          value={
            <span className="inline-flex items-center gap-1.5">
              <FiPackage size={12} className="text-neutral-400" aria-hidden="true" />
              {d.packHandling}
            </span>
          }
        />
        <DetailRow
          label="Participants"
          value={
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                color: d.participantsNotified
                  ? "var(--viz-good)"
                  : "var(--viz-critical)",
              }}
            >
              {d.participantsNotified ? (
                <FiCheckCircle size={12} aria-hidden="true" />
              ) : (
                <FiBellOff size={12} aria-hidden="true" />
              )}
              {d.participantsNotified ? "Notified" : "Not yet notified"}
            </span>
          }
        />
        <DetailRow label="Recorded by" value={`${d.by} · ${d.at.replace("T", " ")}`} />
      </div>

      <Link
        href="/meetings-agenda/all-meetings"
        onClick={() => dispatch(selected(meeting.id))}
        className="mt-4 inline-block text-sm font-medium text-state-700 hover:underline dark:text-state-400"
      >
        Open the sitting →
      </Link>
    </article>
  );
}

export default function DisruptionBoard() {
  const dispatch = useAppDispatch();
  const disrupted = useAppSelector(selectDisruptedMeetings);
  const meetings = useAppSelector(selectMeetings);
  const [target, setTarget] = useState<Meeting | null>(null);

  const active = meetings.filter(isActive);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Called off</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {disrupted.length} sitting{disrupted.length === 1 ? "" : "s"}
          </p>
        </div>

        {disrupted.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              icon={LuCalendarCheck}
              title="Nothing has been called off"
              description="No sitting on the register has been cancelled or postponed. When one is, the reason, the pack decision and the notification state are recorded here and on its change history."
            />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {disrupted.map((m) => (
              <DisruptionCard key={m.id} meeting={m} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Still on the books</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {active.length} sitting{active.length === 1 ? "" : "s"} that can be moved
          </p>
        </div>

        {active.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            There is no active sitting to cancel or postpone.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Sitting</Th>
                <Th>Sits</Th>
                <Th>Pack</Th>
                <Th>Status</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {active.map((m) => (
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
                      {m.id} · {m.participants.length} participants
                    </span>
                  </Td>
                  <Td>
                    {m.date}
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {m.time} · {m.venue}
                    </span>
                  </Td>
                  <Td>
                    {m.packFrozenAt ? (
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <FiPackage
                          size={13}
                          style={{ color: "var(--viz-warning)" }}
                          aria-hidden="true"
                        />
                        Released
                      </span>
                    ) : (
                      <span className="text-neutral-500 dark:text-neutral-400">
                        Not yet frozen
                      </span>
                    )}
                  </Td>
                  <Td>
                    <StatusBadge tone={STATUS_TONE[m.status]}>{m.status}</StatusBadge>
                  </Td>
                  <Td align="right">
                    <button
                      type="button"
                      onClick={() => setTarget(m)}
                      className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                    >
                      <FiSlash size={14} aria-hidden="true" />
                      Cancel or postpone
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          A sitting whose pack has already been released forces an explicit
          decision about that pack — recall it, retain it for the new date, or
          leave it in place — before the cancellation is recorded.
        </p>
      </section>

      {target && (
        <DisruptMeetingModal
          open
          onClose={() => setTarget(null)}
          meeting={target}
        />
      )}
    </div>
  );
}
