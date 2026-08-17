import type {
  AgendaItemType,
  AttachmentKind,
  AttendanceMode,
  MeetingDisruption,
  MeetingParticipant,
  MeetingType,
  ParticipantCapacity,
  Recurrence,
} from "@/models/response/base-response";

/** POST /meetings — FR-MTG-01, 02, 03, 04, 05, 10. */
export interface CreateMeetingRequest {
  title: string;
  type: MeetingType;
  chair: string;
  /** ISO date, e.g. 2026-09-04 */
  date: string;
  /** 24-hour start time, e.g. 09:00 */
  time: string;
  /** FR-MTG-03 — expected duration in minutes. */
  durationMinutes: number;
  venue: string;
  /** FR-MTG-05 — ISO datetime after which papers can no longer be submitted. */
  submissionDeadline: string;
  hybrid: boolean;
  /** FR-MTG-10 — anything other than None opens a series. */
  recurrence: Recurrence;
  /** FR-MTG-04 — resolved from individuals and/or role groups. */
  participants: MeetingParticipant[];
  /** FR-MTG-10 — standing items seeded onto the sitting. */
  standingItems: string[];
}

/** POST /meetings/{meetingId}/participants — FR-MTG-04. */
export interface AddParticipantsRequest {
  meetingId: string;
  people: {
    name: string;
    ministry: string;
    roleGroup: string;
    capacity: ParticipantCapacity;
  }[];
}

/** PATCH /meetings/{meetingId}/participants/{participantId}/attendance — FR-MTG-13. */
export interface RecordAttendanceRequest {
  meetingId: string;
  participantId: string;
  attendance: AttendanceMode;
}

/** POST /meetings/{meetingId}/agenda — FR-MTG-06, 07, 08. */
export interface CreateAgendaItemRequest {
  meetingId: string;
  section: string;
  title: string;
  type: AgendaItemType;
  ministry: string;
  attachments: { kind: AttachmentKind; title: string }[];
}

/** PATCH /meetings/{meetingId}/agenda/{itemId}/closed-session — FR-MTG-14. */
export interface SetClosedSessionRequest {
  meetingId: string;
  itemId: string;
  closed: boolean;
  /** Necessarily narrower than the meeting's own participant list. */
  participantIds: string[];
}

/** POST /meetings/{toMeetingId}/agenda/carry-forward — FR-MTG-11. */
export interface CarryForwardRequest {
  fromMeetingId: string;
  toMeetingId: string;
  itemId: string;
}

/** POST /meetings/{meetingId}/cancel — FR-MTG-12. */
export interface CancelMeetingRequest {
  meetingId: string;
  kind: MeetingDisruption["kind"];
  reason: string;
  packHandling: MeetingDisruption["packHandling"];
  notifyParticipants: boolean;
  postponedToDate?: string;
  postponedToTime?: string;
}

/**
 * POST /meetings/{meetingId}/pack/freeze — lock the pack for release.
 * After this, changes require a formal replacement version with documented
 * approval, so it is deliberately its own endpoint rather than a status patch.
 */
export interface FreezePackRequest {
  meetingId: string;
}
