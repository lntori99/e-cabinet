import type { ActionStatus, DecisionOutcome } from "@/models/response/base-response";

/** POST /decisions — record the outcome of an agenda item. */
export interface RecordDecisionRequest {
  meetingId: string;
  agendaItemId: string;
  outcome: DecisionOutcome;
  summary: string;
}

/** PATCH /actions/{actionId}/status — implementation tracker update. */
export interface UpdateActionStatusRequest {
  actionId: string;
  status: ActionStatus;
}
