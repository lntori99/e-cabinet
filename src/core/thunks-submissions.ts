/**
 * Submission and clearance operations — FR-SUB-01 … FR-SUB-15.
 *
 * Timestamps, identifiers and the audit entry each mutation generates are
 * produced here, which keeps the reducers pure and stops the log drifting from
 * the decision it records.
 */
import { OPERATOR } from "@/core/app-constants";
import type { AppThunk } from "@/core/store";
import { logged } from "@/core/slices/audit-slice";
import {
  commentAdded,
  decisionRecorded,
  delegationRevoked,
  exceptionAuthorised,
  lateAuthorised,
  quarantineResolved,
  resubmitted,
  submitted,
} from "@/core/slices/submissions-slice";
import type {
  ClearanceDecision,
  ClearanceStageName,
  Submission,
} from "@/models/response/base-response";

const actor = { actor: OPERATOR.name, role: OPERATOR.role, ip: OPERATOR.ip };
const now = () => new Date().toISOString().slice(0, 16);
const rid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/** FR-SUB-01 / 02 / 03 */
export const submitPaper =
  (submission: Submission): AppThunk =>
  (dispatch) => {
    const at = now();
    dispatch(submitted({ submission: { ...submission, submittedAt: at }, at }));
    dispatch(
      logged({
        ...actor,
        action: `Paper submitted for ${submission.metadata.meetingId}${submission.late ? " — late, awaiting Secretariat authorisation" : ""}`,
        target: `${submission.id} — ${submission.title}`,
        severity: submission.late ? "warning" : "info",
      }),
    );
  };

/** FR-SUB-09 — approve, reject or return, always with a written comment. */
export const recordDecision =
  (request: {
    submissionId: string;
    title: string;
    stage: ClearanceStageName;
    decision: ClearanceDecision;
    comment: string;
    role: string;
  }): AppThunk =>
  (dispatch) => {
    dispatch(
      decisionRecorded({
        submissionId: request.submissionId,
        stage: request.stage,
        decision: request.decision,
        comment: request.comment,
        by: OPERATOR.name,
        role: request.role,
        at: now(),
        commentId: rid("CC"),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `${request.stage}: ${request.decision.toLowerCase()}`,
        target: `${request.submissionId} — ${request.title}`,
        severity: request.decision === "Approved" ? "info" : "warning",
      }),
    );
  };

/** FR-SUB-10 / 11 */
export const addComment =
  (request: {
    submissionId: string;
    stage: ClearanceStageName | "Submission";
    body: string;
    role: string;
    replyToId?: string;
  }): AppThunk =>
  (dispatch) => {
    dispatch(
      commentAdded({
        submissionId: request.submissionId,
        commentId: rid("CC"),
        stage: request.stage,
        body: request.body,
        by: OPERATOR.name,
        role: request.role,
        at: now(),
        replyToId: request.replyToId,
      }),
    );
  };

/** FR-SUB-11 — a new version against the same thread. */
export const resubmitPaper =
  (request: { submissionId: string; title: string; note: string }): AppThunk =>
  (dispatch) => {
    dispatch(
      resubmitted({
        submissionId: request.submissionId,
        note: request.note,
        by: OPERATOR.name,
        at: now(),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: "Paper resubmitted after amendment",
        target: `${request.submissionId} — ${request.title}`,
        severity: "info",
      }),
    );
  };

/** FR-SUB-13 */
export const authoriseLate =
  (request: { submissionId: string; title: string; reference: string }): AppThunk =>
  (dispatch) => {
    dispatch(
      lateAuthorised({
        submissionId: request.submissionId,
        by: OPERATOR.name,
        reference: request.reference,
        at: now(),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Late submission authorised into clearance on ${request.reference}`,
        target: `${request.submissionId} — ${request.title}`,
        severity: "warning",
      }),
    );
  };

/** FR-SUB-15 */
export const authoriseException =
  (request: {
    submissionId: string;
    title: string;
    stages: ClearanceStageName[];
    reference: string;
    reason: string;
  }): AppThunk =>
  (dispatch) => {
    dispatch(
      exceptionAuthorised({
        submissionId: request.submissionId,
        stages: request.stages,
        by: OPERATOR.name,
        reference: request.reference,
        reason: request.reason,
        at: now(),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Clearance exception authorised on ${request.reference} — ${request.stages.join(", ")} released`,
        target: `${request.submissionId} — ${request.title}`,
        severity: "critical",
      }),
    );
  };

/** FR-SUB-04 */
export const resolveQuarantine =
  (request: {
    submissionId: string;
    title: string;
    fileId: string;
    fileName: string;
    outcome: "Released" | "Withdrawn";
  }): AppThunk =>
  (dispatch) => {
    dispatch(
      quarantineResolved({
        submissionId: request.submissionId,
        fileId: request.fileId,
        outcome: request.outcome,
        at: now(),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Quarantined upload ${request.outcome.toLowerCase()}: ${request.fileName}`,
        target: `${request.submissionId} — ${request.title}`,
        severity: request.outcome === "Released" ? "warning" : "info",
      }),
    );
  };

/** FR-SUB-12 */
export const revokeClearanceDelegation =
  (delegationId: string, summary: string): AppThunk =>
  (dispatch) => {
    dispatch(delegationRevoked({ delegationId }));
    dispatch(
      logged({
        ...actor,
        action: `Clearance delegation revoked — ${summary}`,
        target: delegationId,
        severity: "warning",
      }),
    );
  };
