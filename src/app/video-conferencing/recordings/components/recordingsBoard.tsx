"use client";

import { FiAlertTriangle, FiClock, FiTrash2, FiUsers } from "react-icons/fi";
import { LuFilm } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectRecordings } from "@/core/slices/video-slice";
import { disposeRecording } from "@/core/thunks-video";
import { RECORDING_POLICY } from "@/data/video";
import { RECORDING_TONE } from "../../components/videoStatus";

export default function RecordingsBoard({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const recordings = useAppSelector(selectRecordings);

  const today = now.slice(0, 10);
  const overdue = recordings.filter(
    (r) => r.state !== "Disposed" && r.retainUntil < today,
  );

  if (recordings.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuFilm}
          title="No recordings"
          description="Nothing has been recorded. Recording is off by default and only runs where the approved path has been followed."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p
        className="flex items-start gap-2 rounded-lg border p-4 text-sm"
        style={{ borderColor: "var(--viz-warning)" }}
      >
        <FiClock
          size={18}
          className="mt-0.5 shrink-0"
          style={{ color: "var(--viz-warning)" }}
          aria-hidden="true"
        />
        <span>
          <span className="block font-medium text-neutral-900 dark:text-neutral-100">
            Release 2 — held under the approved policy
          </span>
          <span className="mt-1 block text-neutral-600 dark:text-neutral-400">
            {RECORDING_POLICY.storageLocation} · retained{" "}
            {RECORDING_POLICY.retentionDays} days · {RECORDING_POLICY.accessRights}
          </span>
        </span>
      </p>

      {overdue.length > 0 && (
        <p
          className="flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <FiAlertTriangle
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-critical)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            {overdue.length} recording{overdue.length === 1 ? " is" : "s are"} past the
            retention date and still held. Disposal is part of the policy, not an
            afterthought.
          </span>
        </p>
      )}

      <Table>
        <thead>
          <tr>
            <Th>Recording</Th>
            <Th>Classification</Th>
            <Th>Retain until</Th>
            <Th>Who may reach it</Th>
            <Th>State</Th>
            <Th align="right">Action</Th>
          </tr>
        </thead>
        <tbody>
          {recordings.map((recording) => {
            const past = recording.state !== "Disposed" && recording.retainUntil < today;

            return (
              <tr
                key={recording.id}
                className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
              >
                <Td>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {recording.meetingTitle}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {recording.id} · {stamp(recording.recordedAt)}
                    {recording.durationMinutes > 0
                      ? ` · ${recording.durationMinutes} min`
                      : " · in progress"}
                  </span>
                </Td>
                <Td>
                  <span className={`stamp ${classificationTone(recording.classification)}`}>
                    {recording.classification}
                  </span>
                </Td>
                <Td>
                  <span
                    className="whitespace-nowrap font-mono"
                    style={{ color: past ? "var(--viz-critical)" : undefined }}
                  >
                    {recording.retainUntil}
                  </span>
                  {past && (
                    <span
                      className="mt-0.5 block text-xs"
                      style={{ color: "var(--viz-critical)" }}
                    >
                      Past retention
                    </span>
                  )}
                </Td>
                <Td>
                  <span className="inline-flex items-start gap-1.5">
                    <FiUsers size={12} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
                    {recording.accessGrantedTo.join(", ")}
                  </span>
                </Td>
                <Td>
                  <StatusBadge tone={RECORDING_TONE[recording.state]}>
                    {recording.state}
                  </StatusBadge>
                  {recording.disposedAt && (
                    <span className="mt-0.5 block font-mono text-xs text-neutral-500 dark:text-neutral-400">
                      {stamp(recording.disposedAt)}
                    </span>
                  )}
                </Td>
                <Td align="right">
                  {recording.state === "Disposed" ? (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Destroyed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(disposeRecording(recording.id, recording.meetingTitle))
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                    >
                      <FiTrash2 size={14} aria-hidden="true" />
                      Dispose
                    </button>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        No participant may download a recording. Access is granted to named roles
        and exercised inside the platform, under the same handling rules as any
        other classified material.
      </p>
    </div>
  );
}
