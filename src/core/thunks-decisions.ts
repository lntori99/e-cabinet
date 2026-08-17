/**
 * FR-DEC — decision capture and action tracking.
 *
 * Every act here writes two things in one dispatch: the state change and its
 * audit entry. FR-DEC-05 and FR-DEC-10 both turn on being able to say who did
 * something and why, so the trail is not optional and is not written later.
 */
import { OPERATOR } from "@/core/app-constants";
import { logged } from "@/core/slices/audit-slice";
import {
  actionCreated,
  actionEscalated,
  actionProgressed,
  closureSubmitted,
  closureVerified,
  decisionAdvanced,
  decisionCorrected,
  decisionRecorded,
  minutesAdvanced,
  reminderIssued,
} from "@/core/slices/decision-slice";
import type {
  ActionRecord,
  ActionUpdate,
  ClosureEvidence,
  DecisionRecord,
  MinutesDocument,
} from "@/models/response/base-response";
import type { AppThunk } from "@/core/store";

const actor = { actor: OPERATOR.name, role: OPERATOR.role, ip: OPERATOR.ip };
const who = `${OPERATOR.name} (${OPERATOR.shortRole})`;
const now = () => new Date().toISOString().slice(0, 16);
const rid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

function update(
  actionId: string,
  narrative: string,
  state: ActionRecord["state"],
  by = who,
): ActionUpdate {
  return { id: rid("AU"), actionId, at: now(), by, narrative, state };
}

/** FR-DEC-01, FR-DEC-02 */
export const recordDecision =
  (decision: Omit<DecisionRecord, "id" | "recordedBy" | "recordedAt" | "state">): AppThunk =>
  (dispatch) => {
    const record: DecisionRecord = {
      ...decision,
      id: rid("DEC"),
      state: "Draft",
      recordedBy: who,
      recordedAt: now(),
    };
    dispatch(decisionRecorded(record));
    dispatch(
      logged({
        ...actor,
        action: "Decision recorded",
        target: `${record.id} · ${record.agendaItemTitle} · ${record.outcome}`,
        severity: "info",
      }),
    );
  };

/** FR-DEC-04 — the one-way cycle. Finalisation is the point of no return. */
export const advanceDecision =
  (decision: DecisionRecord, to: DecisionRecord["state"]): AppThunk =>
  (dispatch) => {
    dispatch(decisionAdvanced({ decisionId: decision.id, to, by: who, at: now() }));
    dispatch(
      logged({
        ...actor,
        action: to === "Finalised" ? "Decision finalised" : "Decision sent for review",
        target: `${decision.id} · ${decision.agendaItemTitle}`,
        severity: to === "Finalised" ? "warning" : "info",
      }),
    );
  };

/** FR-DEC-05 — a correction, never an edit. */
export const correctDecision =
  (decision: DecisionRecord, correctedText: string, reason: string): AppThunk =>
  (dispatch) => {
    dispatch(
      decisionCorrected({
        id: rid("COR"),
        decisionId: decision.id,
        at: now(),
        authorisedBy: who,
        reason,
        originalText: decision.text,
        correctedText,
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: "Finalised decision corrected",
        target: `${decision.id} · ${reason}`,
        severity: "warning",
      }),
    );
  };

/** FR-DEC-06 */
export const createAction =
  (item: Omit<ActionRecord, "id" | "state" | "escalated">): AppThunk =>
  (dispatch) => {
    const record: ActionRecord = {
      ...item,
      id: rid("ACT"),
      state: "Not started",
      escalated: false,
    };
    dispatch(actionCreated(record));
    dispatch(
      logged({
        ...actor,
        action: "Action created",
        target: `${record.id} · ${record.ministry} · due ${record.deadline}`,
        severity: "info",
      }),
    );
  };

/** FR-DEC-07 — narrative progress from the assigned officer. */
export const progressAction =
  (item: ActionRecord, to: ActionRecord["state"], narrative: string): AppThunk =>
  (dispatch) => {
    dispatch(
      actionProgressed({
        update: update(item.id, narrative, to, item.officer),
        state: to,
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: "Action progress recorded",
        target: `${item.id} · ${to}`,
        severity: "info",
      }),
    );
  };

/** FR-DEC-08 */
export const escalateAction =
  (item: ActionRecord): AppThunk =>
  (dispatch) => {
    const at = now();
    dispatch(
      actionEscalated({
        actionId: item.id,
        at,
        update: update(
          item.id,
          `Deadline passed with the action open. Escalated to the ${item.escalationPoint} under the configured escalation point.`,
          item.state,
          "System",
        ),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: "Action escalated",
        target: `${item.id} · ${item.escalationPoint}`,
        severity: "warning",
      }),
    );
  };

/** FR-DEC-08 — the advance reminder. */
export const sendReminder =
  (item: ActionRecord): AppThunk =>
  (dispatch) => {
    dispatch(reminderIssued({ actionId: item.id, at: now() }));
    dispatch(
      logged({
        ...actor,
        action: "Deadline reminder issued",
        target: `${item.id} · ${item.officer} · due ${item.deadline}`,
        severity: "info",
      }),
    );
  };

/** FR-DEC-10 — the ministry's half. Closure is not granted here. */
export const submitClosure =
  (item: ActionRecord, evidence: Omit<ClosureEvidence, "submittedBy" | "submittedAt">): AppThunk =>
  (dispatch) => {
    const full: ClosureEvidence = {
      ...evidence,
      submittedBy: item.officer,
      submittedAt: now(),
    };
    dispatch(
      closureSubmitted({
        actionId: item.id,
        evidence: full,
        update: update(
          item.id,
          `Closure requested with evidence ${full.reference}.`,
          "Submitted for closure",
          item.officer,
        ),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: "Action closure submitted",
        target: `${item.id} · ${full.reference}`,
        severity: "info",
      }),
    );
  };

/** FR-DEC-10 — the Secretariat's half. */
export const verifyClosure =
  (item: ActionRecord, accept: boolean, note: string): AppThunk =>
  (dispatch) => {
    dispatch(
      closureVerified({
        actionId: item.id,
        accept,
        by: who,
        at: now(),
        update: update(
          item.id,
          accept
            ? `Evidence checked against the decision. Closure verified. ${note}`.trim()
            : `Closure returned to the ministry. ${note}`.trim(),
          accept ? "Closed" : "In progress",
        ),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: accept ? "Action closure verified" : "Action closure returned",
        target: `${item.id} · ${item.ministry}`,
        severity: accept ? "info" : "warning",
      }),
    );
  };

/** FR-DEC-11, FR-DEC-12 */
export const advanceMinutes =
  (doc: MinutesDocument, to: MinutesDocument["state"]): AppThunk =>
  (dispatch) => {
    dispatch(minutesAdvanced({ minutesId: doc.id, to, by: who, at: now() }));
    dispatch(
      logged({
        ...actor,
        action: to === "Circulated" ? `${doc.kind} circulated` : `${doc.kind} ${to.toLowerCase()}`,
        target:
          to === "Circulated"
            ? `${doc.id} · ${doc.classification} · ${doc.circulatedTo.length} named recipients`
            : `${doc.id} · ${doc.meetingTitle}`,
        severity: to === "Circulated" ? "warning" : "info",
      }),
    );
  };
