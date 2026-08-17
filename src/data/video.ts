import type {
  JoinAuthorisation,
  QualitySample,
  RecordingPolicy,
  RecordingRecord,
  RoomMedia,
  VideoAttendance,
  VideoEvent,
  VideoSession,
} from "@/models/response/base-response";

/**
 * FR VID seed state.
 *
 * Two rules shape all of it. FR-VID-02: possession of a link is never enough —
 * every join is checked against a named, meeting-specific authorisation. And
 * FR-VID-04: being in the session confers no document permission whatsoever;
 * what a participant can read is decided by their entitlements and nothing else.
 */

/** A plausible quality curve — settles after the join storm, dips, recovers. */
function curve(seed: number[]): QualitySample[] {
  return seed.map((loss, index) => ({
    minute: index * 10,
    bitrateKbps: Math.round(2400 - loss * 420 + (index % 3) * 40),
    packetLossPercent: loss,
    latencyMs: Math.round(48 + loss * 26),
  }));
}

export const seedVideoSessions: VideoSession[] = [
  {
    id: "VS-2026-0141",
    meetingId: "MTG-2026-014",
    meetingTitle: "14th Ordinary Cabinet Sitting",
    roomId: "ROOM-CAB",
    host: "Larry (Secretariat)",
    state: "Waiting room open",
    scheduledFor: "2026-08-18T09:00",
    locked: false,
    waitingRoom: true,
    screenShareHostOnly: true,
    presentingPackId: "PCK-2026-014-A",
    recordingEnabled: false,
    quality: [],
    qualityRating: "Good",
    breakoutRooms: [],
  },
  {
    id: "VS-2026-0142",
    meetingId: "MTG-2026-015",
    meetingTitle: "Economic Affairs Committee",
    roomId: "ROOM-CMB",
    host: "Larry (Secretariat)",
    state: "In progress",
    scheduledFor: "2026-08-15T09:00",
    startedAt: "2026-08-15T08:58",
    locked: true,
    waitingRoom: true,
    screenShareHostOnly: true,
    presentingPackId: "PCK-2026-015-A",
    recordingEnabled: true,
    recordingApproval: "Committee chair, minuted — OPC/SEC/2026/126",
    quality: curve([0.2, 0.4, 1.9, 3.4, 1.1, 0.5]),
    qualityRating: "Fair",
    breakoutRooms: [
      { id: "BR-1", name: "Budget sub-group", participants: ["Secretary to Treasury", "Director of Budget"] },
    ],
  },
  {
    id: "VS-2026-0139",
    meetingId: "MTG-2026-013",
    meetingTitle: "13th Ordinary Cabinet Sitting",
    roomId: "ROOM-CAB",
    host: "Larry (Secretariat)",
    state: "Ended",
    scheduledFor: "2026-08-04T09:00",
    startedAt: "2026-08-04T08:56",
    endedAt: "2026-08-04T12:38",
    locked: true,
    waitingRoom: true,
    screenShareHostOnly: true,
    presentingPackId: "PCK-2026-013-A",
    recordingEnabled: false,
    quality: curve([0.1, 0.3, 0.2, 0.6, 0.2, 0.1, 0.3]),
    qualityRating: "Good",
    breakoutRooms: [],
  },
  {
    id: "VS-2026-0138",
    meetingId: "MTG-2026-013",
    meetingTitle: "Presidency Security Briefing — preparatory call",
    roomId: "ROOM-SH",
    host: "Larry (Secretariat)",
    state: "Ended",
    scheduledFor: "2026-08-02T14:00",
    startedAt: "2026-08-02T14:03",
    endedAt: "2026-08-02T15:10",
    locked: true,
    waitingRoom: true,
    screenShareHostOnly: true,
    recordingEnabled: false,
    quality: curve([2.8, 4.6, 5.2, 3.9, 2.1]),
    qualityRating: "Poor",
    breakoutRooms: [],
  },
];

/** FR-VID-02 / 03 / 14 */
export const seedAuthorisations: JoinAuthorisation[] = [
  { id: "JA-101", sessionId: "VS-2026-0141", meetingId: "MTG-2026-014", name: "Hon. Minister of Finance", role: "Cabinet Member", mode: "Remote", mfaRequired: true, mfaMethod: "FIDO2 key", state: "Authorised" },
  { id: "JA-102", sessionId: "VS-2026-0141", meetingId: "MTG-2026-014", name: "Hon. Minister of Health", role: "Cabinet Member", mode: "Remote", mfaRequired: true, mfaMethod: "FIDO2 key", state: "Authorised" },
  { id: "JA-103", sessionId: "VS-2026-0141", meetingId: "MTG-2026-014", name: "Hon. Minister of Justice", role: "Cabinet Member", mode: "In the room", mfaRequired: false, state: "Authorised" },
  { id: "JA-104", sessionId: "VS-2026-0141", meetingId: "MTG-2026-014", name: "Chief Secretary", role: "Secretariat", mode: "In the room", mfaRequired: false, state: "Authorised" },
  { id: "JA-105", sessionId: "VS-2026-0141", meetingId: "MTG-2026-014", name: "Secretary to Cabinet", role: "Secretariat", mode: "In the room", mfaRequired: false, state: "Authorised" },
  { id: "JA-106", sessionId: "VS-2026-0141", meetingId: "MTG-2026-014", name: "Hon. Minister of Education", role: "Cabinet Member", mode: "Remote", mfaRequired: true, mfaMethod: "Authenticator", state: "Revoked" },
  {
    id: "JA-107",
    sessionId: "VS-2026-0141",
    meetingId: "MTG-2026-014",
    name: "SADC Secretariat — legal adviser",
    role: "External Participant",
    mode: "External",
    mfaRequired: true,
    approvedBy: "Awaiting Secretary to Cabinet",
    scopeNote: "Item 5 only — Regional Diplomatic Positions. Admitted for that item and removed afterwards.",
    identityVerified: false,
    state: "Awaiting approval",
  },
  { id: "JA-110", sessionId: "VS-2026-0142", meetingId: "MTG-2026-015", name: "Hon. Minister of Finance", role: "Cabinet Member", mode: "In the room", mfaRequired: false, state: "Authorised" },
  { id: "JA-111", sessionId: "VS-2026-0142", meetingId: "MTG-2026-015", name: "Hon. Minister of Agriculture", role: "Cabinet Member", mode: "Remote", mfaRequired: true, mfaMethod: "FIDO2 key", state: "Authorised" },
  { id: "JA-112", sessionId: "VS-2026-0142", meetingId: "MTG-2026-015", name: "Secretary to Treasury", role: "Cabinet Member", mode: "Remote", mfaRequired: true, mfaMethod: "Authenticator", state: "Authorised" },
  {
    id: "JA-113",
    sessionId: "VS-2026-0142",
    meetingId: "MTG-2026-015",
    name: "Reserve Bank — Deputy Governor",
    role: "External Participant",
    mode: "External",
    mfaRequired: true,
    approvedBy: "Secretary to Cabinet",
    scopeNote: "Mid-year budget item only. Identity verified against the Reserve Bank directory on 13 August.",
    identityVerified: true,
    state: "Authorised",
  },
];

/** FR-VID-05 / 06 / 16 */
export const seedAttendance: VideoAttendance[] = [
  { id: "AT-201", sessionId: "VS-2026-0142", name: "Hon. Minister of Finance", role: "Cabinet Member", mode: "In the room", state: "Admitted", joinedAt: "2026-08-15T08:58", muted: false, screenShareGranted: false },
  { id: "AT-202", sessionId: "VS-2026-0142", name: "Hon. Minister of Agriculture", role: "Cabinet Member", mode: "Remote", state: "Admitted", joinedAt: "2026-08-15T09:01", muted: true, screenShareGranted: false, mfaMethod: "FIDO2 key" },
  { id: "AT-203", sessionId: "VS-2026-0142", name: "Secretary to Treasury", role: "Cabinet Member", mode: "Remote", state: "Admitted", joinedAt: "2026-08-15T09:02", muted: true, screenShareGranted: true, mfaMethod: "Authenticator" },
  { id: "AT-204", sessionId: "VS-2026-0142", name: "Reserve Bank — Deputy Governor", role: "External Participant", mode: "External", state: "In waiting room", muted: true, screenShareGranted: false, mfaMethod: "Authenticator" },
  { id: "AT-205", sessionId: "VS-2026-0142", name: "Director of Budget", role: "Cabinet Member", mode: "Remote", state: "Refused", muted: true, screenShareGranted: false },

  { id: "AT-301", sessionId: "VS-2026-0139", name: "Hon. Minister of Finance", role: "Cabinet Member", mode: "In the room", state: "Left", joinedAt: "2026-08-04T08:56", leftAt: "2026-08-04T12:38", muted: false, screenShareGranted: false },
  { id: "AT-302", sessionId: "VS-2026-0139", name: "Chief Secretary", role: "Secretariat", mode: "In the room", state: "Left", joinedAt: "2026-08-04T08:55", leftAt: "2026-08-04T12:38", muted: false, screenShareGranted: false },
  { id: "AT-303", sessionId: "VS-2026-0139", name: "Hon. Minister of Health", role: "Cabinet Member", mode: "Remote", state: "Left", joinedAt: "2026-08-04T09:04", leftAt: "2026-08-04T12:30", muted: true, screenShareGranted: false, mfaMethod: "FIDO2 key" },
];

/** FR-VID-15 */
export const seedVideoEvents: VideoEvent[] = [
  { id: "VE-401", sessionId: "VS-2026-0142", at: "2026-08-15T08:58", kind: "Join", actor: "Larry (Secretariat)", detail: "Host started the session; waiting room open", severity: "info" },
  { id: "VE-402", sessionId: "VS-2026-0142", at: "2026-08-15T09:01", kind: "Admission", actor: "Larry (Secretariat)", detail: "Admitted Hon. Minister of Agriculture from the waiting room", severity: "info" },
  { id: "VE-403", sessionId: "VS-2026-0142", at: "2026-08-15T09:02", kind: "Admission", actor: "Larry (Secretariat)", detail: "Admitted Secretary to Treasury from the waiting room", severity: "info" },
  { id: "VE-404", sessionId: "VS-2026-0142", at: "2026-08-15T09:05", kind: "Refusal", actor: "Larry (Secretariat)", detail: "Refused Director of Budget — not on the authorisation list for this meeting", severity: "warning" },
  { id: "VE-405", sessionId: "VS-2026-0142", at: "2026-08-15T09:06", kind: "Host action", actor: "Larry (Secretariat)", detail: "Meeting locked; no further admissions without unlocking", severity: "info" },
  { id: "VE-406", sessionId: "VS-2026-0142", at: "2026-08-15T09:12", kind: "Recording", actor: "Larry (Secretariat)", detail: "Recording started on the chair's minuted approval; all participants notified on screen", severity: "warning" },
  { id: "VE-407", sessionId: "VS-2026-0142", at: "2026-08-15T09:24", kind: "Screen share", actor: "Larry (Secretariat)", detail: "Screen share granted to Secretary to Treasury for this session", severity: "warning" },
  { id: "VE-408", sessionId: "VS-2026-0142", at: "2026-08-15T09:31", kind: "Administrative change", actor: "System", detail: "Adaptive bitrate stepped down to 1,020 kbps — packet loss above three per cent on the Agriculture link", severity: "warning" },

  { id: "VE-501", sessionId: "VS-2026-0139", at: "2026-08-04T08:55", kind: "Join", actor: "Larry (Secretariat)", detail: "Host started the session", severity: "info" },
  { id: "VE-502", sessionId: "VS-2026-0139", at: "2026-08-04T09:06", kind: "Host action", actor: "Larry (Secretariat)", detail: "Meeting locked after the last authorised participant was admitted", severity: "info" },
  { id: "VE-503", sessionId: "VS-2026-0139", at: "2026-08-04T12:38", kind: "Leave", actor: "Larry (Secretariat)", detail: "Session ended by the host", severity: "info" },
];

/** FR-VID-11 / 12 */
export const RECORDING_POLICY: RecordingPolicy = {
  enabledByDefault: false,
  storageLocation: "Lilongwe production, encrypted store — replicated to Blantyre",
  retentionDays: 90,
  authorisationPath: [
    "Meeting chair — written request, minuted",
    "Secretary to Cabinet — approval",
    "Secretariat — enables recording on the session",
  ],
  accessRights:
    "The chair, the Secretariat and Security & Audit. No participant may download a recording.",
  approvedBy: "Secretary to Cabinet",
  approvedAt: "2026-05-04",
  participantNotice:
    "This session is being recorded. The notice stays on every screen for as long as recording continues.",
};

/** FR-VID-13 — Release 2. */
export const seedRecordings: RecordingRecord[] = [
  {
    id: "REC-2026-0142",
    sessionId: "VS-2026-0142",
    meetingTitle: "Economic Affairs Committee",
    recordedAt: "2026-08-15T09:12",
    durationMinutes: 0,
    classification: "SECRET",
    storageLocation: "Lilongwe production, encrypted store",
    retainUntil: "2026-11-13",
    accessGrantedTo: ["Committee chair", "Secretariat", "Security / Audit"],
    state: "Held",
  },
  {
    id: "REC-2026-0121",
    sessionId: "VS-2026-0121",
    meetingTitle: "Economic Affairs Committee — March working session",
    recordedAt: "2026-03-19T14:05",
    durationMinutes: 96,
    classification: "SECRET",
    storageLocation: "Lilongwe production, encrypted store",
    // Past its retention date and still held — the finding the page is for.
    retainUntil: "2026-06-17",
    accessGrantedTo: ["Committee chair", "Secretariat"],
    state: "Awaiting disposal",
  },
  {
    id: "REC-2026-0104",
    sessionId: "VS-2026-0104",
    meetingTitle: "Inter-Ministerial Briefing — April",
    recordedAt: "2026-04-02T10:00",
    durationMinutes: 74,
    classification: "CONFIDENTIAL",
    storageLocation: "Lilongwe production, encrypted store",
    retainUntil: "2026-07-01",
    accessGrantedTo: ["Secretariat"],
    state: "Disposed",
    disposedAt: "2026-07-02",
  },
];

/** FR-VID-10 */
export const seedRoomMedia: RoomMedia[] = [
  {
    roomId: "ROOM-CAB",
    camera: "IMAGO PTZ 4K, ceiling mounted",
    ptz: true,
    presets: ["Wide — full table", "Chair", "Presenter podium", "Officials bench"],
    microphones: "Beamforming ceiling array, 4 zones",
    dsp: "IMAGO DSP — echo cancellation, noise suppression, automatic gain",
    speakers: "Distributed ceiling, 8 zones",
    echoCancellation: true,
    lastCalibrated: "2026-08-01",
  },
  {
    roomId: "ROOM-CMB",
    camera: "IMAGO PTZ 4K, wall mounted",
    ptz: true,
    presets: ["Wide — committee table", "Chair", "Screen"],
    microphones: "Boundary array, 6 units",
    dsp: "IMAGO DSP — echo cancellation, noise suppression",
    speakers: "Soundbar, stereo",
    echoCancellation: true,
    lastCalibrated: "2026-07-18",
  },
  {
    roomId: "ROOM-SH",
    camera: "IMAGO PTZ 4K, wall mounted",
    ptz: true,
    presets: ["Wide", "Speaker"],
    microphones: "Table microphone, 2 units",
    dsp: "Integrated DSP",
    speakers: "Soundbar, stereo",
    echoCancellation: true,
    lastCalibrated: "2026-08-12",
  },
];
