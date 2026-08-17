import type {
  ActionRecord,
  ActionState,
  DecisionOutcomeCode,
  DecisionRecord,
  MinutesDocument,
} from "@/models/response/base-response";
import { REMINDER_THRESHOLD_DAYS } from "@/data/decisions";

export type Tone = "green" | "amber" | "red" | "neutral" | "blue";

export const DECISION_TONE: Record<DecisionRecord["state"], Tone> = {
  Draft: "neutral",
  "In review": "amber",
  Finalised: "green",
};

/**
 * The outcome is what the decision *is*, not how worried anyone should be — so
 * only the two that stop a proposal wear a warning colour, and the rest stay
 * neutral rather than turning the register into a traffic light.
 */
export const OUTCOME_TONE: Record<DecisionOutcomeCode, Tone> = {
  Approved: "green",
  "Approved with amendment": "green",
  Deferred: "amber",
  Referred: "blue",
  Noted: "neutral",
  Rejected: "red",
  Withdrawn: "neutral",
};

export const ACTION_TONE: Record<ActionState, Tone> = {
  "Not started": "neutral",
  "In progress": "blue",
  "Submitted for closure": "amber",
  Closed: "green",
  Cancelled: "neutral",
};

export const MINUTES_TONE: Record<MinutesDocument["state"], Tone> = {
  Draft: "neutral",
  "In review": "amber",
  Approved: "blue",
  Circulated: "green",
};

/** Where an action stands against its deadline, which is a different question
 *  from what state it is in: a closed action is never late, and an open one
 *  that passed its date is late whatever its narrative says. */
export type DeadlineStanding = "Closed" | "Overdue" | "Due soon" | "On time";

export function standing(item: ActionRecord, today: string): DeadlineStanding {
  if (item.state === "Closed" || item.state === "Cancelled") return "Closed";
  if (item.deadline < today) return "Overdue";
  return daysBetween(today, item.deadline) <= REMINDER_THRESHOLD_DAYS
    ? "Due soon"
    : "On time";
}

export const STANDING_TONE: Record<DeadlineStanding, Tone> = {
  Closed: "green",
  Overdue: "red",
  "Due soon": "amber",
  "On time": "neutral",
};

/** Reserved status steps — always beside a word, never on their own. */
export const STANDING_COLOR: Record<DeadlineStanding, string> = {
  Closed: "var(--viz-good)",
  Overdue: "var(--viz-critical)",
  "Due soon": "var(--viz-warning)",
  "On time": "var(--viz-axis)",
};

/** Whole days from one ISO date to another. Both are dates, not instants. */
export function daysBetween(from: string, to: string): number {
  const ms = new Date(`${to}T00:00`).getTime() - new Date(`${from}T00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

/** "in 6 days" / "9 days late" — a deadline reads better as distance. */
export function deadlineWords(deadline: string, today: string): string {
  const days = daysBetween(today, deadline);
  if (days === 0) return "due today";
  return days > 0
    ? `in ${days} day${days === 1 ? "" : "s"}`
    : `${-days} day${days === -1 ? "" : "s"} late`;
}

export function isOverdue(item: ActionRecord, today: string): boolean {
  return standing(item, today) === "Overdue";
}
