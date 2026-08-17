import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  seedAccessDays,
  seedBastionSessions,
  seedBreakGlass,
  seedDeactivations,
  seedDelegations,
  seedDevices,
  seedEntitlementReports,
  seedSessions,
  seedTokens,
} from "@/data/identityAccess";
import type {
  AccessSession,
  BreakGlassGrant,
  DeactivationRequest,
  Delegation,
  EntitlementReport,
  Fido2Token,
  TrustedDevice,
} from "@/models/response/base-response";
import type { RootState } from "@/core/store";

interface IdentityState {
  sessions: AccessSession[];
  tokens: Fido2Token[];
  breakGlass: BreakGlassGrant[];
  delegations: Delegation[];
  devices: TrustedDevice[];
  deactivations: DeactivationRequest[];
  reports: EntitlementReport[];
}

const initialState: IdentityState = {
  sessions: seedSessions,
  tokens: seedTokens,
  breakGlass: seedBreakGlass,
  delegations: seedDelegations,
  devices: seedDevices,
  deactivations: seedDeactivations,
  reports: seedEntitlementReports,
};

const identitySlice = createSlice({
  name: "identity",
  initialState,
  reducers: {
    /**
     * FR-IAM-14 — revoking a session takes the token with it. Nothing here is a
     * soft close: the row stays so the record shows it was cut, not expired.
     */
    sessionRevoked(state, action: PayloadAction<{ sessionId: string }>) {
      const session = state.sessions.find((s) => s.id === action.payload.sessionId);
      if (session) {
        session.status = "Revoked";
        session.elevated = false;
      }
    },
    /** FR-IAM-13 / 14 — deactivation cuts every session the user holds. */
    userSessionsRevoked(state, action: PayloadAction<{ userId: string }>) {
      for (const session of state.sessions) {
        if (session.userId === action.payload.userId && session.status !== "Revoked") {
          session.status = "Revoked";
          session.elevated = false;
        }
      }
    },
    deactivationCompleted(
      state,
      action: PayloadAction<{ requestId: string; at: string }>,
    ) {
      const request = state.deactivations.find((d) => d.id === action.payload.requestId);
      if (request) {
        request.status = "Completed";
        request.completedAt = action.payload.at;
      }
    },
    tokenStatusChanged(
      state,
      action: PayloadAction<{ tokenId: string; status: Fido2Token["status"] }>,
    ) {
      const token = state.tokens.find((t) => t.id === action.payload.tokenId);
      if (token) token.status = action.payload.status;
    },

    /* --------------------------- FR-IAM-11 --------------------------- */
    breakGlassApproved(
      state,
      action: PayloadAction<{
        grantId: string;
        approvedBy: string;
        approvalReference: string;
        grantedAt: string;
        expiresAt: string;
      }>,
    ) {
      const grant = state.breakGlass.find((g) => g.id === action.payload.grantId);
      if (!grant) return;
      grant.status = "Active";
      grant.approvedBy = action.payload.approvedBy;
      grant.approvalReference = action.payload.approvalReference;
      grant.grantedAt = action.payload.grantedAt;
      grant.expiresAt = action.payload.expiresAt;
      // The alert to the client security owner is part of granting, not a
      // follow-up someone has to remember.
      grant.securityOwnerAlerted = true;
    },
    breakGlassDeclined(state, action: PayloadAction<{ grantId: string; by: string }>) {
      const grant = state.breakGlass.find((g) => g.id === action.payload.grantId);
      if (!grant) return;
      grant.status = "Declined";
      grant.approvedBy = action.payload.by;
    },
    breakGlassRevoked(state, action: PayloadAction<{ grantId: string }>) {
      const grant = state.breakGlass.find((g) => g.id === action.payload.grantId);
      if (grant) grant.status = "Revoked";
    },

    /* --------------------------- FR-IAM-17 --------------------------- */
    delegationApproved(
      state,
      action: PayloadAction<{ delegationId: string; approvedBy: string }>,
    ) {
      const delegation = state.delegations.find(
        (d) => d.id === action.payload.delegationId,
      );
      if (!delegation) return;
      delegation.status = "Active";
      delegation.approvedBy = action.payload.approvedBy;
    },
    delegationRevoked(state, action: PayloadAction<{ delegationId: string }>) {
      const delegation = state.delegations.find(
        (d) => d.id === action.payload.delegationId,
      );
      if (delegation) delegation.status = "Revoked";
    },

    /* --------------------------- FR-IAM-18 --------------------------- */
    deviceTrustChanged(
      state,
      action: PayloadAction<{ deviceId: string; status: TrustedDevice["status"] }>,
    ) {
      const device = state.devices.find((d) => d.id === action.payload.deviceId);
      if (device) device.status = action.payload.status;
    },

    /* --------------------------- FR-IAM-16 --------------------------- */
    reviewRecorded(
      state,
      action: PayloadAction<{
        userId: string;
        status: EntitlementReport["reviewStatus"];
        reviewer: string;
        at: string;
      }>,
    ) {
      const report = state.reports.find((r) => r.userId === action.payload.userId);
      if (!report) return;
      report.reviewStatus = action.payload.status;
      report.reviewer = action.payload.reviewer;
      report.reviewedAt = action.payload.at;
    },
  },
});

export const {
  sessionRevoked,
  userSessionsRevoked,
  deactivationCompleted,
  tokenStatusChanged,
  breakGlassApproved,
  breakGlassDeclined,
  breakGlassRevoked,
  delegationApproved,
  delegationRevoked,
  deviceTrustChanged,
  reviewRecorded,
} = identitySlice.actions;

export default identitySlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectSessions = (s: RootState) => s.identity.sessions;
export const selectTokens = (s: RootState) => s.identity.tokens;
export const selectBreakGlass = (s: RootState) => s.identity.breakGlass;
export const selectDelegations = (s: RootState) => s.identity.delegations;
export const selectDevices = (s: RootState) => s.identity.devices;
export const selectDeactivations = (s: RootState) => s.identity.deactivations;
export const selectEntitlementReports = (s: RootState) => s.identity.reports;

/** Sessions still holding a token — what a revoke would actually cut. */
export const selectLiveSessions = createSelector([selectSessions], (sessions) =>
  sessions.filter((s) => s.status !== "Revoked"),
);

export const selectActiveBreakGlass = createSelector([selectBreakGlass], (grants) =>
  grants.filter((g) => g.status === "Active"),
);

/** Everything an approver is holding up: grants and delegations alike. */
export const selectPendingApprovals = createSelector(
  [selectBreakGlass, selectDelegations],
  (grants, delegations) => {
    const pendingGrants = grants.filter((g) => g.status === "Pending approval");
    const pendingDelegations = delegations.filter(
      (d) => d.status === "Pending approval",
    );
    return {
      breakGlass: pendingGrants,
      delegations: pendingDelegations,
      total: pendingGrants.length + pendingDelegations.length,
    };
  },
);

/** FR-IAM-13 — accounts still open past, or close to, the one-hour deadline. */
export const selectOpenDeactivations = createSelector([selectDeactivations], (queue) =>
  queue.filter((d) => d.status === "Awaiting action"),
);

export const selectUntrustedDevices = createSelector([selectDevices], (devices) =>
  devices.filter((d) => d.status === "Blocked" || d.attestation !== "Attested"),
);

/** The denials the access dashboard leads with, newest last. */
export const selectAccessDays = () => seedAccessDays;
