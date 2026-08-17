import { createSlice, createSelector, type PayloadAction } from "@reduxjs/toolkit";
import { seedMeetings } from "@/data/ecabinet";
import type {
  AgendaItem,
  AttendanceMode,
  Meeting,
  MeetingDisruption,
  MeetingParticipant,
  ParticipantCapacity,
} from "@/models/response/base-response";
import type { RootState } from "@/core/store";

/** Every mutation carries who did it and when, for the change history. */
interface Stamp {
  at: string;
  by: string;
}

interface MeetingsState {
  items: Meeting[];
  selectedId: string | null;
  creating: boolean;
  statusFilter: string;
}

/**
 * FR-MTG-06 — order is derived, never authored. Items stay grouped by section
 * (in the order sections first appear) and are renumbered 1..n across the whole
 * agenda, so inserting, moving or removing never leaves a gap.
 */
function renumber(agenda: AgendaItem[]): AgendaItem[] {
  const sections: string[] = [];
  for (const item of agenda) {
    if (!sections.includes(item.section)) sections.push(item.section);
  }
  return sections
    .flatMap((section) => agenda.filter((i) => i.section === section))
    .map((item, index) => ({ ...item, order: index + 1 }));
}

const initialState: MeetingsState = {
  // Normalised on load, not just on mutation: the FR-MTG-06 invariant is that
  // the agenda is grouped into sections and numbered 1..n in the order it is
  // read. Seed data (and any future API payload) is not guaranteed to arrive
  // that way, and without this the numbers render out of sequence.
  items: seedMeetings.map((m) => ({ ...m, agenda: renumber(m.agenda) })),
  selectedId: seedMeetings[0]?.id ?? null,
  creating: false,
  statusFilter: "All",
};


const find = (state: MeetingsState, id: string) => state.items.find((m) => m.id === id);

function note(meeting: Meeting, stamp: Stamp, summary: string) {
  meeting.history.unshift({
    id: `H-${meeting.id}-${meeting.history.length + 1}`,
    at: stamp.at,
    by: stamp.by,
    summary,
  });
}

const meetingsSlice = createSlice({
  name: "meetings",
  initialState,
  reducers: {
    /* -------------------- FR-MTG-01 / 03 / 10 — creation -------------------- */
    created(state, action: PayloadAction<{ meeting: Meeting } & Stamp>) {
      state.items.unshift(action.payload.meeting);
      state.selectedId = action.payload.meeting.id;
      note(
        state.items[0],
        action.payload,
        `Meeting created — ${action.payload.meeting.type}, submissions open`,
      );
    },

    /* ------------------------- FR-MTG-04 — participants ------------------------ */
    participantsAdded(
      state,
      action: PayloadAction<{ meetingId: string; participants: MeetingParticipant[] } & Stamp>,
    ) {
      const m = find(state, action.payload.meetingId);
      if (!m) return;
      const fresh = action.payload.participants.filter(
        (p) => !m.participants.some((x) => x.name === p.name),
      );
      if (!fresh.length) return;
      m.participants.push(...fresh);
      note(
        m,
        action.payload,
        `${fresh.length} participant${fresh.length === 1 ? "" : "s"} added: ${fresh.map((p) => p.name).join(", ")}`,
      );
    },
    participantCapacityChanged(
      state,
      action: PayloadAction<
        { meetingId: string; participantId: string; capacity: ParticipantCapacity } & Stamp
      >,
    ) {
      const m = find(state, action.payload.meetingId);
      const p = m?.participants.find((x) => x.id === action.payload.participantId);
      if (!m || !p) return;
      p.capacity = action.payload.capacity;
      note(m, action.payload, `${p.name} recorded as ${action.payload.capacity}`);
    },
    participantRemoved(
      state,
      action: PayloadAction<{ meetingId: string; participantId: string } & Stamp>,
    ) {
      const m = find(state, action.payload.meetingId);
      const p = m?.participants.find((x) => x.id === action.payload.participantId);
      if (!m || !p) return;
      m.participants = m.participants.filter((x) => x.id !== p.id);
      // Also drop them from any closed session they had been admitted to.
      m.agenda.forEach((item) => {
        item.closedParticipantIds = item.closedParticipantIds.filter((id) => id !== p.id);
      });
      note(m, action.payload, `${p.name} removed from the participant list`);
    },

    /* -------------------------- FR-MTG-13 — attendance ------------------------- */
    attendanceRecorded(
      state,
      action: PayloadAction<
        { meetingId: string; participantId: string; attendance: AttendanceMode } & Stamp
      >,
    ) {
      const m = find(state, action.payload.meetingId);
      const p = m?.participants.find((x) => x.id === action.payload.participantId);
      if (!m || !p) return;
      p.attendance = action.payload.attendance;
      note(m, action.payload, `Attendance for ${p.name}: ${action.payload.attendance}`);
    },

    /* ----------------------- FR-MTG-06 / 07 / 08 — agenda ---------------------- */
    agendaItemAdded(
      state,
      action: PayloadAction<{ meetingId: string; item: AgendaItem } & Stamp>,
    ) {
      const m = find(state, action.payload.meetingId);
      if (!m) return;
      m.agenda = renumber([...m.agenda, action.payload.item]);
      note(m, action.payload, `Agenda item added: ${action.payload.item.title}`);
    },
    agendaItemUpdated(
      state,
      action: PayloadAction<{ meetingId: string; item: AgendaItem } & Stamp>,
    ) {
      const m = find(state, action.payload.meetingId);
      if (!m) return;
      m.agenda = renumber(
        m.agenda.map((i) => (i.id === action.payload.item.id ? action.payload.item : i)),
      );
      note(m, action.payload, `Agenda item updated: ${action.payload.item.title}`);
    },
    agendaItemRemoved(
      state,
      action: PayloadAction<{ meetingId: string; itemId: string } & Stamp>,
    ) {
      const m = find(state, action.payload.meetingId);
      const item = m?.agenda.find((i) => i.id === action.payload.itemId);
      if (!m || !item) return;
      m.agenda = renumber(m.agenda.filter((i) => i.id !== item.id));
      note(m, action.payload, `Agenda item removed: ${item.title}`);
    },
    agendaItemMoved(
      state,
      action: PayloadAction<
        { meetingId: string; itemId: string; direction: "up" | "down" } & Stamp
      >,
    ) {
      const m = find(state, action.payload.meetingId);
      if (!m) return;
      const list = [...m.agenda].sort((a, b) => a.order - b.order);
      const from = list.findIndex((i) => i.id === action.payload.itemId);
      const to = action.payload.direction === "up" ? from - 1 : from + 1;
      if (from < 0 || to < 0 || to >= list.length) return;
      const moving = list[from];
      const landingSection = list[to].section;
      [list[from], list[to]] = [list[to], list[from]];
      // Crossing a section boundary re-homes the item into the section it lands in.
      moving.section = landingSection;
      m.agenda = renumber(list);
      note(m, action.payload, `Agenda reordered: ${moving.title} moved ${action.payload.direction}`);
    },
    agendaItemDecided(
      state,
      action: PayloadAction<{ meetingId: string; itemId: string; decided: boolean } & Stamp>,
    ) {
      const m = find(state, action.payload.meetingId);
      const item = m?.agenda.find((i) => i.id === action.payload.itemId);
      if (!m || !item) return;
      item.decided = action.payload.decided;
      note(
        m,
        action.payload,
        `${item.title} marked ${action.payload.decided ? "decided" : "undecided"}`,
      );
    },

    /* ---------------------- FR-MTG-14 — closed sessions ------------------------ */
    closedSessionSet(
      state,
      action: PayloadAction<
        { meetingId: string; itemId: string; closed: boolean; participantIds: string[] } & Stamp
      >,
    ) {
      const m = find(state, action.payload.meetingId);
      const item = m?.agenda.find((i) => i.id === action.payload.itemId);
      if (!m || !item) return;
      item.closedSession = action.payload.closed;
      item.closedParticipantIds = action.payload.closed ? action.payload.participantIds : [];
      note(
        m,
        action.payload,
        action.payload.closed
          ? `Closed session applied to "${item.title}" — ${action.payload.participantIds.length} of ${m.participants.length} admitted`
          : `Closed session lifted from "${item.title}"`,
      );
    },

    /* ------------------------ FR-MTG-11 — carry forward ------------------------ */
    itemCarriedForward(
      state,
      action: PayloadAction<
        { fromMeetingId: string; toMeetingId: string; itemId: string; newItemId: string } & Stamp
      >,
    ) {
      const from = find(state, action.payload.fromMeetingId);
      const to = find(state, action.payload.toMeetingId);
      const item = from?.agenda.find((i) => i.id === action.payload.itemId);
      if (!from || !to || !item) return;

      item.carriedToMeetingId = to.id;
      // Papers and provenance travel with it; the closed-session restriction
      // does not, because the new sitting has a different participant list.
      to.agenda = renumber([
        ...to.agenda,
        {
          ...item,
          id: action.payload.newItemId,
          carriedFromMeetingId: from.id,
          carriedToMeetingId: undefined,
          closedSession: false,
          closedParticipantIds: [],
          decided: false,
          attachments: item.attachments.map((a) => ({ ...a })),
        },
      ]);

      note(from, action.payload, `Item carried forward to ${to.id}: ${item.title}`);
      note(to, action.payload, `Item carried forward from ${from.id}: ${item.title}`);
    },

    /* ------------------- FR-MTG-12 — cancellation / postponement --------------- */
    disrupted(
      state,
      action: PayloadAction<{ meetingId: string; disruption: MeetingDisruption } & Stamp>,
    ) {
      const m = find(state, action.payload.meetingId);
      if (!m) return;
      const d = action.payload.disruption;
      m.disruption = d;
      m.status = d.kind;
      if (d.kind === "Postponed" && d.postponedToDate) {
        m.date = d.postponedToDate;
        if (d.postponedToTime) m.time = d.postponedToTime;
      }
      note(
        m,
        action.payload,
        `${d.kind}: ${d.reason}. Packs ${d.packHandling.toLowerCase()}. Participants ${
          d.participantsNotified ? "notified" : "not yet notified"
        }.`,
      );
    },

    /* --------------------------- pack control (FR-PCK) ------------------------- */
    packFrozen(state, action: PayloadAction<{ meetingId: string; frozenBy: string } & Stamp>) {
      const m = find(state, action.payload.meetingId);
      if (!m) return;
      m.status = "Pack Frozen";
      m.packFrozenAt = action.payload.at;
      m.packFrozenBy = action.payload.frozenBy;
      note(m, action.payload, "Pack frozen for release");
    },

    /* -------------------------------- view state ------------------------------- */
    selected(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
    creatingChanged(state, action: PayloadAction<boolean>) {
      state.creating = action.payload;
    },
    statusFilterChanged(state, action: PayloadAction<string>) {
      state.statusFilter = action.payload;
    },
  },
});

export const {
  created,
  participantsAdded,
  participantCapacityChanged,
  participantRemoved,
  attendanceRecorded,
  agendaItemAdded,
  agendaItemUpdated,
  agendaItemRemoved,
  agendaItemMoved,
  agendaItemDecided,
  closedSessionSet,
  itemCarriedForward,
  disrupted,
  packFrozen,
  selected,
  creatingChanged,
  statusFilterChanged,
} = meetingsSlice.actions;

export default meetingsSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectMeetings = (s: RootState) => s.meetings.items;
export const selectSelectedMeetingId = (s: RootState) => s.meetings.selectedId;
export const selectCreatingMeeting = (s: RootState) => s.meetings.creating;
export const selectStatusFilter = (s: RootState) => s.meetings.statusFilter;

export const selectSelectedMeeting = createSelector(
  [selectMeetings, selectSelectedMeetingId],
  (meetings, id) => meetings.find((m) => m.id === id) ?? null,
);

export const selectUpcomingMeetings = createSelector([selectMeetings], (meetings) =>
  meetings.filter((m) => m.status !== "Concluded" && m.status !== "Cancelled"),
);

export const selectFilteredMeetings = createSelector(
  [selectMeetings, selectStatusFilter],
  (meetings, filter) =>
    [...meetings]
      .filter((m) => filter === "All" || m.status === filter)
      .sort((a, b) => a.date.localeCompare(b.date)),
);

/** Sittings a still-undecided item could be carried forward to (FR-MTG-11). */
export const selectCarryForwardTargets = createSelector(
  [selectMeetings, selectSelectedMeetingId],
  (meetings, currentId) =>
    meetings.filter(
      (m) =>
        m.id !== currentId &&
        m.status !== "Concluded" &&
        m.status !== "Cancelled",
    ),
);

/** FR-MTG-10 — sittings that share a seriesId, newest sitting first. */
export const selectSeriesGroups = createSelector([selectMeetings], (meetings) => {
  const groups: {
    seriesId: string;
    title: string;
    recurrence: Meeting["recurrence"];
    type: Meeting["type"];
    sittings: Meeting[];
  }[] = [];

  for (const meeting of meetings) {
    if (!meeting.seriesId) continue;
    const group = groups.find((g) => g.seriesId === meeting.seriesId);
    if (group) group.sittings.push(meeting);
    else
      groups.push({
        seriesId: meeting.seriesId,
        title: meeting.title,
        recurrence: meeting.recurrence,
        type: meeting.type,
        sittings: [meeting],
      });
  }

  return groups.map((g) => ({
    ...g,
    sittings: [...g.sittings].sort((a, b) => b.date.localeCompare(a.date)),
  }));
});

/** Sittings with no series — they still belong on the series page as one-offs. */
export const selectStandaloneMeetings = createSelector([selectMeetings], (meetings) =>
  meetings.filter((m) => !m.seriesId),
);

/** FR-MTG-12 — everything cancelled or postponed, most recent decision first. */
export const selectDisruptedMeetings = createSelector([selectMeetings], (meetings) =>
  meetings
    .filter((m) => m.disruption)
    .sort((a, b) => (b.disruption?.at ?? "").localeCompare(a.disruption?.at ?? "")),
);

/** FR-MTG-11 — an item's journey between two sittings. */
export interface CarriedItem {
  item: AgendaItem;
  from: Meeting;
  to: Meeting | null;
}

/** Items that have already been moved onto a nominated sitting. */
export const selectCarriedItems = createSelector([selectMeetings], (meetings) => {
  const rows: CarriedItem[] = [];
  for (const from of meetings) {
    for (const item of from.agenda) {
      if (!item.carriedToMeetingId) continue;
      rows.push({
        item,
        from,
        to: meetings.find((m) => m.id === item.carriedToMeetingId) ?? null,
      });
    }
  }
  return rows.sort((a, b) => b.from.date.localeCompare(a.from.date));
});

/**
 * Items a sitting rose from without deciding and which have not been nominated
 * anywhere — the backlog the Secretariat has to place (FR-MTG-11).
 */
export const selectUndecidedBacklog = createSelector([selectMeetings], (meetings) => {
  const rows: { item: AgendaItem; from: Meeting }[] = [];
  for (const from of meetings) {
    if (from.status !== "Concluded" && from.status !== "Cancelled") continue;
    for (const item of from.agenda) {
      if (item.decided || item.carriedToMeetingId) continue;
      rows.push({ item, from });
    }
  }
  return rows.sort((a, b) => a.from.date.localeCompare(b.from.date));
});

/* -------------------------------- Helpers -------------------------------- */

/** FR-MTG-05 — the deadline is enforced, so the UI can state it plainly. */
export function submissionsClosed(meeting: Meeting, nowIso: string): boolean {
  return nowIso >= meeting.submissionDeadline;
}

/** Agenda grouped into its sections, in order (FR-MTG-06). */
export function groupAgenda(agenda: AgendaItem[]) {
  const ordered = [...agenda].sort((a, b) => a.order - b.order);
  const sections: { section: string; items: AgendaItem[] }[] = [];
  for (const item of ordered) {
    const bucket = sections.find((s) => s.section === item.section);
    if (bucket) bucket.items.push(item);
    else sections.push({ section: item.section, items: [item] });
  }
  return sections;
}
