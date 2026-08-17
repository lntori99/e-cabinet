"use client";

import { FiClock, FiSlash, FiUsers } from "react-icons/fi";
import { LuColumns2 } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { DetailRow } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectVideoSessions } from "@/core/slices/video-slice";
import { SESSION_TONE } from "../../components/videoStatus";

export default function BreakoutBoard() {
  const sessions = useAppSelector(selectVideoSessions);
  const withBreakouts = sessions.filter((s) => s.breakoutRooms.length > 0);
  const cabinetSessions = sessions.filter((s) =>
    s.meetingTitle.toLowerCase().includes("cabinet sitting"),
  );

  return (
    <div className="space-y-8">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-warning)" }}
      >
        <FiClock
          size={18}
          className="mt-0.5 shrink-0"
          style={{ color: "var(--viz-warning)" }}
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            Release 2, and a could-have
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Breakouts are the lowest priority in this set. Where they land, they
            are for committee working sessions — the meetings that genuinely
            need a sub-group to go away and come back with a number.
          </p>
        </div>
      </section>

      {withBreakouts.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={LuColumns2}
            title="No breakout is configured"
            description="No session currently has a side conversation set up."
          />
        </div>
      ) : (
        <section className="space-y-4">
          <h2 className="font-bold">Configured breakouts</h2>

          {withBreakouts.map((session) => (
            <article
              key={session.id}
              className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {session.id} · {session.meetingId}
                  </p>
                  <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                    {session.meetingTitle}
                  </h3>
                </div>
                <StatusBadge tone={SESSION_TONE[session.state]}>
                  {session.state}
                </StatusBadge>
              </header>

              <ul className="divide-y divide-neutral-100 px-5 dark:divide-neutral-800">
                {session.breakoutRooms.map((room) => (
                  <li key={room.id} className="py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          <FiUsers size={13} className="text-neutral-400" aria-hidden="true" />
                          {room.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                          {room.participants.join(", ")}
                        </span>
                      </span>
                      <StatusBadge tone="blue">
                        {room.participants.length} participants
                      </StatusBadge>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="px-5 py-4">
                <div className="space-y-0.5">
                  <DetailRow
                    label="Attendance"
                    value="Time in a breakout counts against the main session's attendance record"
                  />
                  <DetailRow
                    label="Recording"
                    value={
                      session.recordingEnabled
                        ? "The main session is recording; breakouts are not"
                        : "Nothing is recorded"
                    }
                  />
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-bold">Where breakouts are not offered</h2>
        <ul className="space-y-2">
          {cabinetSessions.map((session) => (
            <li
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {session.meetingTitle}
                </span>
                <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                  {session.meetingId} · full Cabinet
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                <FiSlash size={14} aria-hidden="true" />
                Not available
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          A sitting of Cabinet is one conversation, minuted as one record. A side
          channel inside it would be a discussion the minutes cannot see, which is
          why the capability is scoped to committee working sessions.
        </p>
      </section>
    </div>
  );
}
