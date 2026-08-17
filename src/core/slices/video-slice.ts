import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  seedAttendance,
  seedAuthorisations,
  seedRecordings,
  seedVideoEvents,
  seedVideoSessions,
} from "@/data/video";
import type {
  JoinAuthorisation,
  RecordingRecord,
  VideoAttendance,
  VideoEvent,
  VideoSession,
} from "@/models/response/base-response";
import type { RootState } from "@/core/store";

interface VideoState {
  sessions: VideoSession[];
  authorisations: JoinAuthorisation[];
  attendance: VideoAttendance[];
  events: VideoEvent[];
  recordings: RecordingRecord[];
}

const initialState: VideoState = {
  sessions: seedVideoSessions,
  authorisations: seedAuthorisations,
  attendance: seedAttendance,
  events: seedVideoEvents,
  recordings: seedRecordings,
};

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    /** FR-VID-06 — nobody reaches a Cabinet session without the host admitting them. */
    admissionDecided(
      state,
      action: PayloadAction<{
        attendanceId: string;
        admit: boolean;
        at: string;
        event: VideoEvent;
      }>,
    ) {
      const person = state.attendance.find((a) => a.id === action.payload.attendanceId);
      if (!person) return;
      person.state = action.payload.admit ? "Admitted" : "Refused";
      if (action.payload.admit) person.joinedAt = action.payload.at;
      state.events.unshift(action.payload.event);
    },

    /** FR-VID-05 */
    hostActionTaken(
      state,
      action: PayloadAction<{
        sessionId: string;
        patch: Partial<Pick<VideoSession, "locked" | "waitingRoom" | "screenShareHostOnly" | "recordingEnabled">>;
        event: VideoEvent;
      }>,
    ) {
      const session = state.sessions.find((s) => s.id === action.payload.sessionId);
      if (!session) return;
      Object.assign(session, action.payload.patch);
      state.events.unshift(action.payload.event);
    },

    participantMuted(
      state,
      action: PayloadAction<{ attendanceId: string; muted: boolean; event: VideoEvent }>,
    ) {
      const person = state.attendance.find((a) => a.id === action.payload.attendanceId);
      if (!person) return;
      person.muted = action.payload.muted;
      state.events.unshift(action.payload.event);
    },

    /** FR-VID-07 — granted per participant, per session, never by default. */
    screenShareGranted(
      state,
      action: PayloadAction<{ attendanceId: string; granted: boolean; event: VideoEvent }>,
    ) {
      const person = state.attendance.find((a) => a.id === action.payload.attendanceId);
      if (!person) return;
      person.screenShareGranted = action.payload.granted;
      state.events.unshift(action.payload.event);
    },

    participantRemoved(
      state,
      action: PayloadAction<{ attendanceId: string; at: string; event: VideoEvent }>,
    ) {
      const person = state.attendance.find((a) => a.id === action.payload.attendanceId);
      if (!person) return;
      person.state = "Left";
      person.leftAt = action.payload.at;
      state.events.unshift(action.payload.event);
    },

    /** FR-VID-02 / 14 */
    authorisationDecided(
      state,
      action: PayloadAction<{
        authorisationId: string;
        state: JoinAuthorisation["state"];
        approvedBy?: string;
        identityVerified?: boolean;
      }>,
    ) {
      const authorisation = state.authorisations.find(
        (a) => a.id === action.payload.authorisationId,
      );
      if (!authorisation) return;
      authorisation.state = action.payload.state;
      if (action.payload.approvedBy) authorisation.approvedBy = action.payload.approvedBy;
      if (action.payload.identityVerified !== undefined) {
        authorisation.identityVerified = action.payload.identityVerified;
      }
    },

    /** FR-VID-13 */
    recordingDisposed(
      state,
      action: PayloadAction<{ recordingId: string; at: string }>,
    ) {
      const recording = state.recordings.find((r) => r.id === action.payload.recordingId);
      if (!recording) return;
      recording.state = "Disposed";
      recording.disposedAt = action.payload.at;
    },
  },
});

export const {
  admissionDecided,
  hostActionTaken,
  participantMuted,
  screenShareGranted,
  participantRemoved,
  authorisationDecided,
  recordingDisposed,
} = videoSlice.actions;

export default videoSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectVideoSessions = (s: RootState) => s.video.sessions;
export const selectAuthorisations = (s: RootState) => s.video.authorisations;
export const selectAttendance = (s: RootState) => s.video.attendance;
export const selectVideoEvents = (s: RootState) => s.video.events;
export const selectRecordings = (s: RootState) => s.video.recordings;

export const selectLiveVideoSessions = createSelector([selectVideoSessions], (sessions) =>
  sessions.filter((s) => s.state === "In progress" || s.state === "Waiting room open"),
);

export const selectScheduledSessions = createSelector([selectVideoSessions], (sessions) =>
  sessions
    .filter((s) => s.state === "Scheduled" || s.state === "Waiting room open")
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor)),
);

/** FR-VID-14 — external joins waiting on a decision. */
export const selectPendingExternals = createSelector([selectAuthorisations], (list) =>
  list.filter((a) => a.mode === "External" && a.state === "Awaiting approval"),
);

/** FR-VID-06 — people held at the door right now. */
export const selectWaitingRoom = createSelector([selectAttendance], (attendance) =>
  attendance.filter((a) => a.state === "In waiting room"),
);

/** FR-VID-09 — sessions whose quality was not good. */
export const selectQualityAlerts = createSelector([selectVideoSessions], (sessions) =>
  sessions.filter((s) => s.qualityRating !== "Good" && s.quality.length > 0),
);

export const selectSessionAttendance = (sessionId: string) =>
  createSelector([selectAttendance], (attendance) =>
    attendance.filter((a) => a.sessionId === sessionId),
  );

export const selectSessionEvents = (sessionId: string) =>
  createSelector([selectVideoEvents], (events) =>
    [...events]
      .filter((e) => e.sessionId === sessionId)
      .sort((a, b) => a.at.localeCompare(b.at)),
  );
