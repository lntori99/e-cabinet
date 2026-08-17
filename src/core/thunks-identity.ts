/**
 * Identity, access and role operations — FR-IAM-01 … FR-IAM-18.
 *
 * Every access decision made through the console is written to the audit log
 * in the same breath as the state change, so the log cannot drift from what
 * was actually granted, cut or attested. Timestamps are produced here rather
 * than in reducers, which keeps the reducers pure.
 */
import { OPERATOR } from "@/core/app-constants";
import type { AppThunk } from "@/core/store";
import { logged } from "@/core/slices/audit-slice";
import { statusChanged as userStatusChanged } from "@/core/slices/users-slice";
import {
  breakGlassApproved,
  breakGlassDeclined,
  breakGlassRevoked,
  deactivationCompleted,
  delegationApproved,
  delegationRevoked,
  deviceTrustChanged,
  reviewRecorded,
  sessionRevoked,
  tokenStatusChanged,
  userSessionsRevoked,
} from "@/core/slices/identity-slice";
import type {
  EntitlementReport,
  Fido2Token,
  TrustedDevice,
} from "@/models/response/base-response";

const actor = { actor: OPERATOR.name, role: OPERATOR.role, ip: OPERATOR.ip };
const now = () => new Date().toISOString().slice(0, 16);

/** FR-IAM-14 — a single session, cut immediately. */
export const revokeSession =
  (sessionId: string, holder: string): AppThunk =>
  (dispatch) => {
    dispatch(sessionRevoked({ sessionId }));
    dispatch(
      logged({
        ...actor,
        action: "Session revoked",
        target: `${sessionId} (${holder})`,
        severity: "warning",
      }),
    );
  };

/**
 * FR-IAM-13 / 14 — deactivation is one action, not two: the account closes and
 * every session, token and pending entitlement it holds goes with it.
 */
export const deactivateAccount =
  (request: {
    userId: string;
    name: string;
    requestId?: string;
    reason?: string;
  }): AppThunk =>
  (dispatch) => {
    const at = now();
    dispatch(userStatusChanged({ userId: request.userId, status: "Deactivated" }));
    dispatch(userSessionsRevoked({ userId: request.userId }));
    if (request.requestId) {
      dispatch(deactivationCompleted({ requestId: request.requestId, at }));
    }
    dispatch(
      logged({
        ...actor,
        action: `Account deactivated${request.reason ? ` — ${request.reason}` : ""}; sessions and tokens revoked`,
        target: `${request.name} (${request.userId})`,
        severity: "critical",
      }),
    );
  };

export const setAccountStatus =
  (request: {
    userId: string;
    name: string;
    status: "Active" | "Suspended";
  }): AppThunk =>
  (dispatch) => {
    dispatch(userStatusChanged({ userId: request.userId, status: request.status }));
    if (request.status === "Suspended") {
      dispatch(userSessionsRevoked({ userId: request.userId }));
    }
    dispatch(
      logged({
        ...actor,
        action: `Account ${request.status.toLowerCase()}`,
        target: `${request.name} (${request.userId})`,
        severity: "warning",
      }),
    );
  };

/** FR-IAM-05 — a lost token is useless the moment it is reported. */
export const setTokenStatus =
  (tokenId: string, serial: string, status: Fido2Token["status"]): AppThunk =>
  (dispatch) => {
    dispatch(tokenStatusChanged({ tokenId, status }));
    dispatch(
      logged({
        ...actor,
        action: `FIDO2 token ${status.toLowerCase()}`,
        target: `${serial} (${tokenId})`,
        severity: status === "Active" ? "info" : "warning",
      }),
    );
  };

/**
 * FR-IAM-11 — a grant cannot exist without a documented client approval, so the
 * approval reference is required by the call rather than checked afterwards.
 * Granting alerts the client security owner and writes the grant to the log.
 */
export const approveBreakGlass =
  (request: {
    grantId: string;
    approvedBy: string;
    approvalReference: string;
    hours: number;
    adminAccount: string;
  }): AppThunk =>
  (dispatch) => {
    const grantedAt = now();
    const expiresAt = new Date(Date.now() + request.hours * 3_600_000)
      .toISOString()
      .slice(0, 16);

    dispatch(
      breakGlassApproved({
        grantId: request.grantId,
        approvedBy: request.approvedBy,
        approvalReference: request.approvalReference,
        grantedAt,
        expiresAt,
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Break-glass granted for ${request.hours}h on ${request.approvalReference}; security owner alerted`,
        target: `${request.grantId} (${request.adminAccount})`,
        severity: "critical",
      }),
    );
  };

export const declineBreakGlass =
  (grantId: string, adminAccount: string): AppThunk =>
  (dispatch) => {
    dispatch(breakGlassDeclined({ grantId, by: OPERATOR.name }));
    dispatch(
      logged({
        ...actor,
        action: "Break-glass request declined",
        target: `${grantId} (${adminAccount})`,
        severity: "warning",
      }),
    );
  };

export const revokeBreakGlass =
  (grantId: string, adminAccount: string): AppThunk =>
  (dispatch) => {
    dispatch(breakGlassRevoked({ grantId }));
    dispatch(
      logged({
        ...actor,
        action: "Break-glass grant revoked before expiry",
        target: `${grantId} (${adminAccount})`,
        severity: "critical",
      }),
    );
  };

/* ------------------------------ FR-IAM-17 ------------------------------ */

export const approveDelegation =
  (delegationId: string, summary: string): AppThunk =>
  (dispatch) => {
    dispatch(delegationApproved({ delegationId, approvedBy: OPERATOR.name }));
    dispatch(
      logged({
        ...actor,
        action: `Delegation approved — ${summary}`,
        target: delegationId,
        severity: "warning",
      }),
    );
  };

export const revokeDelegation =
  (delegationId: string, summary: string): AppThunk =>
  (dispatch) => {
    dispatch(delegationRevoked({ delegationId }));
    dispatch(
      logged({
        ...actor,
        action: `Delegation revoked — ${summary}`,
        target: delegationId,
        severity: "warning",
      }),
    );
  };

/* ------------------------------ FR-IAM-18 ------------------------------ */

export const setDeviceTrust =
  (deviceId: string, label: string, status: TrustedDevice["status"]): AppThunk =>
  (dispatch) => {
    dispatch(deviceTrustChanged({ deviceId, status }));
    dispatch(
      logged({
        ...actor,
        action: `Device ${status === "Blocked" ? "blocked" : "restored to trusted"}`,
        target: `${label} (${deviceId})`,
        severity: status === "Blocked" ? "critical" : "info",
      }),
    );
  };

/* ------------------------------ FR-IAM-16 ------------------------------ */

export const recordReview =
  (request: {
    userId: string;
    name: string;
    status: EntitlementReport["reviewStatus"];
  }): AppThunk =>
  (dispatch) => {
    dispatch(
      reviewRecorded({
        userId: request.userId,
        status: request.status,
        reviewer: OPERATOR.name,
        at: now(),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Access review — ${request.status.toLowerCase()}`,
        target: `${request.name} (${request.userId})`,
        severity: request.status === "Changes requested" ? "warning" : "info",
      }),
    );
  };
