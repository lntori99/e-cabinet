/** PATCH /sessions/{sessionId} — host controls for the session itself. */
export interface UpdateSessionRequest {
  /** Locked meetings admit no further participants. */
  locked?: boolean;
  /** Whether the frozen pack is being presented to the room. */
  presentingPack?: boolean;
}

/** PATCH /sessions/{sessionId}/participants/{participant} — host control over one attendee. */
export interface UpdateParticipantRequest {
  participant: string;
  muted?: boolean;
  video?: boolean;
}

/** DELETE /sessions/{sessionId}/participants/{participant} — remove an attendee mid-session. */
export interface RemoveParticipantRequest {
  participant: string;
  /** Recorded against the audit entry the removal generates. */
  reason?: string;
}
