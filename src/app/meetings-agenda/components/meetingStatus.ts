import type { Meeting, MeetingStatus } from "@/models/response/base-response";

export type Tone = "green" | "amber" | "red" | "neutral" | "blue";

/** Shared by every page in FR MTG so one status never reads two ways. */
export const STATUS_TONE: Record<MeetingStatus, Tone> = {
  Draft: "neutral",
  "Submissions Open": "blue",
  "Pack Assembly": "amber",
  "Pack Frozen": "green",
  "In Session": "red",
  Concluded: "neutral",
  Postponed: "amber",
  Cancelled: "red",
};

/** Still on the books — not concluded, cancelled or postponed away. */
export function isActive(meeting: Meeting): boolean {
  return (
    meeting.status !== "Concluded" &&
    meeting.status !== "Cancelled" &&
    meeting.status !== "Postponed"
  );
}

export type DeadlineState = "Closed" | "Closing" | "Open";

export interface DeadlineRow {
  meeting: Meeting;
  state: DeadlineState;
  /** Negative once the deadline has passed. */
  hoursLeft: number;
  /** Agenda items whose type expects a paper but which have none attached. */
  missingPapers: number;
  /** True where the window shut on items that never arrived (FR-MTG-05). */
  breached: boolean;
}

const MS_PER_HOUR = 3_600_000;

/**
 * FR-MTG-05 — the submission window, as the Secretariat reads it: how long is
 * left, and whether anything was still outstanding when it shut.
 *
 * `now` comes from the server so the runway does not depend on the viewer's
 * clock, matching how the calendar resolves its month.
 */
export function deadlineRow(
  meeting: Meeting,
  now: string,
  requiresPaper: (item: Meeting["agenda"][number]) => boolean,
): DeadlineRow {
  const hoursLeft =
    (new Date(meeting.submissionDeadline).getTime() - new Date(now).getTime()) /
    MS_PER_HOUR;
  const missingPapers = meeting.agenda.filter(
    (item) => requiresPaper(item) && item.attachments.length === 0,
  ).length;
  const state: DeadlineState =
    hoursLeft <= 0 ? "Closed" : hoursLeft <= 72 ? "Closing" : "Open";

  return {
    meeting,
    state,
    hoursLeft,
    missingPapers,
    breached: state === "Closed" && missingPapers > 0,
  };
}

/** "in 3 days" / "4 hours ago" — a deadline reads better as distance than a date. */
export function distance(hours: number): string {
  const abs = Math.abs(hours);
  const value =
    abs < 1
      ? "under an hour"
      : abs < 48
        ? `${Math.round(abs)} hour${Math.round(abs) === 1 ? "" : "s"}`
        : `${Math.round(abs / 24)} days`;
  return hours >= 0 ? `in ${value}` : `${value} ago`;
}
