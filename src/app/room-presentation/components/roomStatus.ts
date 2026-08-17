import type {
  AllowlistEntry,
  EndpointEvent,
  RoomAsset,
  RoomSession,
} from "@/models/response/base-response";

export type Tone = "green" | "amber" | "red" | "neutral" | "blue";

export const ASSET_TONE: Record<RoomAsset["status"], Tone> = {
  Online: "green",
  Offline: "red",
  "In maintenance": "amber",
};

export const CLEAR_DOWN_TONE: Record<RoomSession["clearDown"], Tone> = {
  Confirmed: "green",
  Failed: "red",
  Pending: "amber",
};

export const EVENT_TONE: Record<EndpointEvent["severity"], Tone> = {
  info: "neutral",
  warning: "amber",
  critical: "red",
};

export const EVENT_COLOR: Record<EndpointEvent["severity"], string> = {
  info: "var(--viz-axis)",
  warning: "var(--viz-warning)",
  critical: "var(--viz-critical)",
};

export const ALLOWLIST_TONE: Record<AllowlistEntry["state"], Tone> = {
  Approved: "green",
  Blocked: "neutral",
};

/**
 * A control is either met or not — there is no partial credit on a baseline —
 * so compliance wears the reserved status steps rather than a series colour,
 * and always beside its word.
 */
export const COMPLIANT_COLOR = "var(--viz-good)";
export const FAILING_COLOR = "var(--viz-critical)";

/** Policy values that mean "closed"; anything else is a relaxation to explain. */
const CLOSED = new Set([
  "Disabled",
  "Blocked",
  "Muted",
  "Input devices only",
  "Managed network only",
  "Read-only, approved transfers",
  "Moderated",
  "At session end",
]);

export function isClosed(value: string): boolean {
  return CLOSED.has(value);
}

/** The tightest settings read as green; a relaxation reads as amber. */
export function policyTone(value: string): Tone {
  if (value === "Disabled" || value === "Blocked" || value === "Muted") return "green";
  return isClosed(value) ? "amber" : "red";
}
