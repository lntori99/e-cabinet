/**
 * FR-DEC — decision capture and action tracking.
 *
 * Named `decisionRecord` rather than `decisions` because the older, shallower
 * `decisions` slice still feeds the legacy dashboard. This is the FR-DEC model.
 */
import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  seedActionRecords,
  seedActionUpdates,
  seedCorrections,
  seedDecisionRecords,
  seedMinutes,
} from "@/data/decisions";
import type {
  ActionRecord,
  ActionUpdate,
  ClosureEvidence,
  DecisionCorrection,
  DecisionRecord,
  MinutesDocument,
} from "@/models/response/base-response";
import type { RootState } from "@/core/store";

interface DecisionRecordState {
  decisions: DecisionRecord[];
  corrections: DecisionCorrection[];
  actions: ActionRecord[];
  updates: ActionUpdate[];
  minutes: MinutesDocument[];
}

const initialState: DecisionRecordState = {
  decisions: seedDecisionRecords,
  corrections: seedCorrections,
  actions: seedActionRecords,
  updates: seedActionUpdates,
  minutes: seedMinutes,
};

const slice = createSlice({
  name: "decisionRecord",
  initialState,
  reducers: {
    /** FR-DEC-01, FR-DEC-02 */
    decisionRecorded(state, action: PayloadAction<DecisionRecord>) {
      state.decisions.unshift(action.payload);
    },

    /** FR-DEC-04 — draft → in review → finalised, one direction only. */
    decisionAdvanced(
      state,
      action: PayloadAction<{
        decisionId: string;
        to: DecisionRecord["state"];
        by: string;
        at: string;
      }>,
    ) {
      const decision = state.decisions.find((d) => d.id === action.payload.decisionId);
      if (!decision || decision.state === "Finalised") return;
      decision.state = action.payload.to;
      if (action.payload.to === "In review") decision.reviewedBy = action.payload.by;
      if (action.payload.to === "Finalised") {
        decision.finalisedAt = action.payload.at;
        decision.reviewedBy ??= action.payload.by;
      }
    },

    /** FR-DEC-05 — the original text is preserved on the correction record. */
    decisionCorrected(state, action: PayloadAction<DecisionCorrection>) {
      const decision = state.decisions.find(
        (d) => d.id === action.payload.decisionId,
      );
      if (!decision) return;
      state.corrections.unshift(action.payload);
      decision.text = action.payload.correctedText;
    },

    /** FR-DEC-06 */
    actionCreated(state, action: PayloadAction<ActionRecord>) {
      state.actions.unshift(action.payload);
    },

    /** FR-DEC-07 — status and narrative move together, never separately. */
    actionProgressed(
      state,
      action: PayloadAction<{ update: ActionUpdate; state: ActionRecord["state"] }>,
    ) {
      const item = state.actions.find((a) => a.id === action.payload.update.actionId);
      if (!item) return;
      item.state = action.payload.state;
      state.updates.push(action.payload.update);
    },

    /** FR-DEC-08 */
    actionEscalated(
      state,
      action: PayloadAction<{ actionId: string; at: string; update: ActionUpdate }>,
    ) {
      const item = state.actions.find((a) => a.id === action.payload.actionId);
      if (!item) return;
      item.escalated = true;
      item.escalatedAt = action.payload.at;
      state.updates.push(action.payload.update);
    },

    /** FR-DEC-08 — the reminder that goes out before the deadline. */
    reminderIssued(state, action: PayloadAction<{ actionId: string; at: string }>) {
      const item = state.actions.find((a) => a.id === action.payload.actionId);
      if (item) item.reminderSentAt = action.payload.at;
    },

    /** FR-DEC-10 — the ministry submits evidence; it is not yet closed. */
    closureSubmitted(
      state,
      action: PayloadAction<{
        actionId: string;
        evidence: ClosureEvidence;
        update: ActionUpdate;
      }>,
    ) {
      const item = state.actions.find((a) => a.id === action.payload.actionId);
      if (!item) return;
      item.evidence = action.payload.evidence;
      item.state = "Submitted for closure";
      state.updates.push(action.payload.update);
    },

    /** FR-DEC-10 — Secretariat verification is the act that closes it. */
    closureVerified(
      state,
      action: PayloadAction<{
        actionId: string;
        accept: boolean;
        by: string;
        at: string;
        update: ActionUpdate;
      }>,
    ) {
      const item = state.actions.find((a) => a.id === action.payload.actionId);
      if (!item) return;
      if (action.payload.accept) {
        item.state = "Closed";
        item.verifiedBy = action.payload.by;
        item.verifiedAt = action.payload.at;
        item.closedAt = action.payload.at;
      } else {
        item.state = "In progress";
        item.evidence = undefined;
      }
      state.updates.push(action.payload.update);
    },

    /** FR-DEC-11, FR-DEC-12 */
    minutesAdvanced(
      state,
      action: PayloadAction<{
        minutesId: string;
        to: MinutesDocument["state"];
        by: string;
        at: string;
      }>,
    ) {
      const doc = state.minutes.find((m) => m.id === action.payload.minutesId);
      if (!doc) return;
      doc.state = action.payload.to;
      if (action.payload.to === "Approved") doc.approvedBy = action.payload.by;
      if (action.payload.to === "Circulated") doc.circulatedAt = action.payload.at;
    },
  },
});

export const {
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
} = slice.actions;

export default slice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectDecisionRecords = (s: RootState) => s.decisionRecord.decisions;
export const selectCorrections = (s: RootState) => s.decisionRecord.corrections;
export const selectActionRecords = (s: RootState) => s.decisionRecord.actions;
export const selectActionUpdates = (s: RootState) => s.decisionRecord.updates;
export const selectMinutes = (s: RootState) => s.decisionRecord.minutes;

export const selectDraftDecisions = createSelector(
  [selectDecisionRecords],
  (decisions) => decisions.filter((d) => d.state !== "Finalised"),
);

export const selectFinalisedDecisions = createSelector(
  [selectDecisionRecords],
  (decisions) => decisions.filter((d) => d.state === "Finalised"),
);

/** FR-DEC-13 — only the decisions that continue an earlier one. */
export const selectChainedDecisions = createSelector(
  [selectDecisionRecords],
  (decisions) => decisions.filter((d) => d.supersedes),
);

export const selectAwaitingVerification = createSelector(
  [selectActionRecords],
  (actions) => actions.filter((a) => a.state === "Submitted for closure"),
);

export const selectEscalatedActions = createSelector([selectActionRecords], (actions) =>
  actions.filter((a) => a.escalated),
);

export const selectUpdatesFor = (actionId: string) =>
  createSelector([selectActionUpdates], (updates) =>
    updates
      .filter((u) => u.actionId === actionId)
      .sort((a, b) => a.at.localeCompare(b.at)),
  );

export const selectActionsForDecision = (decisionId: string) =>
  createSelector([selectActionRecords], (actions) =>
    actions.filter((a) => a.decisionId === decisionId),
  );
