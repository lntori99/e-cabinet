/**
 * FR-DAT — data governance, retention, archival and continuity.
 *
 * FR-DAT-04 is the rule the slice exists to hold: a deletion needs an approval
 * by somebody other than the requester, and then an execution by somebody other
 * than the approver. Two separate guards, both here rather than on a button,
 * because "not executable by a single administrator" has to mean the platform
 * refuses it and not that the screen hides it.
 */
import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  APPROACHING_DAYS,
  seedBackups,
  seedCustodians,
  seedDeletions,
  seedHolds,
  seedPersonalData,
  seedRecoveryTests,
  seedReplication,
  seedResidency,
  seedRetainedRecords,
  seedRetentionClasses,
  seedTransfers,
} from "@/data/dataGovernance";
import type {
  ArchivalTransfer,
  DeletionRequest,
  LegalHold,
  RetainedRecord,
} from "@/models/response/base-response";
import type { RootState } from "@/core/store";

interface GovernanceState {
  records: RetainedRecord[];
  holds: LegalHold[];
  transfers: ArchivalTransfer[];
  deletions: DeletionRequest[];
}

const initialState: GovernanceState = {
  records: seedRetainedRecords,
  holds: seedHolds,
  transfers: seedTransfers,
  deletions: seedDeletions,
};

const slice = createSlice({
  name: "governance",
  initialState,
  reducers: {
    /** FR-DAT-04, first guard — the requester may not approve. */
    deletionDecided(
      state,
      action: PayloadAction<{
        id: string;
        approve: boolean;
        approver: string;
        at: string;
        note: string;
      }>,
    ) {
      const request = state.deletions.find((d) => d.id === action.payload.id);
      if (!request || request.state !== "Awaiting approval") return;
      if (request.requestedBy === action.payload.approver) return;

      request.state = action.payload.approve ? "Approved" : "Rejected";
      request.approver = action.payload.approver;
      request.decidedAt = action.payload.at;
      request.decisionNote = action.payload.note;
    },

    /**
     * FR-DAT-04, second guard — the approver may not execute, and a record
     * under a hold is not deleted whatever the approval says. FR-DAT-05 wins
     * over an approval given before the hold was raised.
     */
    deletionExecuted(
      state,
      action: PayloadAction<{ id: string; by: string; at: string }>,
    ) {
      const request = state.deletions.find((d) => d.id === action.payload.id);
      if (!request || request.state !== "Approved") return;
      if (request.approver === action.payload.by) return;

      const held = request.recordIds.filter((id) =>
        state.records.some((r) => r.id === id && r.holdId),
      );
      if (held.length > 0) return;

      request.state = "Executed";
      request.executedBy = action.payload.by;
      request.executedAt = action.payload.at;
      state.records = state.records.filter((r) => !request.recordIds.includes(r.id));
    },

    deletionRequested(state, action: PayloadAction<DeletionRequest>) {
      state.deletions.unshift(action.payload);
    },

    /** FR-DAT-05 — a hold suspends expiry; it never changes the class. */
    holdRaised(state, action: PayloadAction<LegalHold>) {
      state.holds.unshift(action.payload);
      for (const record of state.records) {
        if (action.payload.recordIds.includes(record.id)) record.holdId = action.payload.id;
      }
    },

    holdLifted(
      state,
      action: PayloadAction<{ id: string; by: string; at: string }>,
    ) {
      const hold = state.holds.find((h) => h.id === action.payload.id);
      if (!hold || hold.state === "Lifted") return;
      hold.state = "Lifted";
      hold.liftedBy = action.payload.by;
      hold.liftedAt = action.payload.at;
      for (const record of state.records) {
        if (record.holdId === hold.id) record.holdId = undefined;
      }
    },

    /** FR-DAT-03 */
    transferRecorded(state, action: PayloadAction<ArchivalTransfer>) {
      state.transfers.unshift(action.payload);
      for (const record of state.records) {
        if (action.payload.recordIds.includes(record.id)) {
          record.transferId = action.payload.id;
        }
      }
    },
  },
});

export const {
  deletionDecided,
  deletionExecuted,
  deletionRequested,
  holdLifted,
  holdRaised,
  transferRecorded,
} = slice.actions;

export default slice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectRetainedRecords = (s: RootState) => s.governance.records;
export const selectHolds = (s: RootState) => s.governance.holds;
export const selectTransfers = (s: RootState) => s.governance.transfers;
export const selectDeletions = (s: RootState) => s.governance.deletions;

export const selectRetentionClasses = () => seedRetentionClasses;
export const selectBackups = () => seedBackups;
export const selectRecoveryTests = () => seedRecoveryTests;
export const selectReplicationTargets = () => seedReplication;
export const selectCustodians = () => seedCustodians;
export const selectResidency = () => seedResidency;
export const selectPersonalData = () => seedPersonalData;

export const selectActiveHolds = createSelector([selectHolds], (holds) =>
  holds.filter((h) => h.state === "In force"),
);

export const selectPendingDeletions = createSelector([selectDeletions], (requests) =>
  requests.filter((d) => d.state === "Awaiting approval" || d.state === "Approved"),
);

/**
 * Whole days from today to a record's expiry. Permanent records return null,
 * which is a different thing from "a very long time" and is treated as such
 * everywhere it is used.
 */
export function daysToExpiry(record: RetainedRecord, today: string): number | null {
  if (!record.expiresAt) return null;
  const ms =
    new Date(`${record.expiresAt}T00:00`).getTime() -
    new Date(`${today}T00:00`).getTime();
  return Math.round(ms / 86_400_000);
}

export type ExpiryBand = "Passed" | "Within 6 months" | "Within 5 years" | "Beyond" | "Permanent";

/** Order is the meaning here, so the bands are declared in order. */
export const EXPIRY_BANDS: ExpiryBand[] = [
  "Passed",
  "Within 6 months",
  "Within 5 years",
  "Beyond",
  "Permanent",
];

export function expiryBand(record: RetainedRecord, today: string): ExpiryBand {
  const days = daysToExpiry(record, today);
  if (days === null) return "Permanent";
  if (days < 0) return "Passed";
  if (days <= APPROACHING_DAYS) return "Within 6 months";
  if (days <= 365 * 5) return "Within 5 years";
  return "Beyond";
}
