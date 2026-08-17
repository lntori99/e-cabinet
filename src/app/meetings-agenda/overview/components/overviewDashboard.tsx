"use client";

import { useMemo } from "react";
import { Kpi } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  selectMeetings,
  selectUndecidedBacklog,
} from "@/core/slices/meetings-slice";
import { agendaItemTypeRule } from "@/data/meetingTypes";
import { deadlineRow, isActive } from "../../components/meetingStatus";
import ActivityFeed from "./activityFeed";
import AgendaLoadChart from "./agendaLoadChart";
import AttendanceMeter from "./attendanceMeter";
import NextSitting from "./nextSitting";
import RunwayChart from "./runwayChart";

/**
 * The Secretariat's opening screen: what is coming, what it still needs, and
 * what has changed since they last looked. Everything actionable links through
 * to the page that can act on it.
 */
export default function OverviewDashboard({ now }: { now: string }) {
  const meetings = useAppSelector(selectMeetings);
  const backlog = useAppSelector(selectUndecidedBacklog);

  const stats = useMemo(() => {
    const upcoming = meetings
      .filter(isActive)
      .sort((a, b) => a.date.localeCompare(b.date));

    const agendaItems = upcoming.reduce((sum, m) => sum + m.agenda.length, 0);
    const undecided = upcoming.reduce(
      (sum, m) => sum + m.agenda.filter((i) => !i.decided).length,
      0,
    );
    const papers = upcoming.reduce(
      (sum, m) => sum + m.agenda.reduce((n, i) => n + i.attachments.length, 0),
      0,
    );
    const missing = upcoming.reduce(
      (sum, m) =>
        sum +
        deadlineRow(m, now, (item) => agendaItemTypeRule(item.type).requiresPaper)
          .missingPapers,
      0,
    );
    const breaches = upcoming.filter(
      (m) =>
        deadlineRow(m, now, (item) => agendaItemTypeRule(item.type).requiresPaper)
          .breached,
    ).length;

    return {
      upcoming,
      next: upcoming[0] ?? null,
      agendaItems,
      undecided,
      papers,
      missing,
      breaches,
    };
  }, [meetings, now]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Upcoming sittings"
          value={stats.upcoming.length}
          hint={
            stats.next
              ? `Next on ${stats.next.date}`
              : "Nothing on the register"
          }
        />
        <Kpi
          label="Agenda items in play"
          value={stats.agendaItems}
          hint={`${stats.undecided} still undecided`}
        />
        <Kpi
          label="Papers linked"
          value={stats.papers}
          hint={
            stats.missing === 0
              ? "Every item that expects one has it"
              : `${stats.missing} item${stats.missing === 1 ? "" : "s"} still expecting one`
          }
          tone={stats.missing === 0 ? "green" : "amber"}
        />
        <Kpi
          label="Deadline breaches"
          value={stats.breaches}
          hint={
            backlog.length === 0
              ? "No item is awaiting a nominated meeting"
              : `${backlog.length} item${backlog.length === 1 ? "" : "s"} awaiting a meeting`
          }
          tone={stats.breaches === 0 ? "green" : "red"}
        />
      </div>

      <NextSitting meeting={stats.next} now={now} />

      <div className="grid gap-6 xl:grid-cols-2">
        <AgendaLoadChart sittings={stats.upcoming} />
        <RunwayChart sittings={stats.upcoming} now={now} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <AttendanceMeter meetings={meetings} />
        <ActivityFeed meetings={meetings} />
      </div>
    </div>
  );
}
