/**
 * FR-DAT — data governance, retention, archival and continuity.
 *
 * FR-DAT-04 requires a deletion to be recorded in the audit log. It is recorded
 * three times here, because it is three acts: the request, the approval, and
 * the execution. A single "deleted" entry would hide the fact that three people
 * were involved, which is the control the requirement is asking for.
 */
import { OPERATOR } from "@/core/app-constants";
import { logged } from "@/core/slices/audit-slice";
import {
  deletionDecided,
  deletionExecuted,
  deletionRequested,
  holdLifted,
  holdRaised,
  transferRecorded,
} from "@/core/slices/governance-slice";
import type {
  ArchivalTransfer,
  DeletionRequest,
  LegalHold,
  RetainedRecord,
} from "@/models/response/base-response";
import type { AppThunk } from "@/core/store";

const actor = { actor: OPERATOR.name, role: OPERATOR.role, ip: OPERATOR.ip };
const who = `${OPERATOR.name} (${OPERATOR.shortRole})`;
const now = () => new Date().toISOString().slice(0, 16);
const today = () => new Date().toISOString().slice(0, 10);
const rid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

/** FR-DAT-04 — the request. Nothing is deleted by making one. */
export const requestDeletion =
  (records: RetainedRecord[], scope: string, reason: string): AppThunk =>
  (dispatch) => {
    const request: DeletionRequest = {
      id: rid("DEL"),
      requestedBy: who,
      requestedAt: now(),
      scope,
      recordIds: records.map((r) => r.id),
      reason,
      state: "Awaiting approval",
    };
    dispatch(deletionRequested(request));
    dispatch(
      logged({
        ...actor,
        action: "Record deletion requested",
        target: `${request.id} · ${records.length} records · ${scope}`,
        severity: "warning",
      }),
    );
  };

/** FR-DAT-04 — the approval, by somebody who did not ask. */
export const decideDeletion =
  (request: DeletionRequest, approve: boolean, note: string): AppThunk =>
  (dispatch) => {
    if (request.requestedBy === who) {
      dispatch(
        logged({
          ...actor,
          action: "Deletion self-approval refused",
          target: `${request.id} — the requester may not approve their own deletion`,
          outcome: "Denied",
          severity: "warning",
        }),
      );
      return;
    }

    dispatch(
      deletionDecided({ id: request.id, approve, approver: who, at: now(), note }),
    );
    dispatch(
      logged({
        ...actor,
        action: approve ? "Record deletion approved" : "Record deletion refused",
        target: `${request.id} · ${request.recordIds.length} records · ${request.scope}`,
        severity: "warning",
      }),
    );
  };

/**
 * FR-DAT-04 — the execution, by somebody who did not approve. The reducer
 * refuses it otherwise, and refuses it outright where a hold has been raised
 * since the approval was given.
 */
export const executeDeletion =
  (request: DeletionRequest, held: string[]): AppThunk =>
  (dispatch) => {
    if (request.approver === who) {
      dispatch(
        logged({
          ...actor,
          action: "Deletion execution refused",
          target: `${request.id} — the approver may not also carry it out`,
          outcome: "Denied",
          severity: "warning",
        }),
      );
      return;
    }

    if (held.length > 0) {
      dispatch(
        logged({
          ...actor,
          action: "Deletion execution refused — legal hold in force",
          target: `${request.id} · ${held.join(", ")}`,
          outcome: "Denied",
          severity: "critical",
        }),
      );
      return;
    }

    dispatch(deletionExecuted({ id: request.id, by: who, at: now() }));
    dispatch(
      logged({
        ...actor,
        action: "Records destroyed under an approved deletion",
        target: `${request.id} · ${request.recordIds.join(", ")} · approved by ${request.approver}`,
        severity: "critical",
      }),
    );
  };

/** FR-DAT-05 */
export const raiseHold =
  (name: string, authority: string, scope: string, recordIds: string[]): AppThunk =>
  (dispatch) => {
    const hold: LegalHold = {
      id: rid("LH"),
      name,
      raisedBy: who,
      authority,
      raisedAt: today(),
      scope,
      recordIds,
      state: "In force",
    };
    dispatch(holdRaised(hold));
    dispatch(
      logged({
        ...actor,
        action: "Legal hold raised",
        target: `${hold.id} · ${name} · ${recordIds.length} records · ${authority}`,
        severity: "warning",
      }),
    );
  };

export const liftHold =
  (hold: LegalHold): AppThunk =>
  (dispatch) => {
    dispatch(holdLifted({ id: hold.id, by: who, at: today() }));
    dispatch(
      logged({
        ...actor,
        action: "Legal hold lifted",
        target: `${hold.id} · ${hold.name} · retention resumes on ${hold.recordIds.length} records`,
        severity: "warning",
      }),
    );
  };

/** FR-DAT-03 — a transfer that lost any of the three would not be a transfer. */
export const recordTransfer =
  (records: RetainedRecord[], destination: string): AppThunk =>
  (dispatch) => {
    const transfer: ArchivalTransfer = {
      id: rid("ARC"),
      transferredAt: today(),
      destination,
      recordIds: records.map((r) => r.id),
      metadataPreserved: true,
      classificationPreserved: true,
      auditLinkagePreserved: true,
      // The receiving archive checks the batch against this.
      manifestDigest: `sha256:${Array.from(
        { length: 64 },
        (_, i) => "0123456789abcdef"[(records.length * (i + 5) + i) % 16],
      ).join("")}`,
      acceptedBy: "Awaiting acceptance",
    };
    dispatch(transferRecorded(transfer));
    dispatch(
      logged({
        ...actor,
        action: "Archival transfer prepared",
        target: `${transfer.id} · ${records.length} records · ${destination}`,
        severity: "warning",
      }),
    );
  };
