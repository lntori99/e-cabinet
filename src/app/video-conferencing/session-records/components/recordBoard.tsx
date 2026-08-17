"use client";

import { useMemo, useState } from "react";
import { FiClock, FiUsers } from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  selectSessionAttendance,
  selectSessionEvents,
  selectVideoSessions,
} from "@/core/slices/video-slice";
import {
  ATTENDANCE_TONE,
  EVENT_TONE,
  MODE_COLOR,
  QUALITY_TONE,
  SESSION_TONE,
} from "../../components/videoStatus";

export default function RecordBoard() {
  const sessions = useAppSelector(selectVideoSessions);
  const ordered = [...sessions].sort((a, b) =>
    b.scheduledFor.localeCompare(a.scheduledFor),
  );
  // Open on the most recent session that has actually run. A scheduled sitting
  // has no record yet, and landing on an empty one reads like a fault.
  const [selectedId, setSelectedId] = useState<string>(
    ordered.find((s) => s.startedAt)?.id ?? ordered[0]?.id ?? "",
  );

  const session = ordered.find((s) => s.id === selectedId) ?? ordered[0];

  const eventsSelector = useMemo(
    () => selectSessionEvents(session?.id ?? ""),
    [session?.id],
  );
  const attendanceSelector = useMemo(
    () => selectSessionAttendance(session?.id ?? ""),
    [session?.id],
  );
  const events = useAppSelector(eventsSelector);
  const people = useAppSelector(attendanceSelector);

  if (!session) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        There is no session to report on.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5">
        {ordered.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            aria-pressed={item.id === session.id}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              item.id === session.id
                ? "border-state-600 bg-state-600 text-white"
                : "border-neutral-300 text-neutral-600 hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
            }`}
          >
            {item.meetingTitle}
          </button>
        ))}
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              {session.id} · {session.meetingId}
            </p>
            <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
              {session.meetingTitle}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={SESSION_TONE[session.state]}>{session.state}</StatusBadge>
            {session.quality.length > 0 && (
              <StatusBadge tone={QUALITY_TONE[session.qualityRating]}>
                {session.qualityRating}
              </StatusBadge>
            )}
          </div>
        </header>

        <div className="grid gap-6 px-5 py-4 lg:grid-cols-2">
          <div className="space-y-0.5">
            <DetailRow label="Host" value={session.host} />
            <DetailRow
              label="Started"
              value={session.startedAt ? stamp(session.startedAt) : "Not started"}
            />
            <DetailRow
              label="Ended"
              value={session.endedAt ? stamp(session.endedAt) : "Still open"}
            />
          </div>
          <div className="space-y-0.5">
            <DetailRow
              label="Attendance"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <FiUsers size={12} className="text-neutral-400" aria-hidden="true" />
                  {[
                    `${people.filter((p) => p.joinedAt).length} joined`,
                    ...(people.some((p) => p.state === "In waiting room")
                      ? [
                          `${people.filter((p) => p.state === "In waiting room").length} waiting`,
                        ]
                      : []),
                    ...(people.some((p) => p.state === "Refused")
                      ? [`${people.filter((p) => p.state === "Refused").length} refused`]
                      : []),
                  ].join(" · ")}
                </span>
              }
            />
            <DetailRow
              label="Recording"
              value={session.recordingEnabled ? "Enabled for this session" : "Not recorded"}
            />
            <DetailRow label="Events recorded" value={events.length} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Attendance</h2>
        {people.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Nobody has joined. The attendance record opens with the first
            admission and closes when the session ends.
          </p>
        ) : (
        <Table>
          <thead>
            <tr>
              <Th>Participant</Th>
              <Th>Joined as</Th>
              <Th>Joined</Th>
              <Th>Left</Th>
              <Th>State</Th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id}>
                <Td>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {person.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {person.role}
                    {person.mfaMethod ? ` · ${person.mfaMethod}` : ""}
                  </span>
                </Td>
                <Td>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: MODE_COLOR[person.mode] }}
                      aria-hidden="true"
                    />
                    {person.mode}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono">
                    {person.joinedAt ? stamp(person.joinedAt) : "—"}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono">
                    {person.leftAt ? stamp(person.leftAt) : "—"}
                  </span>
                </Td>
                <Td>
                  <StatusBadge tone={ATTENDANCE_TONE[person.state]}>
                    {person.state}
                  </StatusBadge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">What happened</h2>

        {events.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Nothing has been recorded against this session yet.
          </p>
        ) : (
          <ol className="space-y-3 border-l border-neutral-200 pl-5 dark:border-neutral-800">
            {events.map((event) => (
              <li key={event.id} className="relative">
                <span
                  className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full"
                  style={{
                    background:
                      event.severity === "info"
                        ? "var(--viz-axis)"
                        : event.severity === "warning"
                          ? "var(--viz-warning)"
                          : "var(--viz-critical)",
                  }}
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {event.kind}
                    </span>
                    <StatusBadge tone={EVENT_TONE[event.severity]}>
                      {event.severity}
                    </StatusBadge>
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    <FiClock size={11} aria-hidden="true" />
                    {stamp(event.at)} · {event.actor}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                  {event.detail}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
