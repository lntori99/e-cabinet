"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FiCircle,
  FiLock,
  FiMic,
  FiMicOff,
  FiMonitor,
  FiShare2,
  FiUnlock,
  FiUserCheck,
  FiUserX,
  FiVideo,
} from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { distance, hoursUntil, stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectSessionAttendance,
  selectVideoSessions,
} from "@/core/slices/video-slice";
import {
  decideAdmission,
  removeParticipant,
  setMuted,
  setScreenShare,
  takeHostAction,
} from "@/core/thunks-video";
import { RECORDING_POLICY } from "@/data/video";
import {
  ATTENDANCE_TONE,
  MODE_COLOR,
  QUALITY_TONE,
  SESSION_TONE,
} from "../../components/videoStatus";
import JitsiRoom from "../../components/jitsiRoom";

export default function SessionConsole({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector(selectVideoSessions);
  const [selectedId, setSelectedId] = useState("");

  const ordered = [...sessions].sort((a, b) =>
    b.scheduledFor.localeCompare(a.scheduledFor),
  );
  const session =
    ordered.find((s) => s.id === selectedId) ??
    ordered.find((s) => s.state === "In progress") ??
    ordered[0];

  const attendanceSelector = useMemo(
    () => selectSessionAttendance(session?.id ?? ""),
    [session?.id],
  );
  const people = useAppSelector(attendanceSelector);

  if (!session) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        No video session has been scheduled.
      </p>
    );
  }

  const waiting = people.filter((p) => p.state === "In waiting room");
  const admitted = people.filter((p) => p.state === "Admitted");
  const live = session.state === "In progress" || session.state === "Waiting room open";

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          {sessions.length} sessions
        </p>

        <ul className="space-y-2">
          {ordered.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelectedId(item.id)}
                aria-current={item.id === session.id ? "true" : undefined}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  item.id === session.id
                    ? "border-state-500 bg-state-50 dark:border-state-700 dark:bg-state-900/20"
                    : "border-neutral-200 bg-white hover:border-state-300 dark:border-neutral-800 dark:bg-neutral-900"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {item.id}
                  </span>
                  <StatusBadge tone={SESSION_TONE[item.state]}>{item.state}</StatusBadge>
                </div>
                <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
                  {item.meetingTitle}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {stamp(item.scheduledFor)} · {item.meetingId}
                </p>
                {item.quality.length > 0 && (
                  <p className="mt-1.5">
                    <StatusBadge tone={QUALITY_TONE[item.qualityRating]}>
                      {item.qualityRating}
                    </StatusBadge>
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="min-w-0 space-y-6">
        <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {session.id} · {session.meetingId}
              </p>
              <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {session.meetingTitle}
              </h2>
            </div>
            <StatusBadge tone={SESSION_TONE[session.state]}>{session.state}</StatusBadge>
          </header>

          <div className="grid gap-6 px-5 py-4 lg:grid-cols-2">
            <div className="space-y-0.5">
              <DetailRow label="Host" value={session.host} />
              <DetailRow
                label="Scheduled"
                value={`${stamp(session.scheduledFor)}${
                  session.state === "Scheduled" || session.state === "Waiting room open"
                    ? ` · ${distance(hoursUntil(session.scheduledFor, now))}`
                    : ""
                }`}
              />
              <DetailRow
                label="Started"
                value={session.startedAt ? stamp(session.startedAt) : "Not started"}
              />
              <DetailRow
                label="Room"
                value={session.roomId ?? "Remote participants only"}
              />
            </div>

            <div className="space-y-0.5">
              <DetailRow
                label="Presenting"
                value={
                  session.presentingPackId ? (
                    <span className="inline-flex items-center gap-1.5">
                      <FiMonitor size={12} className="text-neutral-400" aria-hidden="true" />
                      {session.presentingPackId} — from within the platform
                    </span>
                  ) : (
                    "Nothing on the shared surface"
                  )
                }
              />
              <DetailRow
                label="Screen sharing"
                value={
                  session.screenShareHostOnly
                    ? "Host only, unless granted per participant"
                    : "Open to participants"
                }
              />
              <DetailRow
                label="Recording"
                value={
                  session.recordingEnabled ? (
                    <span
                      className="inline-flex items-center gap-1.5 font-medium"
                      style={{ color: "var(--viz-critical)" }}
                    >
                      <FiCircle size={10} aria-hidden="true" />
                      Recording — every participant is notified on screen
                    </span>
                  ) : (
                    "Disabled"
                  )
                }
              />
              {session.recordingApproval && (
                <DetailRow label="Recording approved by" value={session.recordingApproval} />
              )}
            </div>
          </div>

          {live && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {admitted.length} admitted · {waiting.length} waiting
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      takeHostAction({
                        session,
                        patch: { locked: !session.locked },
                        detail: session.locked
                          ? "Meeting unlocked; admissions reopened"
                          : "Meeting locked; no further admissions without unlocking",
                      }),
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
                >
                  {session.locked ? (
                    <>
                      <FiUnlock size={15} aria-hidden="true" />
                      Unlock
                    </>
                  ) : (
                    <>
                      <FiLock size={15} aria-hidden="true" />
                      Lock the meeting
                    </>
                  )}
                </button>

                {session.recordingEnabled ? (
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        takeHostAction({
                          session,
                          patch: { recordingEnabled: false },
                          detail: "Recording stopped by the host",
                        }),
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-4 py-2 text-sm font-semibold text-seal-500 transition hover:bg-seal-500 hover:text-white"
                  >
                    <FiCircle size={15} aria-hidden="true" />
                    Stop recording
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!session.recordingApproval}
                    onClick={() =>
                      dispatch(
                        takeHostAction({
                          session,
                          patch: { recordingEnabled: true },
                          detail: `Recording started on ${session.recordingApproval}; all participants notified on screen`,
                        }),
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-seal-500 hover:text-seal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"
                  >
                    <FiCircle size={15} aria-hidden="true" />
                    {session.recordingApproval
                      ? "Start recording"
                      : "Recording needs approval"}
                  </button>
                )}
              </div>
            </div>
          )}

          <JitsiRoom session={session} />
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">Participants</h2>
            <Link
              href="/video-conferencing/join-authorisation"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Join authorisation →
            </Link>
          </div>

          {people.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              Nobody has attempted to join this session.
            </p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Participant</Th>
                  <Th>Joined as</Th>
                  <Th>State</Th>
                  <Th align="right">Host controls</Th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr
                    key={person.id}
                    className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                  >
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
                      {person.joinedAt && (
                        <span className="mt-0.5 block font-mono text-xs text-neutral-500 dark:text-neutral-400">
                          {stamp(person.joinedAt)}
                          {person.leftAt ? ` → ${stamp(person.leftAt)}` : ""}
                        </span>
                      )}
                    </Td>
                    <Td>
                      <StatusBadge tone={ATTENDANCE_TONE[person.state]}>
                        {person.state}
                      </StatusBadge>
                      {person.screenShareGranted && (
                        <span
                          className="mt-1 flex items-center gap-1.5 text-xs"
                          style={{ color: "var(--viz-warning)" }}
                        >
                          <FiShare2 size={11} aria-hidden="true" />
                          Screen share granted
                        </span>
                      )}
                    </Td>
                    <Td align="right">
                      {person.state === "In waiting room" ? (
                        <span className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => dispatch(decideAdmission(person, true))}
                            className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-state-700"
                          >
                            <FiUserCheck size={14} aria-hidden="true" />
                            Admit
                          </button>
                          <button
                            type="button"
                            onClick={() => dispatch(decideAdmission(person, false))}
                            className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                          >
                            <FiUserX size={14} aria-hidden="true" />
                            Refuse
                          </button>
                        </span>
                      ) : person.state === "Admitted" ? (
                        <span className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => dispatch(setMuted(person, !person.muted))}
                            aria-label={person.muted ? "Unmute" : "Mute"}
                            className="rounded-lg border border-neutral-300 p-1.5 text-neutral-600 transition hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
                          >
                            {person.muted ? <FiMicOff size={15} /> : <FiMic size={15} />}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(setScreenShare(person, !person.screenShareGranted))
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
                          >
                            <FiShare2 size={14} aria-hidden="true" />
                            {person.screenShareGranted ? "Withdraw share" : "Grant share"}
                          </button>
                          <button
                            type="button"
                            onClick={() => dispatch(removeParticipant(person))}
                            className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                          >
                            <FiUserX size={14} aria-hidden="true" />
                            Remove
                          </button>
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          —
                        </span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <FiVideo size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            Recording stays off unless the approved path has been followed:{" "}
            {RECORDING_POLICY.authorisationPath.join(" → ")}.
          </p>
        </section>
      </div>
    </div>
  );
}
