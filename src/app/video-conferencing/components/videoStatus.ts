import type {
  JoinAuthorisation,
  JoinMode,
  RecordingRecord,
  VideoAttendance,
  VideoEvent,
  VideoSession,
} from "@/models/response/base-response";

export type Tone = "green" | "amber" | "red" | "neutral" | "blue";

export const SESSION_TONE: Record<VideoSession["state"], Tone> = {
  Scheduled: "neutral",
  "Waiting room open": "amber",
  "In progress": "green",
  Ended: "neutral",
  Cancelled: "red",
};

export const ATTENDANCE_TONE: Record<VideoAttendance["state"], Tone> = {
  Admitted: "green",
  "In waiting room": "amber",
  Refused: "red",
  Left: "neutral",
  "Not joined": "neutral",
};

export const AUTHORISATION_TONE: Record<JoinAuthorisation["state"], Tone> = {
  Authorised: "green",
  "Awaiting approval": "amber",
  Declined: "neutral",
  Revoked: "red",
};

/** Held is the resting state; awaiting disposal is the one that wants a hand. */
export const RECORDING_TONE: Record<RecordingRecord["state"], Tone> = {
  Held: "blue",
  "Awaiting disposal": "amber",
  Disposed: "neutral",
};

export const EVENT_TONE: Record<VideoEvent["severity"], Tone> = {
  info: "neutral",
  warning: "amber",
  critical: "red",
};

/**
 * Quality is a judgement about a session, not an identity — so it wears the
 * reserved status steps and never appears without its word beside it.
 */
export const QUALITY_COLOR: Record<VideoSession["qualityRating"], string> = {
  Good: "var(--viz-good)",
  Fair: "var(--viz-warning)",
  Poor: "var(--viz-critical)",
};

export const QUALITY_TONE: Record<VideoSession["qualityRating"], Tone> = {
  Good: "green",
  Fair: "amber",
  Poor: "red",
};

/**
 * In the room, remote and external are three kinds of participation, not three
 * degrees of one — so where they are plotted together they take categorical
 * slots in a fixed order.
 */
export const MODE_COLOR: Record<JoinMode, string> = {
  "In the room": "var(--viz-1)",
  Remote: "var(--viz-2)",
  External: "var(--viz-3)",
};

/** The worst sample in a session, which is what a complaint will be about. */
export function worstLoss(session: VideoSession): number {
  if (session.quality.length === 0) return 0;
  return Math.max(...session.quality.map((q) => q.packetLossPercent));
}

export function meanBitrate(session: VideoSession): number {
  if (session.quality.length === 0) return 0;
  return Math.round(
    session.quality.reduce((sum, q) => sum + q.bitrateKbps, 0) / session.quality.length,
  );
}
