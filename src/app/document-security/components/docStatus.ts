import { CLASSIFICATIONS, type Classification } from "@/core/app-constants";
import type {
  HandlingRight,
  ReclassificationRequest,
  SecureEndpoint,
} from "@/models/response/base-response";

export type Tone = "green" | "amber" | "red" | "neutral" | "blue";

/**
 * Classification is an order, not a set of names: TOP SECRET is stronger than
 * SECRET, and the whole handling matrix turns on that. It therefore takes a
 * one-hue ordinal ramp wherever it is plotted, strongest step for the strongest
 * label — never five separate identity colours.
 */
export const CLASSIFICATION_STEP: Record<Classification, string> = {
  "TOP SECRET — CABINET": "var(--viz-ramp-5)",
  SECRET: "var(--viz-ramp-4)",
  CONFIDENTIAL: "var(--viz-ramp-3)",
  RESTRICTED: "var(--viz-ramp-2)",
  OFFICIAL: "var(--viz-ramp-1)",
};

/** Strongest first, which is the order `CLASSIFICATIONS` already holds. */
export const CLASSIFICATION_ORDER = CLASSIFICATIONS;

export function classificationRank(value: Classification): number {
  return CLASSIFICATIONS.indexOf(value);
}

/** A right that is blocked is the safe state, so it reads as neutral, not bad. */
export const RIGHT_TONE: Record<HandlingRight, Tone> = {
  Blocked: "green",
  "Authorised roles": "amber",
  Permitted: "neutral",
};

export const RECLASSIFICATION_TONE: Record<
  ReclassificationRequest["status"],
  Tone
> = {
  Pending: "amber",
  Applied: "green",
  Declined: "neutral",
};

export const VERIFICATION_TONE: Record<SecureEndpoint["verification"], Tone> = {
  Clean: "green",
  "Remnant found": "red",
  "Not verified": "amber",
};

export const VERIFICATION_COLOR: Record<SecureEndpoint["verification"], string> = {
  Clean: "var(--viz-good)",
  "Remnant found": "var(--viz-critical)",
  "Not verified": "var(--viz-warning)",
};

/**
 * FR-DOC-19 — the configuration a shared endpoint must hold. Anything else is a
 * policy exception, listed as such rather than quietly tolerated.
 */
export function endpointExceptions(endpoint: SecureEndpoint): string[] {
  const found: string[] = [];
  if (endpoint.persistentStorage) found.push("Persistent local storage is enabled");
  if (!endpoint.cacheEncrypted) found.push("Session cache is not encrypted");
  if (endpoint.cacheScope !== "Current session only") {
    found.push("Cache is not limited to the current session");
  }
  if (endpoint.offlineEnabled) found.push("Offline access is enabled on a shared device");
  return found;
}

/** "in 3 days" reads better than a date when the point is whether to act. */
export function daysBetween(from: string, to: string): number {
  return (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000;
}
