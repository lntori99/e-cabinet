"use client";

import Link from "next/link";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiCircle,
  FiLock,
  FiVideo,
} from "react-icons/fi";
import { LuCalendarPlus } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch } from "@/core/hook";
import { selected } from "@/core/slices/meetings-slice";
import { agendaItemTypeRule } from "@/data/meetingTypes";
import type { Meeting } from "@/models/response/base-response";
import {
  STATUS_TONE,
  deadlineRow,
  distance,
} from "../../components/meetingStatus";
import { DetailRow } from "@/common/table";

type Readiness = "done" | "attention" | "pending";

const READY_UI: Record<Readiness, { icon: typeof FiCircle; color: string }> = {
  done: { icon: FiCheckCircle, color: "var(--viz-good)" },
  attention: { icon: FiAlertTriangle, color: "var(--viz-warning)" },
  pending: { icon: FiCircle, color: "var(--viz-axis)" },
};

function Check({
  state,
  label,
  detail,
}: {
  state: Readiness;
  label: string;
  detail: string;
}) {
  const { icon: Icon, color } = READY_UI[state];
  return (
    <li className="flex items-start gap-2.5">
      <Icon size={15} className="mt-0.5 shrink-0" style={{ color }} aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {label}
        </span>
        <span className="block text-xs text-neutral-500 dark:text-neutral-400">
          {detail}
        </span>
      </span>
    </li>
  );
}

function duration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export default function NextSitting({
  meeting,
  now,
}: {
  meeting: Meeting | null;
  now: string;
}) {
  const dispatch = useAppDispatch();

  if (!meeting) {
    return (
      <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuCalendarPlus}
          title="Nothing is scheduled"
          description="Every sitting on the register has concluded or been called off. Create the next one from the register."
          actions={[]}
        />
      </section>
    );
  }

  const runway = deadlineRow(meeting, now, (item) =>
    agendaItemTypeRule(item.type).requiresPaper,
  );
  const expecting = meeting.agenda.filter(
    (i) => agendaItemTypeRule(i.type).requiresPaper,
  ).length;
  const received = expecting - runway.missingPapers;
  const sections = new Set(meeting.agenda.map((i) => i.section)).size;
  const closed = meeting.agenda.filter((i) => i.closedSession).length;

  return (
    <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Next sitting · {meeting.id}
          </p>
          <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
            {meeting.title}
          </h2>
        </div>
        <StatusBadge tone={STATUS_TONE[meeting.status]}>{meeting.status}</StatusBadge>
      </header>

      <div className="grid gap-6 p-5 lg:grid-cols-2">
        <div className="space-y-0.5">
          <DetailRow label="Type" value={meeting.type} />
          <DetailRow label="Sits" value={`${meeting.date} · ${meeting.time}`} />
          <DetailRow
            label="Expected duration"
            value={duration(meeting.durationMinutes)}
          />
          <DetailRow label="Venue" value={meeting.venue} />
          <DetailRow label="Chair" value={meeting.chair} />
          <DetailRow
            label="Attendance"
            value={
              meeting.hybrid ? (
                <span className="inline-flex items-center gap-1.5">
                  <FiVideo size={12} className="text-neutral-400" aria-hidden="true" />
                  Hybrid — room and video
                </span>
              ) : (
                "In the room only"
              )
            }
          />
        </div>

        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Readiness
          </h3>
          <ul className="mt-3 space-y-3">
            <Check
              state={meeting.agenda.length > 0 ? "done" : "pending"}
              label="Agenda sequenced"
              detail={
                meeting.agenda.length === 0
                  ? "No items yet"
                  : `${meeting.agenda.length} items across ${sections} section${sections === 1 ? "" : "s"}`
              }
            />
            <Check
              state={
                expecting === 0
                  ? "pending"
                  : received === expecting
                    ? "done"
                    : "attention"
              }
              label="Papers attached"
              detail={
                expecting === 0
                  ? "No item on this agenda expects a paper"
                  : `${received} of ${expecting} items that expect a paper have one`
              }
            />
            <Check
              state={meeting.participants.length > 0 ? "done" : "pending"}
              label="Participants named"
              detail={`${meeting.participants.length} on the list${
                closed > 0
                  ? ` · ${closed} item${closed === 1 ? "" : "s"} restricted to a closed session`
                  : ""
              }`}
            />
            <Check
              state={
                runway.breached
                  ? "attention"
                  : runway.state === "Closed"
                    ? "done"
                    : runway.state === "Closing"
                      ? "attention"
                      : "pending"
              }
              label="Submission window"
              detail={`${runway.state} · ${distance(runway.hoursLeft)}${
                runway.breached ? ` · ${runway.missingPapers} never arrived` : ""
              }`}
            />
            <Check
              state={meeting.packFrozenAt ? "done" : "pending"}
              label="Pack frozen"
              detail={
                meeting.packFrozenAt
                  ? `${meeting.packFrozenAt.replace("T", " ")} by ${meeting.packFrozenBy}`
                  : "Not yet frozen for release"
              }
            />
          </ul>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/meetings-agenda/all-meetings"
              onClick={() => dispatch(selected(meeting.id))}
              className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700"
            >
              Open the sitting
            </Link>
            <Link
              href="/meetings-agenda/deadlines"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              <FiLock size={14} aria-hidden="true" />
              Deadlines
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
