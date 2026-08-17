/**
 * Document classification, security and handling — FR-DOC-01 … FR-DOC-20.
 *
 * FR-DOC-04 requires a classification change to be recorded with its previous
 * value, its new value, the actor and the reason. That is done here, in the same
 * dispatch as the change, so the log cannot be written without them.
 */
import { OPERATOR } from "@/core/app-constants";
import type { AppThunk } from "@/core/store";
import { logged } from "@/core/slices/audit-slice";
import {
  accessRestored,
  endpointVerified,
  offlineWiped,
  reclassificationDecided,
  revoked,
  transferDecided,
} from "@/core/slices/docsec-slice";
import type {
  ReclassificationRequest,
  Revocation,
  SecureEndpoint,
} from "@/models/response/base-response";

const actor = { actor: OPERATOR.name, role: OPERATOR.role, ip: OPERATOR.ip };
const by = `${OPERATOR.name} (${OPERATOR.shortRole})`;
const now = () => new Date().toISOString().slice(0, 16);
const rid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

/** FR-DOC-03 / 04 */
export const decideReclassification =
  (request: ReclassificationRequest, status: "Applied" | "Declined"): AppThunk =>
  (dispatch) => {
    dispatch(
      reclassificationDecided({ requestId: request.id, status, by, at: now() }),
    );
    dispatch(
      logged({
        ...actor,
        action:
          status === "Applied"
            ? `Classification changed ${request.from} → ${request.to}. ${request.reason}`
            : `Reclassification declined — ${request.from} retained. ${request.reason}`,
        target: `${request.documentId} — ${request.documentTitle}`,
        severity: status === "Applied" && request.direction === "Lowered" ? "critical" : "warning",
      }),
    );
  };

/** FR-DOC-14 */
export const revokeAccess =
  (request: {
    scope: Revocation["scope"];
    targetId: string;
    targetTitle: string;
    audience: Revocation["audience"];
    users: string[];
    reason: string;
  }): AppThunk =>
  (dispatch) => {
    const at = now();
    dispatch(
      revoked({
        id: rid("REV"),
        scope: request.scope,
        targetId: request.targetId,
        targetTitle: request.targetTitle,
        audience: request.audience,
        users: request.users,
        reason: request.reason,
        by,
        at,
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Access revoked (${request.scope.toLowerCase()}, ${
          request.audience === "All users"
            ? "all users"
            : `${request.users.length} named users`
        }) — ${request.reason}`,
        target: `${request.targetId} — ${request.targetTitle}`,
        severity: "critical",
      }),
    );
  };

export const restoreAccess =
  (revocationId: string, targetTitle: string): AppThunk =>
  (dispatch) => {
    dispatch(accessRestored({ revocationId, at: now() }));
    dispatch(
      logged({
        ...actor,
        action: "Access restored after revocation",
        target: `${revocationId} — ${targetTitle}`,
        severity: "warning",
      }),
    );
  };

/** FR-DOC-17 */
export const recordVerification =
  (
    endpoint: SecureEndpoint,
    verification: SecureEndpoint["verification"],
    note?: string,
  ): AppThunk =>
  (dispatch) => {
    dispatch(
      endpointVerified({ endpointId: endpoint.id, verification, at: now(), note }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Endpoint inspection: ${verification.toLowerCase()}`,
        target: `${endpoint.id} — ${endpoint.label}`,
        severity: verification === "Clean" ? "info" : "critical",
      }),
    );
  };

/** FR-DOC-18 */
export const wipeOfflineCopy =
  (grantId: string, userName: string, deviceLabel: string): AppThunk =>
  (dispatch) => {
    dispatch(offlineWiped({ grantId, at: now() }));
    dispatch(
      logged({
        ...actor,
        action: "Remote wipe requested for an offline copy",
        target: `${grantId} — ${userName}, ${deviceLabel}`,
        severity: "critical",
      }),
    );
  };

/** FR-DOC-20 */
export const decideTransfer =
  (request: {
    transferId: string;
    title: string;
    direction: "Import" | "Export";
    status: "Completed" | "Declined";
  }): AppThunk =>
  (dispatch) => {
    dispatch(
      transferDecided({
        transferId: request.transferId,
        status: request.status,
        approvedBy: by,
        at: now(),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `${request.direction} ${request.status === "Completed" ? "approved and completed" : "declined"}`,
        target: `${request.transferId} — ${request.title}`,
        severity: request.status === "Completed" ? "warning" : "info",
      }),
    );
  };
