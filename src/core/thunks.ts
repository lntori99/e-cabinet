
import { OPERATOR } from "@/core/app-constants";
import type { AppThunk } from "@/core/store";
import { logged } from "@/core/slices/audit-slice";
import { advanced } from "@/core/slices/documents-slice";
import { actionStatusChanged } from "@/core/slices/decisions-slice";
import { statusChanged as userStatusChanged } from "@/core/slices/users-slice";
import {
  participantRemoved,
  participantUpdated,
  sessionUpdated,
} from "@/core/slices/session-slice";
import type { AdvanceDocumentRequest } from "@/models/request/document-request";
import type { UpdateActionStatusRequest } from "@/models/request/decision-request";
import type { UpdateUserStatusRequest } from "@/models/request/user-request";
import type {
  RemoveParticipantRequest,
  UpdateParticipantRequest,
  UpdateSessionRequest,
} from "@/models/request/session-request";

/** Everything the operator does is attributed to the same session identity. */
const actor = { actor: OPERATOR.name, role: OPERATOR.role, ip: OPERATOR.ip };

export const advanceDocument =
  (request: AdvanceDocumentRequest): AppThunk =>
  (dispatch) => {
    dispatch(advanced({ documentId: request.documentId, toStatus: request.toStatus }));
    dispatch(
      logged({
        ...actor,
        action: `Workflow advanced: ${request.fromStatus} → ${request.toStatus}`,
        target: request.documentId,
        severity: "info",
      }),
    );
  };

/** Tracker updates are routine progress reporting, so they are not logged. */
export const updateActionStatus =
  (request: UpdateActionStatusRequest): AppThunk =>
  (dispatch) => {
    dispatch(actionStatusChanged(request));
  };

export const updateUserStatus =
  (request: UpdateUserStatusRequest & { name: string }): AppThunk =>
  (dispatch) => {
    dispatch(userStatusChanged({ userId: request.userId, status: request.status }));
    dispatch(
      logged({
        ...actor,
        action: `Account ${request.status.toLowerCase()}`,
        target: `${request.name} (${request.userId})`,
        severity: "warning",
      }),
    );
  };

export const updateSession =
  (request: UpdateSessionRequest): AppThunk =>
  (dispatch) => {
    dispatch(sessionUpdated(request));
  };

export const updateParticipant =
  (request: UpdateParticipantRequest): AppThunk =>
  (dispatch) => {
    dispatch(participantUpdated(request));
  };

export const removeParticipant =
  (request: RemoveParticipantRequest): AppThunk =>
  (dispatch) => {
    dispatch(participantRemoved(request.participant));
    dispatch(
      logged({
        ...actor,
        action: "Participant removed from secure session",
        target: request.participant,
        severity: "warning",
      }),
    );
  };
