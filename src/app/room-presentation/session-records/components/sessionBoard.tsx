"use client";

import {
  FiAlertTriangle,
  FiCheckCircle,
  FiEdit2,
  FiFileText,
  FiPlayCircle,
  FiRefreshCw,
  FiVideo,
} from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { distance, hoursUntil, stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectRoomSessions, selectRooms } from "@/core/slices/rooms-slice";
import { recordClearDown } from "@/core/thunks-rooms";
import { CLEAR_DOWN_TONE } from "../../components/roomStatus";

export default function SessionBoard({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector(selectRoomSessions);
  const rooms = useAppSelector(selectRooms);

  const ordered = [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const outstanding = sessions.filter((s) => s.clearDown !== "Confirmed");

  return (
    <div className="space-y-6">
      {outstanding.length > 0 && (
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
            {outstanding.length} session{outstanding.length === 1 ? "" : "s"} without a
            confirmed clear-down. Until it passes, the endpoint is treated as still
            holding session state, cached content, credentials and annotations.
          </span>
        </p>
      )}

      {ordered.map((session) => {
        const room = rooms.find((r) => r.id === session.roomId);
        const running = !session.endedAt;

        return (
          <article
            key={session.id}
            className="rounded-lg border bg-white dark:bg-neutral-900"
            style={{
              borderColor:
                session.clearDown === "Failed"
                  ? "var(--viz-critical)"
                  : running
                    ? "var(--viz-good)"
                    : undefined,
            }}
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {session.id} · {room?.name ?? session.roomId} · {session.meetingId}
                </p>
                <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                  {session.meetingTitle}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {running && (
                  <StatusBadge tone="green">
                    <span className="inline-flex items-center gap-1.5">
                      <FiPlayCircle size={10} aria-hidden="true" />
                      In progress
                    </span>
                  </StatusBadge>
                )}
                <StatusBadge tone={CLEAR_DOWN_TONE[session.clearDown]}>
                  Clear-down {session.clearDown.toLowerCase()}
                </StatusBadge>
              </div>
            </header>

            <div className="grid gap-6 px-5 py-4 lg:grid-cols-2">
              <div className="space-y-0.5">
                <DetailRow label="Host" value={session.host} />
                <DetailRow
                  label="Started"
                  value={`${stamp(session.startedAt)}${running ? ` · ${distance(hoursUntil(session.startedAt, now))}` : ""}`}
                />
                <DetailRow
                  label="Ended"
                  value={session.endedAt ? stamp(session.endedAt) : "Still running"}
                />
                <DetailRow
                  label="Presented"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <FiFileText size={12} className="text-neutral-400" aria-hidden="true" />
                      {session.itemsPresented} agenda items · {session.papersPresented}{" "}
                      papers
                    </span>
                  }
                />
              </div>

              <div className="space-y-0.5">
                <DetailRow
                  label="Whiteboard"
                  value={
                    session.whiteboardCaptured ? (
                      <span className="inline-flex items-center gap-1.5">
                        <FiEdit2 size={12} className="text-neutral-400" aria-hidden="true" />
                        Captured to the meeting record
                      </span>
                    ) : (
                      "Not used, or not captured"
                    )
                  }
                />
                <DetailRow
                  label="Recording"
                  value={
                    session.recorded ? (
                      <span className="inline-flex items-center gap-1.5">
                        <FiVideo size={12} className="text-neutral-400" aria-hidden="true" />
                        Recorded
                      </span>
                    ) : (
                      "Not recorded"
                    )
                  }
                />
                <DetailRow
                  label="Clear-down"
                  value={
                    session.clearDownAt
                      ? `${session.clearDown} · ${stamp(session.clearDownAt)}`
                      : "Runs when the session ends"
                  }
                />
              </div>
            </div>

            {session.clearDownNote && (
              <p
                className="mx-5 mb-4 rounded-lg border p-3 text-sm"
                style={{ borderColor: "var(--viz-critical)" }}
              >
                <span className="text-neutral-700 dark:text-neutral-300">
                  {session.clearDownNote}
                </span>
              </p>
            )}

            {session.clearDown !== "Confirmed" && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {session.clearDown === "Failed"
                    ? "Re-run the clear-down and confirm the endpoint is empty."
                    : "The clear-down runs automatically at session end; it can be run now."}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => dispatch(recordClearDown(session, "Confirmed"))}
                    className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700"
                  >
                    <FiCheckCircle size={15} aria-hidden="true" />
                    Re-run and confirm
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        recordClearDown(
                          session,
                          "Failed",
                          "Clear-down re-run and still incomplete. Endpoint held out of service pending re-imaging.",
                        ),
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-4 py-2 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                  >
                    <FiRefreshCw size={15} aria-hidden="true" />
                    Record a failure
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
