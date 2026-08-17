/**
 * Meeting and agenda operations — FR-MTG-01 … FR-MTG-14.
 *
 * Timestamps and generated IDs are produced here rather than in reducers,
 * which is what keeps the reducers pure while still giving FR-MTG-09 a
 * complete change history. Each thunk also writes the audit entry its
 * mutation generates, so the log cannot drift from the change.
 */
import { OPERATOR } from "@/core/app-constants";
import type { AppThunk } from "@/core/store";
import { logged } from "@/core/slices/audit-slice";
import {
  agendaItemAdded,
  agendaItemDecided,
  agendaItemMoved,
  agendaItemRemoved,
  agendaItemUpdated,
  attendanceRecorded,
  closedSessionSet,
  created,
  disrupted,
  itemCarriedForward,
  packFrozen,
  participantCapacityChanged,
  participantRemoved,
  participantsAdded,
} from "@/core/slices/meetings-slice";
import { meetingTypeConfig } from "@/data/meetingTypes";
import type {
  AgendaItem,
  Meeting,
  MeetingDisruption,
  MeetingParticipant,
  ParticipantCapacity,
} from "@/models/response/base-response";
import type {
  AddParticipantsRequest,
  CancelMeetingRequest,
  CarryForwardRequest,
  CreateAgendaItemRequest,
  CreateMeetingRequest,
  FreezePackRequest,
  RecordAttendanceRequest,
  SetClosedSessionRequest,
} from "@/models/request/meeting-request";

const actor = { actor: OPERATOR.name, role: OPERATOR.role, ip: OPERATOR.ip };
const stamp = () => ({
  at: new Date().toISOString().slice(0, 16).replace("T", " "),
  by: OPERATOR.name,
});
const rid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/* ---------------------- FR-MTG-01 / 02 / 03 / 04 / 05 / 10 ---------------- */

export const createMeeting =
  (request: CreateMeetingRequest): AppThunk =>
  (dispatch) => {
    const config = meetingTypeConfig(request.type);

    const meeting: Meeting = {
      // The server would mint the ID and the opening status; stand in for both.
      id: `MTG-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      title: request.title,
      type: request.type,
      status: "Submissions Open",
      date: request.date,
      time: request.time,
      durationMinutes: request.durationMinutes,
      venue: request.venue,
      chair: request.chair,
      participants: request.participants,
      agenda: request.standingItems.map((title, i) => ({
        id: rid("AG"),
        order: i + 1,
        section: "Preliminaries",
        title,
        type: "Standing Item" as const,
        ministry: "Office of the President & Cabinet",
        attachments: [],
        closedSession: false,
        closedParticipantIds: [],
        decided: false,
      })),
      submissionDeadline: request.submissionDeadline,
      hybrid: request.hybrid,
      recurrence: request.recurrence,
      seriesId: request.recurrence === "None" ? undefined : rid("SER"),
      history: [],
    };

    dispatch(created({ meeting, ...stamp() }));
    dispatch(
      logged({
        ...actor,
        action: `Meeting created — ${request.type} (defaults: ${config.classificationDefault})`,
        target: meeting.id,
        severity: "info",
      }),
    );
  };

/* -------------------------------- FR-MTG-04 ------------------------------- */

export const addParticipants =
  (request: AddParticipantsRequest): AppThunk =>
  (dispatch) => {
    const participants: MeetingParticipant[] = request.people.map((p) => ({
      id: rid("P"),
      name: p.name,
      ministry: p.ministry,
      roleGroup: p.roleGroup,
      capacity: p.capacity,
      attendance: "Not recorded",
    }));
    dispatch(participantsAdded({ meetingId: request.meetingId, participants, ...stamp() }));
  };

export const changeParticipantCapacity =
  (meetingId: string, participantId: string, capacity: ParticipantCapacity): AppThunk =>
  (dispatch) => {
    dispatch(participantCapacityChanged({ meetingId, participantId, capacity, ...stamp() }));
  };

export const removeMeetingParticipant =
  (meetingId: string, participantId: string): AppThunk =>
  (dispatch) => {
    dispatch(participantRemoved({ meetingId, participantId, ...stamp() }));
  };

/* -------------------------------- FR-MTG-13 ------------------------------- */

export const recordAttendance =
  (request: RecordAttendanceRequest): AppThunk =>
  (dispatch) => {
    dispatch(
      attendanceRecorded({
        meetingId: request.meetingId,
        participantId: request.participantId,
        attendance: request.attendance,
        ...stamp(),
      }),
    );
  };

/* ---------------------------- FR-MTG-06 / 07 / 08 ------------------------- */

export const addAgendaItem =
  (request: CreateAgendaItemRequest): AppThunk =>
  (dispatch) => {
    const item: AgendaItem = {
      id: rid("AG"),
      order: 0, // the store renumbers
      section: request.section,
      title: request.title,
      type: request.type,
      ministry: request.ministry,
      attachments: request.attachments.map((a) => ({ ...a, id: rid("AT") })),
      closedSession: false,
      closedParticipantIds: [],
      decided: false,
    };
    dispatch(agendaItemAdded({ meetingId: request.meetingId, item, ...stamp() }));
    dispatch(
      logged({
        ...actor,
        action: `Agenda item added (${request.type})`,
        target: `${request.meetingId} · ${request.title}`,
        severity: "info",
      }),
    );
  };

export const updateAgendaItem =
  (meetingId: string, item: AgendaItem): AppThunk =>
  (dispatch) => {
    dispatch(agendaItemUpdated({ meetingId, item, ...stamp() }));
  };

export const removeAgendaItem =
  (meetingId: string, itemId: string): AppThunk =>
  (dispatch) => {
    dispatch(agendaItemRemoved({ meetingId, itemId, ...stamp() }));
  };

export const moveAgendaItem =
  (meetingId: string, itemId: string, direction: "up" | "down"): AppThunk =>
  (dispatch) => {
    dispatch(agendaItemMoved({ meetingId, itemId, direction, ...stamp() }));
  };

export const setAgendaItemDecided =
  (meetingId: string, itemId: string, decided: boolean): AppThunk =>
  (dispatch) => {
    dispatch(agendaItemDecided({ meetingId, itemId, decided, ...stamp() }));
  };

/* -------------------------------- FR-MTG-14 ------------------------------- */

export const setClosedSession =
  (request: SetClosedSessionRequest): AppThunk =>
  (dispatch) => {
    dispatch(
      closedSessionSet({
        meetingId: request.meetingId,
        itemId: request.itemId,
        closed: request.closed,
        participantIds: request.participantIds,
        ...stamp(),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: request.closed
          ? "Closed session applied to an agenda item"
          : "Closed session lifted from an agenda item",
        target: `${request.meetingId} · ${request.itemId}`,
        severity: "warning",
      }),
    );
  };

/* -------------------------------- FR-MTG-11 ------------------------------- */

export const carryItemForward =
  (request: CarryForwardRequest): AppThunk =>
  (dispatch) => {
    dispatch(
      itemCarriedForward({
        fromMeetingId: request.fromMeetingId,
        toMeetingId: request.toMeetingId,
        itemId: request.itemId,
        newItemId: rid("AG"),
        ...stamp(),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Undecided item carried forward to ${request.toMeetingId}`,
        target: `${request.fromMeetingId} · ${request.itemId}`,
        severity: "info",
      }),
    );
  };

/* -------------------------------- FR-MTG-12 ------------------------------- */

export const disruptMeeting =
  (request: CancelMeetingRequest): AppThunk =>
  (dispatch) => {
    const disruption: MeetingDisruption = {
      kind: request.kind,
      reason: request.reason,
      at: stamp().at,
      by: OPERATOR.name,
      packHandling: request.packHandling,
      participantsNotified: request.notifyParticipants,
      postponedToDate: request.postponedToDate,
      postponedToTime: request.postponedToTime,
    };
    dispatch(disrupted({ meetingId: request.meetingId, disruption, ...stamp() }));
    dispatch(
      logged({
        ...actor,
        action: `Meeting ${request.kind.toLowerCase()} — packs ${request.packHandling.toLowerCase()}`,
        target: request.meetingId,
        severity: "warning",
      }),
    );
  };

/* ---------------------------- Pack control (FR-PCK) ----------------------- */

export const freezeMeetingPack =
  (request: FreezePackRequest): AppThunk =>
  (dispatch) => {
    dispatch(
      packFrozen({
        meetingId: request.meetingId,
        frozenBy: `${OPERATOR.name} (${OPERATOR.shortRole})`,
        ...stamp(),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: "Cabinet pack frozen",
        target: request.meetingId,
        severity: "info",
      }),
    );
  };
