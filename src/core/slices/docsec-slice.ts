import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  seedEndpoints,
  seedOfflineGrants,
  seedReclassifications,
  seedRevocations,
  seedTransfers,
} from "@/data/documentSecurity";
import type {
  OfflineGrant,
  ReclassificationRequest,
  Revocation,
  SecureEndpoint,
  TransferRecord,
} from "@/models/response/base-response";
import type { RootState } from "@/core/store";

interface DocSecState {
  reclassifications: ReclassificationRequest[];
  revocations: Revocation[];
  endpoints: SecureEndpoint[];
  offlineGrants: OfflineGrant[];
  transfers: TransferRecord[];
}

const initialState: DocSecState = {
  reclassifications: seedReclassifications,
  revocations: seedRevocations,
  endpoints: seedEndpoints,
  offlineGrants: seedOfflineGrants,
  transfers: seedTransfers,
};

const docSecSlice = createSlice({
  name: "docsec",
  initialState,
  reducers: {
    /**
     * FR-DOC-03 / 04 — applying a change takes effect on the next access
     * decision. Nothing is re-released and nobody signs in again; the previous
     * value, the new value, the actor and the reason all stay on the record.
     */
    reclassificationDecided(
      state,
      action: PayloadAction<{
        requestId: string;
        status: "Applied" | "Declined";
        by: string;
        at: string;
      }>,
    ) {
      const request = state.reclassifications.find(
        (r) => r.id === action.payload.requestId,
      );
      if (!request || request.status !== "Pending") return;
      request.status = action.payload.status;
      request.decidedBy = action.payload.by;
      request.decidedAt = action.payload.at;
    },

    reclassificationRaised(state, action: PayloadAction<ReclassificationRequest>) {
      state.reclassifications.unshift(action.payload);
    },

    /** FR-DOC-14 */
    revoked(state, action: PayloadAction<Revocation>) {
      state.revocations.unshift(action.payload);
    },
    accessRestored(
      state,
      action: PayloadAction<{ revocationId: string; at: string }>,
    ) {
      const revocation = state.revocations.find(
        (r) => r.id === action.payload.revocationId,
      );
      if (revocation) revocation.restoredAt = action.payload.at;
    },

    /** FR-DOC-17 — the result of inspecting an endpoint after a session. */
    endpointVerified(
      state,
      action: PayloadAction<{
        endpointId: string;
        verification: SecureEndpoint["verification"];
        at: string;
        note?: string;
      }>,
    ) {
      const endpoint = state.endpoints.find((e) => e.id === action.payload.endpointId);
      if (!endpoint) return;
      endpoint.verification = action.payload.verification;
      endpoint.lastVerifiedAt = action.payload.at;
      endpoint.note = action.payload.note;
    },

    /** FR-DOC-18 — remote wipe of an offline copy. */
    offlineWiped(
      state,
      action: PayloadAction<{ grantId: string; at: string }>,
    ) {
      const grant = state.offlineGrants.find((g) => g.id === action.payload.grantId);
      if (!grant) return;
      grant.status = "Wiped";
      grant.wipeRequestedAt = action.payload.at;
    },

    /** FR-DOC-20 */
    transferDecided(
      state,
      action: PayloadAction<{
        transferId: string;
        status: "Completed" | "Declined";
        approvedBy: string;
        at: string;
      }>,
    ) {
      const transfer = state.transfers.find((t) => t.id === action.payload.transferId);
      if (!transfer) return;
      transfer.status = action.payload.status;
      transfer.approvedBy = action.payload.approvedBy;
      transfer.at = action.payload.at;
    },
  },
});

export const {
  reclassificationDecided,
  reclassificationRaised,
  revoked,
  accessRestored,
  endpointVerified,
  offlineWiped,
  transferDecided,
} = docSecSlice.actions;

export default docSecSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectReclassifications = (s: RootState) => s.docsec.reclassifications;
export const selectRevocations = (s: RootState) => s.docsec.revocations;
export const selectEndpoints = (s: RootState) => s.docsec.endpoints;
export const selectOfflineGrants = (s: RootState) => s.docsec.offlineGrants;
export const selectTransfers = (s: RootState) => s.docsec.transfers;

export const selectPendingReclassifications = createSelector(
  [selectReclassifications],
  (items) => items.filter((r) => r.status === "Pending"),
);

/** FR-DOC-14 — revocations still in force. */
export const selectActiveRevocations = createSelector([selectRevocations], (items) =>
  items.filter((r) => !r.restoredAt),
);

/** FR-DOC-17 — endpoints that did not come back clean. */
export const selectFailingEndpoints = createSelector([selectEndpoints], (items) =>
  items.filter((e) => e.verification !== "Clean"),
);

/**
 * Endpoint configuration that contradicts the rules: persistent storage on a
 * shared device, an unbounded cache, or offline enabled where FR-DOC-19 forbids
 * it. These are policy exceptions, not preferences.
 */
export const selectEndpointExceptions = createSelector([selectEndpoints], (items) =>
  items.filter(
    (e) =>
      e.persistentStorage ||
      !e.cacheEncrypted ||
      e.cacheScope !== "Current session only" ||
      e.offlineEnabled,
  ),
);

export const selectPendingTransfers = createSelector([selectTransfers], (items) =>
  items.filter((t) => t.status === "Awaiting approval"),
);
