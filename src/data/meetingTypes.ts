import type {
  AgendaItemType,
  AttendanceMode,
  MeetingType,
  MeetingTypeConfig,
  ParticipantCapacity,
  Recurrence,
} from "@/models/response/base-response";

/**
 * FR-MTG-02 — meeting types are configuration, not code. Each carries its own
 * participant rule, document handling rule, classification default and
 * approval path; creating a meeting seeds its defaults from here.
 */
export const MEETING_TYPES: MeetingTypeConfig[] = [
  {
    name: "Full Cabinet",
    participantRule: "All Cabinet members, Chief Secretary and Secretariat",
    documentHandling: "Watermarked · no download · no print",
    classificationDefault: "TOP SECRET — CABINET",
    approvalPath: ["Ministry", "Policy Review", "Legal Clearance", "Secretary to Cabinet"],
  },
  {
    name: "Cabinet Committee",
    participantRule: "Committee members and nominated officials",
    documentHandling: "Watermarked · no download · print permitted",
    classificationDefault: "SECRET",
    approvalPath: ["Ministry", "Policy Review", "Committee Chair"],
  },
  {
    name: "Emergency Session",
    participantRule: "Convened list only — no standing invitations",
    documentHandling: "Watermarked · no download · no print",
    classificationDefault: "TOP SECRET — CABINET",
    approvalPath: ["Secretary to Cabinet"],
  },
  {
    name: "Inter-Ministerial Briefing",
    participantRule: "Nominated ministry representatives",
    documentHandling: "Watermarked · download for authorised roles",
    classificationDefault: "CONFIDENTIAL",
    approvalPath: ["Ministry", "Policy Review"],
  },
  {
    name: "Presidency Briefing",
    participantRule: "Designated Presidency users only",
    documentHandling: "Watermarked · no download · no print",
    classificationDefault: "TOP SECRET — CABINET",
    approvalPath: ["Chief of Staff", "Secretary to Cabinet"],
  },
];

export const MEETING_TYPE_NAMES = MEETING_TYPES.map((t) => t.name);

export function meetingTypeConfig(type: MeetingType): MeetingTypeConfig {
  return MEETING_TYPES.find((t) => t.name === type) ?? MEETING_TYPES[0];
}

/** FR-MTG-08 — what each agenda item type is expected to carry. */
export const AGENDA_ITEM_TYPES: {
  name: AgendaItemType;
  expects: string;
  requiresPaper: boolean;
}[] = [
  { name: "Policy Paper", expects: "Cabinet paper, annexes and a presentation", requiresPaper: true },
  { name: "Decision Item", expects: "Cabinet paper and a draft decision", requiresPaper: true },
  { name: "Information Note", expects: "Secretariat note or a short paper", requiresPaper: false },
  { name: "Oral Item", expects: "No papers — spoken to by the responsible ministry", requiresPaper: false },
  { name: "Standing Item", expects: "Carried on every sitting in the series", requiresPaper: false },
];

export const AGENDA_ITEM_TYPE_NAMES = AGENDA_ITEM_TYPES.map((t) => t.name);

export function agendaItemTypeRule(type: AgendaItemType) {
  return AGENDA_ITEM_TYPES.find((t) => t.name === type) ?? AGENDA_ITEM_TYPES[0];
}

export const PARTICIPANT_CAPACITIES: ParticipantCapacity[] = [
  "Member",
  "Attendee",
  "Presenter",
  "Observer",
  "Secretariat",
];

export const ATTENDANCE_MODES: AttendanceMode[] = [
  "Physical",
  "Video",
  "Apology",
  "Not recorded",
];

export const RECURRENCES: Recurrence[] = [
  "None",
  "Weekly",
  "Fortnightly",
  "Monthly",
  "Quarterly",
];

/** FR-MTG-04 — selectable in one go rather than person by person. */
export const ROLE_GROUPS: {
  name: string;
  defaultCapacity: ParticipantCapacity;
  members: { name: string; ministry: string }[];
}[] = [
  {
    name: "Cabinet Members",
    defaultCapacity: "Member",
    members: [
      { name: "Hon. Minister of Finance", ministry: "Finance & Economic Affairs" },
      { name: "Hon. Minister of Health", ministry: "Health" },
      { name: "Hon. Minister of Justice", ministry: "Justice" },
      { name: "Hon. Minister of Education", ministry: "Education" },
      { name: "Hon. Minister of ICT", ministry: "Information & Communications Technology" },
    ],
  },
  {
    name: "Presidency",
    defaultCapacity: "Member",
    members: [
      { name: "Chief of Staff", ministry: "Presidency" },
      { name: "National Security Advisor", ministry: "Presidency" },
    ],
  },
  {
    name: "Secretariat",
    defaultCapacity: "Secretariat",
    members: [
      { name: "Chief Secretary", ministry: "Office of the President & Cabinet" },
      { name: "Secretary to Cabinet", ministry: "Office of the President & Cabinet" },
    ],
  },
  {
    name: "Committee Members",
    defaultCapacity: "Member",
    members: [
      { name: "Hon. Minister of Finance", ministry: "Finance & Economic Affairs" },
      { name: "Hon. Minister of Agriculture", ministry: "Agriculture" },
      { name: "Secretary to Treasury", ministry: "Finance & Economic Affairs" },
    ],
  },
];

export const AGENDA_SECTIONS = [
  "Preliminaries",
  "Policy",
  "Legislation",
  "Reports",
  "Any Other Business",
];

export const ATTACHMENT_KINDS = [
  "Paper",
  "Annex",
  "Presentation",
  "Secretariat Note",
] as const;

export const MINISTRIES = [
  "Office of the President & Cabinet",
  "Finance & Economic Affairs",
  "Health",
  "Justice",
  "Education",
  "Agriculture",
  "Foreign Affairs",
  "Information & Communications Technology",
  "Presidency",
];
