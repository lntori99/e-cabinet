import type {
  AccessLevel,
  AccessSession,
  BreakGlassGrant,
  CabinetUser,
  Delegation,
  EntitlementReport,
  TrustedDevice,
} from "@/models/response/base-response";

export type Tone = "green" | "amber" | "red" | "neutral" | "blue";

/**
 * One reading of each state across FR IAM. Access states are judgements about
 * risk, so they are kept in one place rather than re-decided per page.
 */
export const USER_STATUS_TONE: Record<CabinetUser["status"], Tone> = {
  Active: "green",
  Suspended: "amber",
  Deactivated: "neutral",
};

export const SESSION_TONE: Record<AccessSession["status"], Tone> = {
  Active: "green",
  Idle: "amber",
  Revoked: "neutral",
};

export const GRANT_TONE: Record<BreakGlassGrant["status"], Tone> = {
  "Pending approval": "amber",
  Active: "red",
  Expired: "neutral",
  Revoked: "neutral",
  Declined: "neutral",
};

export const DELEGATION_TONE: Record<Delegation["status"], Tone> = {
  "Pending approval": "amber",
  Active: "blue",
  Expired: "neutral",
  Revoked: "neutral",
};

export const DEVICE_TONE: Record<TrustedDevice["attestation"], Tone> = {
  Attested: "green",
  "Attestation stale": "amber",
  Failed: "red",
};

export const REVIEW_TONE: Record<EntitlementReport["reviewStatus"], Tone> = {
  Attested: "green",
  "In review": "blue",
  "Not started": "neutral",
  "Changes requested": "amber",
};

/** Higher levels carry more weight, so the matrix reads at a glance. */
export const LEVEL_RANK: Record<AccessLevel, number> = {
  None: 0,
  Read: 1,
  Contribute: 2,
  Manage: 3,
  Full: 4,
};

/**
 * The permission matrix is an ordinal scale — None through Full is an order,
 * not a set of identities — so the cell takes one hue in monotone steps rather
 * than five separate colours. The wash carries the level and the label stays in
 * ink, never in the scale's colour. "None" keeps the surface: absence recedes.
 */
export const LEVEL_CELL: Record<AccessLevel, string> = {
  None: "text-neutral-400 dark:text-neutral-600",
  Read: "bg-state-50 dark:bg-state-900/25",
  Contribute: "bg-state-100 dark:bg-state-900/45",
  Manage: "bg-state-200 dark:bg-state-900/65",
  Full: "bg-state-300 dark:bg-state-900/85",
};

export function userName(users: CabinetUser[], id: string): string {
  return users.find((u) => u.id === id)?.name ?? id;
}

export function userById(users: CabinetUser[], id: string): CabinetUser | undefined {
  return users.find((u) => u.id === id);
}
