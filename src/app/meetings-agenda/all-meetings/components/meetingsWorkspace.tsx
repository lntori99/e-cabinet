"use client";

import { useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { LuCalendarPlus } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { controlCls } from "@/common/field";
import { Tabs } from "@/common/tabs";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectSelectedMeeting } from "@/core/slices/meetings-slice";
import { STATUS_TONE } from "../../components/meetingStatus";
import CreateMeetingModal from "./createMeetingModal";
import AgendaPanel from "./agendaPanel";
import DetailsPanel from "./detailsPanel";
import HistoryPanel from "./historyPanel";
import MeetingRegister from "./meetingRegister";
import ParticipantsPanel from "./participantsPanel";

/**
 * FR-MTG-01 — register on the left, the selected sitting on the right.
 * Everything the rest of the FR-MTG set asks for hangs off one of the four tabs.
 */
export default function MeetingsWorkspace({ now }: { now: string }) {
  const meeting = useAppSelector(selectSelectedMeeting);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <FiSearch
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
            size={15}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search the register"
            placeholder="Search by title, reference, venue or chair"
            className={`${controlCls} pl-9`}
          />
        </div>

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700"
        >
          <FiPlus size={15} /> New meeting
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <MeetingRegister query={query} now={now} />

        <div className="min-w-0">
          {!meeting ? (
            <EmptyState
              icon={LuCalendarPlus}
              title="No sitting selected"
              description="Choose a meeting from the register, or create a new Cabinet, committee or other high-level meeting."
              actions={[
                {
                  label: "New meeting",
                  onClick: () => setCreating(true),
                  className: "rounded-lg bg-state-600 text-white hover:bg-state-700",
                },
              ]}
            />
          ) : (
            <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {meeting.id} · {meeting.type}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {meeting.title}
                  </h2>
                </div>
                <StatusBadge tone={STATUS_TONE[meeting.status]}>
                  {meeting.status}
                </StatusBadge>
              </div>

              <Tabs
                key={meeting.id}
                defaultId="details"
                tabs={[
                  { id: "details", label: "Details", content: <DetailsPanel meeting={meeting} /> },
                  {
                    id: "agenda",
                    label: `Agenda (${meeting.agenda.length})`,
                    content: <AgendaPanel meeting={meeting} />,
                  },
                  {
                    id: "participants",
                    label: `Participants (${meeting.participants.length})`,
                    content: <ParticipantsPanel meeting={meeting} />,
                  },
                  {
                    id: "history",
                    label: `History (${meeting.history.length})`,
                    content: <HistoryPanel meeting={meeting} />,
                  },
                ]}
              />
            </div>
          )}
        </div>
      </div>

      <CreateMeetingModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
