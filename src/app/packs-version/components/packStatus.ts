import { CLASSIFICATIONS, type Classification } from "@/core/app-constants";
import type {
  CabinetUser,
  Meeting,
  Pack,
  PackAcknowledgement,
} from "@/models/response/base-response";

export type Tone = "green" | "amber" | "red" | "neutral" | "blue";

export const PACK_TONE: Record<Pack["state"], Tone> = {
  "In assembly": "blue",
  Frozen: "amber",
  Released: "green",
  Recalled: "red",
  Superseded: "neutral",
};

export const KIND_TONE: Record<Pack["kind"], Tone> = {
  Primary: "neutral",
  Supplementary: "blue",
  Addendum: "blue",
};

/**
 * FR-PCK-03 — a pack carries the highest classification of anything inside it.
 * Derived rather than stored, so it cannot drift from the papers it contains.
 * `CLASSIFICATIONS` is already ordered strongest first.
 */
export function inheritedClassification(pack: Pack): Classification {
  const found = pack.items.flatMap((item) => item.papers.map((p) => p.classification));
  if (found.length === 0) return pack.classification;
  return CLASSIFICATIONS.find((level) => found.includes(level)) ?? pack.classification;
}

export interface ReadinessCheck {
  id: string;
  label: string;
  detail: string;
  severity: "blocker" | "warning";
  passed: boolean;
}

/**
 * FR-PCK-16 — the pre-release check, computed from the pack, its sitting and
 * the account state of the people it is going to. Nothing here is stored: the
 * answer has to be true at the moment someone asks for it.
 */
export function readinessChecks(
  pack: Pack,
  meeting: Meeting | undefined,
  users: CabinetUser[],
): ReadinessCheck[] {
  const itemsWithoutPapers = pack.items.filter((i) => i.papers.length === 0);
  const incompleteClearance = pack.items.filter((i) => !i.clearanceComplete);
  const unresolved = pack.items.reduce((sum, i) => sum + i.unresolvedComments, 0);

  // A participant "without confirmed access" is one whose account is not open —
  // the identity record is the authority, not a flag kept on the pack.
  const participants = meeting?.participants ?? [];
  const blocked = participants.filter((participant) => {
    const account = users.find((u) => u.name === participant.name);
    return account ? account.status !== "Active" : false;
  });

  return [
    {
      id: "papers",
      label: "Every agenda item carries its papers",
      detail:
        pack.items.length === 0
          ? "The pack is empty — nothing has been assembled into it"
          : itemsWithoutPapers.length === 0
            ? `${pack.items.length} items, all with at least one paper`
            : `${itemsWithoutPapers.length} item${itemsWithoutPapers.length === 1 ? "" : "s"} with nothing attached: ${itemsWithoutPapers.map((i) => i.title).join("; ")}`,
      severity: "blocker",
      passed: pack.items.length > 0 && itemsWithoutPapers.length === 0,
    },
    {
      id: "clearance",
      label: "Clearance complete on every paper",
      detail:
        pack.items.length === 0
          ? "There is nothing in the pack to clear"
          : incompleteClearance.length === 0
            ? "No item is waiting on a clearance stage"
            : `${incompleteClearance.length} item${incompleteClearance.length === 1 ? "" : "s"} still in clearance`,
      severity: "blocker",
      passed: pack.items.length > 0 && incompleteClearance.length === 0,
    },
    {
      id: "comments",
      label: "No unresolved clearance comments",
      detail:
        unresolved === 0
          ? "Every comment raised has been answered"
          : `${unresolved} comment${unresolved === 1 ? "" : "s"} still open against the papers in this pack`,
      severity: "warning",
      passed: unresolved === 0,
    },
    {
      id: "access",
      label: "Every participant has confirmed access",
      detail:
        participants.length === 0
          ? "No participant has been named on the sitting"
          : blocked.length === 0
            ? `${participants.length} participants, all with open accounts`
            : `${blocked.length} participant${blocked.length === 1 ? "" : "s"} cannot open the pack: ${blocked.map((p) => p.name).join("; ")}`,
      severity: "blocker",
      passed: participants.length > 0 && blocked.length === 0,
    },
  ];
}

export function readinessSummary(checks: ReadinessCheck[]) {
  const failed = checks.filter((c) => !c.passed);
  return {
    failed,
    blockers: failed.filter((c) => c.severity === "blocker"),
    passed: failed.length === 0,
  };
}

/** FR-PCK-08 — participants still holding something other than the current version. */
export function staleHolders(pack: Pack): PackAcknowledgement[] {
  return pack.acknowledgements.filter((a) => a.versionId !== pack.currentVersionId);
}

export function acknowledgementTally(pack: Pack) {
  const read = pack.acknowledgements.filter((a) => a.readAt).length;
  const received = pack.acknowledgements.filter((a) => a.receivedAt && !a.readAt).length;
  const none = pack.acknowledgements.filter((a) => !a.receivedAt).length;
  return { read, received, none, total: pack.acknowledgements.length };
}

export const STAGING_TONE: Record<string, Tone> = {
  Staged: "green",
  Staging: "blue",
  "Not started": "neutral",
  Failed: "red",
};
