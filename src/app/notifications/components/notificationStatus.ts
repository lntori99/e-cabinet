import type {
  DeliveryState,
  NotificationChannel,
  NotificationTrigger,
} from "@/models/response/base-response";
import { CONTENT_RULES } from "@/data/notifications";

export type Tone = "green" | "amber" | "red" | "neutral" | "blue";

/**
 * Delivery is a state, not an identity, so it wears the reserved status steps
 * and never appears without its word beside it.
 */
export const DELIVERY_TONE: Record<DeliveryState, Tone> = {
  Delivered: "green",
  Pending: "amber",
  Failed: "red",
};

export const DELIVERY_COLOR: Record<DeliveryState, string> = {
  Delivered: "var(--viz-good)",
  Pending: "var(--viz-warning)",
  Failed: "var(--viz-critical)",
};

/** Three ways a message travels — three identities, in a fixed order. */
export const CHANNEL_COLOR: Record<NotificationChannel, string> = {
  "In-platform": "var(--viz-1)",
  Email: "var(--viz-2)",
  SMS: "var(--viz-3)",
};

/** Which requirement a trigger comes from, for the register's eyebrow line. */
export const TRIGGER_REQUIREMENT: Record<NotificationTrigger, string> = {
  "Meeting created": "FR-NOT-01",
  "Meeting amended": "FR-NOT-01",
  "Meeting postponed": "FR-NOT-01",
  "Meeting cancelled": "FR-NOT-01",
  "Pack released": "FR-NOT-02",
  "Pack superseded": "FR-NOT-02",
  "Submission deadline approaching": "FR-NOT-03",
  "Submission deadline missed": "FR-NOT-03",
  "Clearance awaiting action": "FR-NOT-04",
  "Clearance service time breached": "FR-NOT-04",
  "Action assigned": "FR-NOT-05",
  "Action deadline approaching": "FR-NOT-05",
  "Action escalated": "FR-NOT-05",
};

/** The five triggers that are a warning by their nature rather than routine. */
const ADVERSE: NotificationTrigger[] = [
  "Meeting postponed",
  "Meeting cancelled",
  "Submission deadline missed",
  "Clearance service time breached",
  "Action escalated",
];

export function triggerTone(trigger: NotificationTrigger): Tone {
  return ADVERSE.includes(trigger) ? "amber" : "neutral";
}

/**
 * The three events that fire *ahead* of something. The rest fire when the thing
 * happens, so a lead time would be meaningless on them — an action assignment
 * cannot be sent three days before it is assigned.
 */
const REMINDER_TRIGGERS: NotificationTrigger[] = [
  "Submission deadline approaching",
  "Clearance awaiting action",
  "Action deadline approaching",
];

export function isReminderRule(trigger: NotificationTrigger): boolean {
  return REMINDER_TRIGGERS.includes(trigger);
}

/** "72h before" / "on the deadline" / "no reminder". */
export function leadWords(hours: number | null): string {
  if (hours === null) return "No reminder";
  if (hours === 0) return "On the deadline";
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `${days} day${days === 1 ? "" : "s"} before`;
  }
  return `${hours} hours before`;
}

export function serviceWords(hours: number): string {
  if (hours === 0) return "On the deadline";
  return hours % 24 === 0 ? `${hours / 24} days` : `${hours} hours`;
}

/**
 * FR-NOT-06 and FR-NOT-07, checked rather than asserted.
 *
 * Each rule gets its own detector rather than one blanket word list. A blanket
 * list flags "it is not attached to this message", which is the template saying
 * the right thing, and a check that fails a correct template teaches people to
 * ignore it.
 */
const DETECTORS: ((text: string) => boolean)[] = [
  // Cabinet document content: a document reference, or quoted material.
  (t) => /\b(doc|pck|dec)-\d/.test(t) || t.includes("“") || t.includes("\""),
  // A classification marking, in the subject line or the body.
  (t) => /\b(top secret|secret|confidential|restricted)\b/.test(t),
  // Decision or agenda wording pasted in.
  (t) =>
    t.includes("cabinet approved") ||
    t.includes("cabinet directed") ||
    t.includes("agenda item"),
  // A promise of an attachment. The negated forms are what a correct template
  // says, so they are excluded before the positive forms are looked for.
  (t) => {
    const cleaned = t
      .replace(/not attached[^.]*/g, "")
      .replace(/no attachment[^.]*/g, "")
      .replace(/cannot be attached[^.]*/g, "");
    return /\b(see attached|find attached|attached is|attached are|enclosed)\b/.test(
      cleaned,
    );
  },
];

export interface TemplateCheck {
  rule: string;
  passes: boolean;
}

export function checkTemplate(subject: string, body: string): TemplateCheck[] {
  const text = `${subject} ${body}`.toLowerCase();
  const results = DETECTORS.map((detect) => !detect(text));

  return CONTENT_RULES.map((rule, index) => ({
    rule,
    // The fifth rule is the summary of the other four and fails if any does.
    passes: index < results.length ? results[index] : results.every(Boolean),
  }));
}
