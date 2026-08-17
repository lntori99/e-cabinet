"use client";

import { FiCircle, FiClock, FiDatabase, FiEye, FiSlash, FiUsers } from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectVideoSessions } from "@/core/slices/video-slice";
import { RECORDING_POLICY } from "@/data/video";

export default function RecordingPolicyBoard() {
  const sessions = useAppSelector(selectVideoSessions);
  const recording = sessions.filter((s) => s.recordingEnabled);
  const approved = sessions.filter((s) => s.recordingApproval);

  return (
    <div className="space-y-8">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-good)" }}
      >
        <FiSlash
          size={18}
          className="mt-0.5 shrink-0"
          style={{ color: "var(--viz-good)" }}
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            Disabled by default on every session
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            A session starts with recording off. Turning it on is a decision that
            follows the approved path below — the host cannot simply choose to.
            {recording.length > 0
              ? ` ${recording.length} session is recording now.`
              : " Nothing is recording now."}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
            <FiDatabase size={16} className="text-neutral-400" aria-hidden="true" />
            What Government approved
          </h2>
          <div className="mt-3 space-y-0.5">
            <DetailRow label="Storage location" value={RECORDING_POLICY.storageLocation} />
            <DetailRow
              label="Retention"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <FiClock size={12} className="text-neutral-400" aria-hidden="true" />
                  {RECORDING_POLICY.retentionDays} days, then disposal
                </span>
              }
            />
            <DetailRow
              label="Access rights"
              value={
                <span className="inline-flex items-start gap-1.5">
                  <FiUsers size={12} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
                  {RECORDING_POLICY.accessRights}
                </span>
              }
            />
            <DetailRow
              label="Approved by"
              value={`${RECORDING_POLICY.approvedBy} · ${RECORDING_POLICY.approvedAt}`}
            />
          </div>
        </article>

        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
            The authorisation path
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Every step is taken before the host can enable recording on a session.
          </p>
          <ol className="mt-3 space-y-2.5">
            {RECORDING_POLICY.authorisationPath.map((step, index) => (
              <li key={step} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-state-600/10 font-mono text-[10px] font-semibold text-state-700 dark:bg-state-900/40 dark:text-state-400">
                  {index + 1}
                </span>
                <span className="text-neutral-700 dark:text-neutral-300">{step}</span>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">The notice participants see</h2>
        <div
          className="flex items-center gap-3 rounded-lg border p-4"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--viz-critical)" }}
            aria-hidden="true"
          >
            <FiCircle size={14} color="#fff" />
          </span>
          <p className="text-sm text-neutral-800 dark:text-neutral-200">
            {RECORDING_POLICY.participantNotice}
          </p>
        </div>
        <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <FiEye size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          FR-VID-12 — the notice is shown for the whole duration, to everyone,
          whether they joined from the room or remotely. There is no configuration
          that suppresses it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Sessions with an approval on file</h2>

        {approved.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            No session has been approved for recording.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Session</Th>
                <Th>Approval</Th>
                <Th>Recording now</Th>
              </tr>
            </thead>
            <tbody>
              {approved.map((session) => (
                <tr key={session.id}>
                  <Td>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {session.meetingTitle}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {session.id} · {session.meetingId}
                    </span>
                  </Td>
                  <Td>{session.recordingApproval}</Td>
                  <Td>
                    <StatusBadge tone={session.recordingEnabled ? "red" : "neutral"}>
                      {session.recordingEnabled ? "Recording" : "Not recording"}
                    </StatusBadge>
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
