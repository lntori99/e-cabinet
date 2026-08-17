import type {
  ClearanceStage,
  StageStatus,
  Submission,
  SubmissionStatus,
} from "@/models/response/base-response";

export type Tone = "green" | "amber" | "red" | "neutral" | "blue";

/**
 * The papers side is written from a ministry submitter's seat. Until roles come
 * from the session that seat is a fixed seed account — the same one the
 * identity directory lists — and FR-SUB-05 is enforced against its ministry.
 */
export const SUBMITTER = {
  name: "P. Mwale",
  ministry: "Finance & Economic Affairs",
  role: "Ministry Submitter",
} as const;

export const SUBMISSION_TONE: Record<SubmissionStatus, Tone> = {
  Draft: "neutral",
  Quarantined: "red",
  "Awaiting late authorisation": "amber",
  "In clearance": "blue",
  "Returned for amendment": "amber",
  Cleared: "green",
  Rejected: "red",
};

export const STAGE_TONE: Record<StageStatus, Tone> = {
  "Not started": "neutral",
  "In progress": "blue",
  Approved: "green",
  Rejected: "red",
  Returned: "amber",
  "Skipped by exception": "amber",
  "Not applicable": "neutral",
};

/** Status colours for a stage's mark, matching the reserved status steps. */
export const STAGE_COLOR: Record<StageStatus, string> = {
  "Not started": "var(--viz-axis)",
  "In progress": "var(--viz-1)",
  Approved: "var(--viz-good)",
  Rejected: "var(--viz-critical)",
  Returned: "var(--viz-warning)",
  "Skipped by exception": "var(--viz-serious)",
  "Not applicable": "var(--viz-axis)",
};

const SETTLED: StageStatus[] = ["Approved", "Skipped by exception", "Not applicable"];

export function isSettled(stage: ClearanceStage): boolean {
  return SETTLED.includes(stage.status);
}

/** The stage a paper is actually sitting at, if any. */
export function currentStage(submission: Submission): ClearanceStage | undefined {
  return (
    submission.stages.find((s) => s.status === "In progress") ??
    submission.stages.find((s) => s.status === "Returned") ??
    submission.stages.find((s) => s.status === "Rejected")
  );
}

/** FR-SUB-15 — mandatory stages still outstanding, with no exception recorded. */
export function blockingStages(submission: Submission): ClearanceStage[] {
  if (submission.exception) {
    return submission.stages.filter(
      (s) =>
        s.mandatory &&
        !isSettled(s) &&
        !submission.exception!.stagesSkipped.includes(s.stage),
    );
  }
  return submission.stages.filter((s) => s.mandatory && !isSettled(s));
}

export function clearedStageCount(submission: Submission): {
  done: number;
  total: number;
} {
  const applicable = submission.stages.filter((s) => s.status !== "Not applicable");
  return {
    done: applicable.filter(isSettled).length,
    total: applicable.length,
  };
}

export function money(amount: number): string {
  return amount === 0 ? "None" : `MWK ${amount.toLocaleString("en-MW")}`;
}
