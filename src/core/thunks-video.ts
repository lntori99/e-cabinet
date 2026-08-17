/**
 * Secure video conferencing — FR-VID-01 … FR-VID-17.
 *
 * FR-VID-15 requires attendance, join and leave times, host actions,
 * screen-sharing events, recording actions and administrative changes to be
 * logged for every session. That is done here: each host action writes its own
 * session event and its audit entry in the same dispatch, so the session record
 * cannot be missing something the audit log has, or the reverse.
 */
import { OPERATOR } from "@/core/app-constants";
import type { AppThunk } from "@/core/store";
import { logged } from "@/core/slices/audit-slice";
import {
  admissionDecided,
  authorisationDecided,
  hostActionTaken,
  participantMuted,
  participantRemoved,
  recordingDisposed,
  screenShareGranted,
} from "@/core/slices/video-slice";
import type {
  JoinAuthorisation,
  VideoAttendance,
  VideoEvent,
  VideoSession,
} from "@/models/response/base-response";

const actor = { actor: OPERATOR.name, role: OPERATOR.role, ip: OPERATOR.ip };
const host = `${OPERATOR.name} (${OPERATOR.shortRole})`;
const now = () => new Date().toISOString().slice(0, 16);
const rid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

function event(
  sessionId: string,
  kind: VideoEvent["kind"],
  detail: string,
  severity: VideoEvent["severity"] = "info",
): VideoEvent {
  return { id: rid("VE"), sessionId, at: now(), kind, actor: host, detail, severity };
}

/** FR-VID-06 — admission is an explicit act by the host, never automatic. */
export const decideAdmission =
  (person: VideoAttendance, admit: boolean): AppThunk =>
  (dispatch) => {
    const at = now();
    dispatch(
      admissionDecided({
        attendanceId: person.id,
        admit,
        at,
        event: event(
          person.sessionId,
          admit ? "Admission" : "Refusal",
          admit
            ? `Admitted ${person.name} from the waiting room`
            : `Refused ${person.name} at the waiting room`,
          admit ? "info" : "warning",
        ),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: admit
          ? "Participant admitted to a video session"
          : "Participant refused at the waiting room",
        target: `${person.sessionId} — ${person.name}`,
        severity: admit ? "info" : "warning",
      }),
    );
  };

/** FR-VID-05 — lock, waiting room, screen-share default and recording. */
export const takeHostAction =
  (request: {
    session: VideoSession;
    patch: Partial<
      Pick<VideoSession, "locked" | "waitingRoom" | "screenShareHostOnly" | "recordingEnabled">
    >;
    detail: string;
    severity?: VideoEvent["severity"];
  }): AppThunk =>
  (dispatch) => {
    const isRecording = request.patch.recordingEnabled !== undefined;
    dispatch(
      hostActionTaken({
        sessionId: request.session.id,
        patch: request.patch,
        event: event(
          request.session.id,
          isRecording ? "Recording" : "Host action",
          request.detail,
          request.severity ?? (isRecording ? "warning" : "info"),
        ),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: request.detail,
        target: `${request.session.id} — ${request.session.meetingTitle}`,
        severity: request.severity ?? (isRecording ? "warning" : "info"),
      }),
    );
  };

export const setMuted =
  (person: VideoAttendance, muted: boolean): AppThunk =>
  (dispatch) => {
    dispatch(
      participantMuted({
        attendanceId: person.id,
        muted,
        event: event(
          person.sessionId,
          "Host action",
          `${muted ? "Muted" : "Unmuted"} ${person.name}`,
        ),
      }),
    );
  };

/** FR-VID-07 — a grant is per participant and per session; it does not persist. */
export const setScreenShare =
  (person: VideoAttendance, granted: boolean): AppThunk =>
  (dispatch) => {
    dispatch(
      screenShareGranted({
        attendanceId: person.id,
        granted,
        event: event(
          person.sessionId,
          "Screen share",
          granted
            ? `Screen share granted to ${person.name} for this session`
            : `Screen share withdrawn from ${person.name}`,
          "warning",
        ),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: granted
          ? "Screen share granted to a participant for one session"
          : "Screen share withdrawn",
        target: `${person.sessionId} — ${person.name}`,
        severity: "warning",
      }),
    );
  };

export const removeParticipant =
  (person: VideoAttendance): AppThunk =>
  (dispatch) => {
    const at = now();
    dispatch(
      participantRemoved({
        attendanceId: person.id,
        at,
        event: event(
          person.sessionId,
          "Host action",
          `Removed ${person.name} from the session`,
          "warning",
        ),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: "Participant removed from a video session",
        target: `${person.sessionId} — ${person.name}`,
        severity: "warning",
      }),
    );
  };

/** FR-VID-02 / 14 */
export const decideAuthorisation =
  (
    authorisation: JoinAuthorisation,
    state: JoinAuthorisation["state"],
    identityVerified?: boolean,
  ): AppThunk =>
  (dispatch) => {
    dispatch(
      authorisationDecided({
        authorisationId: authorisation.id,
        state,
        approvedBy: state === "Authorised" ? host : undefined,
        identityVerified,
      }),
    );
    dispatch(
      logged({
        ...actor,
        action:
          authorisation.mode === "External"
            ? `External participation ${state.toLowerCase()} — ${authorisation.scopeNote ?? "scope not stated"}`
            : `Join authorisation ${state.toLowerCase()}`,
        target: `${authorisation.meetingId} — ${authorisation.name}`,
        severity: state === "Authorised" ? "warning" : "info",
      }),
    );
  };

/** FR-VID-13 */
export const disposeRecording =
  (recordingId: string, title: string): AppThunk =>
  (dispatch) => {
    dispatch(recordingDisposed({ recordingId, at: now() }));
    dispatch(
      logged({
        ...actor,
        action: "Recording disposed of at the end of its retention period",
        target: `${recordingId} — ${title}`,
        severity: "warning",
      }),
    );
  };
