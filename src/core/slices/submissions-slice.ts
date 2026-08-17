import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { seedClearanceDelegations, seedSubmissions } from "@/data/submissionClearance";
import type {
  ClearanceDecision,
  ClearanceDelegation,
  ClearanceStage,
  ClearanceStageName,
  Submission,
} from "@/models/response/base-response";
import type { RootState } from "@/core/store";

interface SubmissionsState {
  items: Submission[];
  delegations: ClearanceDelegation[];
  /** Which stage the signed-in clearance actor is answering for. */
  actingStage: ClearanceStageName;
}

const initialState: SubmissionsState = {
  items: seedSubmissions,
  delegations: seedClearanceDelegations,
  actingStage: "Policy Review",
};

const DONE: ClearanceStage["status"][] = [
  "Approved",
  "Skipped by exception",
  "Not applicable",
];

const hoursLater = (at: string, hours: number) =>
  new Date(new Date(at).getTime() + hours * 3_600_000).toISOString().slice(0, 16);

/**
 * FR-SUB-07 / 08 — open every stage that is now reachable.
 *
 * A sequential stage waits for everything before it; a parallel stage waits
 * only for the sequential work before it, which is what lets legal and
 * financial clearance run at the same time. Stages that do not apply, or that
 * an exception has released, are not blockers.
 */
function openStages(submission: Submission, at: string) {
  const stages = submission.stages;

  stages.forEach((stage, index) => {
    if (stage.status !== "Not started") return;

    const earlier = stages.slice(0, index).filter((s) => s.status !== "Not applicable");
    const blockers =
      stage.mode === "Parallel"
        ? earlier.filter((s) => s.mode !== "Parallel")
        : earlier;

    if (blockers.every((s) => DONE.includes(s.status))) {
      stage.status = "In progress";
      stage.startedAt = at;
      stage.dueAt = hoursLater(at, stage.serviceHours);
    }
  });
}

/** The paper's status is derived from its stages, never set by hand. */
function deriveStatus(submission: Submission): Submission["status"] {
  if (submission.status === "Draft" || submission.status === "Quarantined") {
    return submission.status;
  }
  if (submission.late && !submission.lateAuthorisedBy) {
    return "Awaiting late authorisation";
  }
  if (submission.stages.some((s) => s.status === "Rejected")) return "Rejected";
  if (submission.stages.some((s) => s.status === "Returned")) {
    return "Returned for amendment";
  }
  return submission.stages.every((s) => DONE.includes(s.status))
    ? "Cleared"
    : "In clearance";
}

const find = (state: SubmissionsState, id: string) =>
  state.items.find((s) => s.id === id);

const submissionsSlice = createSlice({
  name: "submissions",
  initialState,
  reducers: {
    /** FR-SUB-01 / 02 / 03 — a draft becomes a submission once it conforms. */
    submitted(
      state,
      action: PayloadAction<{
        submission: Submission;
        at: string;
      }>,
    ) {
      const submission = action.payload.submission;
      state.items.unshift(submission);
      if (submission.status === "In clearance") {
        openStages(submission, action.payload.at);
        submission.status = deriveStatus(submission);
      }
    },

    /** FR-SUB-09 — a decision is never recorded without its comment. */
    decisionRecorded(
      state,
      action: PayloadAction<{
        submissionId: string;
        stage: ClearanceStageName;
        decision: ClearanceDecision;
        comment: string;
        by: string;
        role: string;
        at: string;
        commentId: string;
      }>,
    ) {
      const submission = find(state, action.payload.submissionId);
      const stage = submission?.stages.find((s) => s.stage === action.payload.stage);
      if (!submission || !stage) return;

      stage.status =
        action.payload.decision === "Approved"
          ? "Approved"
          : action.payload.decision === "Rejected"
            ? "Rejected"
            : "Returned";
      stage.decidedAt = action.payload.at;
      stage.actor = action.payload.by;

      submission.comments.push({
        id: action.payload.commentId,
        at: action.payload.at,
        by: action.payload.by,
        role: action.payload.role,
        stage: action.payload.stage,
        decision: action.payload.decision,
        body: action.payload.comment,
      });

      if (action.payload.decision === "Approved") {
        openStages(submission, action.payload.at);
      }
      submission.status = deriveStatus(submission);
    },

    /** FR-SUB-10 / 11 — a reply joins the thread, it does not replace it. */
    commentAdded(
      state,
      action: PayloadAction<{
        submissionId: string;
        commentId: string;
        stage: ClearanceStageName | "Submission";
        body: string;
        by: string;
        role: string;
        at: string;
        replyToId?: string;
      }>,
    ) {
      const submission = find(state, action.payload.submissionId);
      if (!submission) return;
      submission.comments.push({
        id: action.payload.commentId,
        at: action.payload.at,
        by: action.payload.by,
        role: action.payload.role,
        stage: action.payload.stage,
        body: action.payload.body,
        replyToId: action.payload.replyToId,
      });
    },

    /**
     * FR-SUB-11 — resubmission adds a version and reopens the returned stage.
     * The comment thread and every earlier version stay exactly where they are.
     */
    resubmitted(
      state,
      action: PayloadAction<{
        submissionId: string;
        note: string;
        by: string;
        at: string;
      }>,
    ) {
      const submission = find(state, action.payload.submissionId);
      if (!submission) return;

      submission.versions.push({
        version: submission.versions.length + 1,
        uploadedBy: action.payload.by,
        uploadedAt: action.payload.at,
        note: action.payload.note,
      });

      for (const stage of submission.stages) {
        if (stage.status === "Returned") {
          stage.status = "In progress";
          stage.startedAt = action.payload.at;
          stage.dueAt = hoursLater(action.payload.at, stage.serviceHours);
          stage.decidedAt = undefined;
        }
      }
      submission.status = deriveStatus(submission);
    },

    /** FR-SUB-13 — a late paper enters clearance only on a documented authority. */
    lateAuthorised(
      state,
      action: PayloadAction<{
        submissionId: string;
        by: string;
        reference: string;
        at: string;
      }>,
    ) {
      const submission = find(state, action.payload.submissionId);
      if (!submission) return;
      submission.lateAuthorisedBy = action.payload.by;
      submission.lateAuthorisationRef = action.payload.reference;
      openStages(submission, action.payload.at);
      submission.status = deriveStatus(submission);
    },

    /** FR-SUB-15 — a recorded exception releases named mandatory stages. */
    exceptionAuthorised(
      state,
      action: PayloadAction<{
        submissionId: string;
        stages: ClearanceStageName[];
        by: string;
        reference: string;
        reason: string;
        at: string;
      }>,
    ) {
      const submission = find(state, action.payload.submissionId);
      if (!submission) return;

      submission.exception = {
        authorisedBy: action.payload.by,
        reference: action.payload.reference,
        at: action.payload.at,
        reason: action.payload.reason,
        stagesSkipped: action.payload.stages,
      };
      for (const stage of submission.stages) {
        if (action.payload.stages.includes(stage.stage)) {
          stage.status = "Skipped by exception";
          stage.decidedAt = action.payload.at;
        }
      }
      openStages(submission, action.payload.at);
      submission.status = deriveStatus(submission);
    },

    /** FR-SUB-04 — a quarantined upload is released only once it is clean. */
    quarantineResolved(
      state,
      action: PayloadAction<{
        submissionId: string;
        fileId: string;
        outcome: "Released" | "Withdrawn";
        at: string;
      }>,
    ) {
      const submission = find(state, action.payload.submissionId);
      const file = submission?.files.find((f) => f.id === action.payload.fileId);
      if (!submission || !file) return;

      if (action.payload.outcome === "Released") {
        file.scan = "Clean";
        file.quarantineReason = undefined;
      } else {
        submission.files = submission.files.filter((f) => f.id !== file.id);
      }

      if (!submission.files.some((f) => f.scan === "Quarantined")) {
        submission.status = "In clearance";
        openStages(submission, action.payload.at);
        submission.status = deriveStatus(submission);
      }
    },

    /* --------------------------- FR-SUB-12 --------------------------- */
    delegationRevoked(state, action: PayloadAction<{ delegationId: string }>) {
      const delegation = state.delegations.find(
        (d) => d.id === action.payload.delegationId,
      );
      if (delegation) delegation.status = "Revoked";
    },

    /** Which clearance role the console is currently answering for. */
    actingStageChanged(state, action: PayloadAction<ClearanceStageName>) {
      state.actingStage = action.payload;
    },
  },
});

export const {
  submitted,
  decisionRecorded,
  commentAdded,
  resubmitted,
  lateAuthorised,
  exceptionAuthorised,
  quarantineResolved,
  delegationRevoked,
  actingStageChanged,
} = submissionsSlice.actions;

export default submissionsSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectSubmissions = (s: RootState) => s.submissions.items;
export const selectClearanceDelegations = (s: RootState) => s.submissions.delegations;
export const selectActingStage = (s: RootState) => s.submissions.actingStage;

/**
 * FR-SUB-05 — a ministry submitter sees their own ministry and nothing else.
 * This is the boundary the papers side of the app is built on, so it is a
 * selector rather than a filter someone remembers to apply per page.
 */
export const selectMinistrySubmissions = (ministry: string) =>
  createSelector([selectSubmissions], (items) =>
    items.filter((s) => s.metadata.originatingMinistry === ministry),
  );

export const selectInClearance = createSelector([selectSubmissions], (items) =>
  items.filter(
    (s) => s.status === "In clearance" || s.status === "Returned for amendment",
  ),
);

/** FR-SUB-09 — what this clearance actor is being waited on for. */
export const selectQueueForStage = createSelector(
  [selectSubmissions, selectActingStage],
  (items, stage) =>
    items.filter((s) =>
      s.stages.some((st) => st.stage === stage && st.status === "In progress"),
    ),
);

/** FR-SUB-13 */
export const selectLateSubmissions = createSelector([selectSubmissions], (items) =>
  items.filter((s) => s.late),
);

/** FR-SUB-14 — a stage past its configured service time. */
export interface Escalation {
  submission: Submission;
  stage: ClearanceStage;
  hoursOver: number;
}

export const selectEscalations = (now: string) =>
  createSelector([selectSubmissions], (items) => {
    const rows: Escalation[] = [];
    for (const submission of items) {
      for (const stage of submission.stages) {
        if (stage.status !== "In progress" || !stage.dueAt) continue;
        const hoursOver =
          (new Date(now).getTime() - new Date(stage.dueAt).getTime()) / 3_600_000;
        if (hoursOver > 0) rows.push({ submission, stage, hoursOver });
      }
    }
    return rows.sort((a, b) => b.hoursOver - a.hoursOver);
  });

/** FR-SUB-15 */
export const selectExceptions = createSelector([selectSubmissions], (items) =>
  items.filter((s) => s.exception),
);

/** FR-SUB-04 */
export const selectQuarantined = createSelector([selectSubmissions], (items) =>
  items.filter((s) => s.files.some((f) => f.scan === "Quarantined")),
);

/**
 * FR-SUB-15 — papers that cannot reach pack assembly. A paper is blocked while
 * any mandatory stage is outstanding and no exception has released it.
 */
export const selectBlockedFromPack = createSelector([selectSubmissions], (items) =>
  items.filter(
    (s) =>
      s.status !== "Cleared" &&
      s.status !== "Draft" &&
      s.stages.some((st) => st.mandatory && !DONE.includes(st.status)),
  ),
);

/** Queue depth at each stage, in pipeline order. */
export const selectStageDepth = createSelector([selectSubmissions], (items) => {
  const depth = new Map<ClearanceStageName, number>();
  for (const submission of items) {
    for (const stage of submission.stages) {
      if (stage.status !== "In progress") continue;
      depth.set(stage.stage, (depth.get(stage.stage) ?? 0) + 1);
    }
  }
  return depth;
});
