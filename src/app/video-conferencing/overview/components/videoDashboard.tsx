"use client";

import Link from "next/link";
import {
  FiCheckCircle,
  FiClock,
  FiLock,
  FiShield,
  FiUserCheck,
  FiUserX,
  FiVideo,
} from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { distance, hoursUntil, stamp } from "@/common/time";
import { Kpi, StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectAttendance,
  selectLiveVideoSessions,
  selectPendingExternals,
  selectQualityAlerts,
  selectScheduledSessions,
  selectVideoSessions,
  selectWaitingRoom,
} from "@/core/slices/video-slice";
import { decideAdmission } from "@/core/thunks-video";
import { QUALITY_TONE, SESSION_TONE } from "../../components/videoStatus";
import ParticipationChart from "./participationChart";
import QualityChart from "./qualityChart";

export default function VideoDashboard({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector(selectVideoSessions);
  const attendance = useAppSelector(selectAttendance);
  const live = useAppSelector(selectLiveVideoSessions);
  const scheduled = useAppSelector(selectScheduledSessions);
  const waiting = useAppSelector(selectWaitingRoom);
  const pendingExternal = useAppSelector(selectPendingExternals);
  const qualityAlerts = useAppSelector(selectQualityAlerts);

  const today = now.slice(0, 10);
  const todaySessions = sessions.filter((s) => s.scheduledFor.startsWith(today));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Sessions in progress"
          value={live.length}
          hint={
            live.length === 0
              ? "Nothing is running"
              : live.map((s) => s.meetingTitle).join(", ")
          }
          tone={live.length > 0 ? "green" : "neutral"}
        />
        <Kpi
          label="Scheduled today"
          value={todaySessions.length}
          hint={
            scheduled[0]
              ? `Next ${distance(hoursUntil(scheduled[0].scheduledFor, now))}`
              : "Nothing scheduled"
          }
        />
        <Kpi
          label="Pending external approvals"
          value={pendingExternal.length}
          hint="External participation is exceptional and pre-approved"
          tone={pendingExternal.length === 0 ? "green" : "amber"}
        />
        <Kpi
          label="Quality alerts"
          value={qualityAlerts.length}
          hint={
            qualityAlerts.length === 0
              ? "Every session held its quality"
              : "Sessions that did not stay good throughout"
          }
          tone={qualityAlerts.length === 0 ? "green" : "amber"}
        />
      </div>

      {waiting.length > 0 && (
        <section
          className="rounded-lg border bg-white dark:bg-neutral-900"
          style={{ borderColor: "var(--viz-warning)" }}
        >
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <h2
              className="flex items-center gap-2 font-bold"
              style={{ color: "var(--viz-warning)" }}
            >
              <FiClock size={16} aria-hidden="true" />
              Waiting room
            </h2>
            <Link
              href="/video-conferencing/sessions"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Sessions →
            </Link>
          </header>

          <ul className="divide-y divide-neutral-100 px-5 dark:divide-neutral-800">
            {waiting.map((person) => {
              const session = sessions.find((s) => s.id === person.sessionId);
              return (
                <li
                  key={person.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {person.name}
                    </span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                      {person.role} · {person.mode} ·{" "}
                      {session?.meetingTitle ?? person.sessionId}
                      {person.mfaMethod ? ` · ${person.mfaMethod}` : ""}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-2">
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
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <QualityChart sessions={sessions} />
        <ParticipationChart sessions={sessions} attendance={attendance} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">Next sessions</h2>
            <Link
              href="/video-conferencing/sessions"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              All sessions →
            </Link>
          </div>

          {scheduled.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              Nothing is scheduled.
            </p>
          ) : (
            <ul className="space-y-2">
              {scheduled.map((session) => (
                <li
                  key={session.id}
                  className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        <FiVideo size={13} className="text-neutral-400" aria-hidden="true" />
                        {session.meetingTitle}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        {stamp(session.scheduledFor)} ·{" "}
                        {distance(hoursUntil(session.scheduledFor, now))} ·{" "}
                        {session.meetingId}
                      </span>
                    </span>
                    <StatusBadge tone={SESSION_TONE[session.state]}>
                      {session.state}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="inline-flex items-center gap-1.5">
                      <FiLock size={11} aria-hidden="true" />
                      {session.locked ? "Locked" : "Unlocked"}
                    </span>
                    <span>
                      Waiting room {session.waitingRoom ? "on" : "off"}
                    </span>
                    <span>
                      Recording {session.recordingEnabled ? "enabled" : "off"}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">External participation</h2>
            <Link
              href="/video-conferencing/external-participants"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              External participants →
            </Link>
          </div>

          {pendingExternal.length === 0 ? (
            <p className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              <FiCheckCircle
                size={15}
                style={{ color: "var(--viz-good)" }}
                aria-hidden="true"
              />
              No external join is waiting on approval.
            </p>
          ) : (
            <ul className="space-y-2">
              {pendingExternal.map((authorisation) => (
                <li
                  key={authorisation.id}
                  className="rounded-lg border p-3"
                  style={{ borderColor: "var(--viz-warning)" }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {authorisation.name}
                      </span>
                      <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                        {authorisation.role} · {authorisation.meetingId}
                      </span>
                    </span>
                    <StatusBadge tone="amber">Awaiting approval</StatusBadge>
                  </div>
                  {authorisation.scopeNote && (
                    <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">
                      {authorisation.scopeNote}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {qualityAlerts.length > 0 && (
            <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100">
                Quality alerts
              </h3>
              <div className="mt-3 space-y-0.5">
                {qualityAlerts.map((session) => (
                  <DetailRow
                    key={session.id}
                    label={session.meetingTitle}
                    value={
                      <StatusBadge tone={QUALITY_TONE[session.qualityRating]}>
                        {session.qualityRating}
                      </StatusBadge>
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <FiShield size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        Being in a session confers no document permission. What a participant can
        open is decided by their entitlements and nothing else — joining a call
        has never been a way to reach a paper.
      </p>
    </div>
  );
}
