/**
 * FR-DEC seed data — decision capture and action tracking.
 *
 * The set is small on purpose but it is not tidy: one decision is still in
 * draft, one has been corrected after finalisation, two actions are past their
 * deadline and one of those has already escalated. A screen that only ever sees
 * the happy path is a screen nobody has checked.
 */
import type {
  ActionRecord,
  ActionUpdate,
  DecisionCorrection,
  DecisionOutcomeCode,
  DecisionRecord,
  MinutesDocument,
} from "@/models/response/base-response";

/** FR-DEC-03 — configurable outcome types, held as data. */
export const OUTCOME_TYPES: {
  code: DecisionOutcomeCode;
  meaning: string;
  /** Whether this outcome ordinarily carries work with it. */
  carriesActions: boolean;
}[] = [
  {
    code: "Approved",
    meaning: "Cabinet agreed the proposal as submitted.",
    carriesActions: true,
  },
  {
    code: "Approved with amendment",
    meaning: "Agreed subject to changes recorded in the decision text.",
    carriesActions: true,
  },
  {
    code: "Deferred",
    meaning: "Held over to a later sitting. The item returns as it stands.",
    carriesActions: false,
  },
  {
    code: "Referred",
    meaning: "Sent to a committee or a ministry for further work first.",
    carriesActions: true,
  },
  {
    code: "Noted",
    meaning: "Received for information. No approval was sought or given.",
    carriesActions: false,
  },
  {
    code: "Rejected",
    meaning: "Not agreed. The proposal does not proceed.",
    carriesActions: false,
  },
  {
    code: "Withdrawn",
    meaning: "Taken back by the submitting ministry before a decision.",
    carriesActions: false,
  },
];

export const MINISTRIES = [
  "Ministry of Finance",
  "Ministry of Health",
  "Ministry of Agriculture",
  "Ministry of Education",
  "Ministry of Transport",
  "Ministry of Justice",
];

/** Where an overdue action goes. FR-DEC-08. */
export const ESCALATION_POINTS = [
  "Chief Secretary",
  "Secretary to Cabinet",
  "Committee chair",
];

/** Days before a deadline at which the first reminder goes out. FR-DEC-08. */
export const REMINDER_THRESHOLD_DAYS = 7;

export const seedDecisionRecords: DecisionRecord[] = [
  {
    id: "DEC-2026-0087",
    meetingId: "MTG-2026-013",
    meetingTitle: "13th Ordinary Cabinet Sitting",
    meetingDate: "2026-08-04",
    agendaItemNumber: "3",
    agendaItemTitle: "Mid-Year Budget Review 2026/27",
    text: "Cabinet approved the mid-year budget review subject to the recurrent expenditure ceiling being held at the level tabled, and directed the Ministry of Finance to publish the revised ceilings to controlling officers within thirty days.",
    outcome: "Approved with amendment",
    state: "Finalised",
    classification: "SECRET",
    recordedBy: "Larry (Secretariat)",
    recordedAt: "2026-08-04T12:40",
    reviewedBy: "Secretary to Cabinet",
    finalisedAt: "2026-08-05T09:15",
    ministries: ["Ministry of Finance"],
  },
  {
    id: "DEC-2026-0088",
    meetingId: "MTG-2026-013",
    meetingTitle: "13th Ordinary Cabinet Sitting",
    meetingDate: "2026-08-04",
    agendaItemNumber: "4",
    agendaItemTitle: "National Health Insurance Framework",
    text: "Cabinet referred the framework to the Cabinet Committee on Social Services for costing, and directed the Ministry of Health to return with an actuarial assessment before the framework is tabled again.",
    outcome: "Referred",
    state: "Finalised",
    classification: "SECRET",
    recordedBy: "Larry (Secretariat)",
    recordedAt: "2026-08-04T13:05",
    reviewedBy: "Secretary to Cabinet",
    finalisedAt: "2026-08-05T09:20",
    supersedes: "DEC-2026-0061",
    ministries: ["Ministry of Health", "Ministry of Finance"],
  },
  {
    id: "DEC-2026-0089",
    meetingId: "MTG-2026-013",
    meetingTitle: "13th Ordinary Cabinet Sitting",
    meetingDate: "2026-08-04",
    agendaItemNumber: "5",
    agendaItemTitle: "Fertiliser Subsidy Programme — 2026/27 Season",
    text: "Cabinet approved the subsidy programme for the 2026/27 season at the beneficiary numbers tabled, and directed the Ministry of Agriculture to complete beneficiary verification before the first disbursement.",
    outcome: "Approved",
    state: "Finalised",
    classification: "CONFIDENTIAL",
    recordedBy: "Larry (Secretariat)",
    recordedAt: "2026-08-04T13:30",
    reviewedBy: "Secretary to Cabinet",
    finalisedAt: "2026-08-05T09:22",
    supersedes: "DEC-2026-0042",
    ministries: ["Ministry of Agriculture"],
  },
  {
    id: "DEC-2026-0090",
    meetingId: "MTG-2026-013",
    meetingTitle: "13th Ordinary Cabinet Sitting",
    meetingDate: "2026-08-04",
    agendaItemNumber: "6",
    agendaItemTitle: "Lilongwe Western Bypass — Contract Award",
    text: "Cabinet deferred the contract award pending the Attorney General's opinion on the procurement process followed.",
    outcome: "Deferred",
    state: "Finalised",
    classification: "SECRET",
    recordedBy: "Larry (Secretariat)",
    recordedAt: "2026-08-04T14:02",
    reviewedBy: "Secretary to Cabinet",
    finalisedAt: "2026-08-05T09:25",
    ministries: ["Ministry of Transport", "Ministry of Justice"],
  },
  {
    id: "DEC-2026-0091",
    meetingId: "MTG-2026-015",
    meetingTitle: "Economic Affairs Committee",
    meetingDate: "2026-08-15",
    agendaItemNumber: "2",
    agendaItemTitle: "Regional Diplomatic Positions",
    text: "The Committee noted the position paper on regional diplomatic engagement and asked that it be circulated to the full Cabinet for information.",
    outcome: "Noted",
    state: "In review",
    classification: "TOP SECRET — CABINET",
    recordedBy: "Larry (Secretariat)",
    recordedAt: "2026-08-15T10:12",
    ministries: ["Ministry of Justice"],
  },
  {
    id: "DEC-2026-0092",
    meetingId: "MTG-2026-015",
    meetingTitle: "Economic Affairs Committee",
    meetingDate: "2026-08-15",
    agendaItemNumber: "3",
    agendaItemTitle: "Teacher Recruitment Ceiling",
    text: "The Committee approved an increase in the teacher recruitment ceiling for the 2026/27 financial year, subject to confirmation of the wage bill position by the Ministry of Finance.",
    outcome: "Approved with amendment",
    state: "Draft",
    classification: "SECRET",
    recordedBy: "Larry (Secretariat)",
    recordedAt: "2026-08-15T10:40",
    ministries: ["Ministry of Education", "Ministry of Finance"],
  },
];

/** FR-DEC-05 — one correction on the record, with the original preserved. */
export const seedCorrections: DecisionCorrection[] = [
  {
    id: "COR-2026-0004",
    decisionId: "DEC-2026-0089",
    at: "2026-08-07T11:20",
    authorisedBy: "Secretary to Cabinet",
    reason:
      "The beneficiary figure was transcribed as 2.8 million against a tabled figure of 3.8 million. Corrected against the sitting recording and the tabled paper.",
    originalText:
      "Cabinet approved the subsidy programme for the 2026/27 season at 2.8 million beneficiaries, and directed the Ministry of Agriculture to complete beneficiary verification before the first disbursement.",
    correctedText:
      "Cabinet approved the subsidy programme for the 2026/27 season at the beneficiary numbers tabled, and directed the Ministry of Agriculture to complete beneficiary verification before the first disbursement.",
  },
];

export const seedActionRecords: ActionRecord[] = [
  {
    id: "ACT-2026-0201",
    decisionId: "DEC-2026-0087",
    meetingId: "MTG-2026-013",
    description: "Publish revised recurrent expenditure ceilings to controlling officers.",
    instructions:
      "Circulate the revised ceilings under cover of a Treasury circular and confirm receipt from each controlling officer.",
    ministry: "Ministry of Finance",
    officer: "Secretary to the Treasury",
    deadline: "2026-09-03",
    state: "In progress",
    escalationPoint: "Secretary to Cabinet",
    escalated: false,
    reminderSentAt: "2026-08-27T08:00",
  },
  {
    id: "ACT-2026-0202",
    decisionId: "DEC-2026-0088",
    meetingId: "MTG-2026-013",
    description: "Commission and deliver an actuarial assessment of the insurance framework.",
    instructions:
      "Engage the Government Actuary, deliver the assessment to the Committee on Social Services, and copy the Secretariat.",
    ministry: "Ministry of Health",
    officer: "Principal Secretary — Health",
    deadline: "2026-08-12",
    state: "In progress",
    escalationPoint: "Chief Secretary",
    escalated: true,
    escalatedAt: "2026-08-13T08:00",
    reminderSentAt: "2026-08-05T08:00",
  },
  {
    id: "ACT-2026-0203",
    decisionId: "DEC-2026-0089",
    meetingId: "MTG-2026-013",
    description: "Complete beneficiary verification before the first disbursement.",
    instructions:
      "Verify the beneficiary register against the national identity database and report the exception rate.",
    ministry: "Ministry of Agriculture",
    officer: "Principal Secretary — Agriculture",
    deadline: "2026-08-29",
    state: "Submitted for closure",
    escalationPoint: "Secretary to Cabinet",
    escalated: false,
    evidence: {
      reference: "AGR/VER/2026/114",
      description:
        "Verification report — 3.79 million records matched, 11,400 exceptions referred to district offices.",
      submittedBy: "Principal Secretary — Agriculture",
      submittedAt: "2026-08-14T16:20",
    },
  },
  {
    id: "ACT-2026-0204",
    decisionId: "DEC-2026-0090",
    meetingId: "MTG-2026-013",
    description: "Obtain the Attorney General's opinion on the procurement process.",
    instructions:
      "Submit the full procurement file to the Attorney General and return the opinion to the Secretariat for the next sitting.",
    ministry: "Ministry of Justice",
    officer: "Solicitor General",
    deadline: "2026-08-11",
    state: "Not started",
    escalationPoint: "Chief Secretary",
    escalated: false,
    reminderSentAt: "2026-08-04T08:00",
  },
  {
    id: "ACT-2026-0205",
    decisionId: "DEC-2026-0087",
    meetingId: "MTG-2026-013",
    description: "Report the wage bill position for the 2026/27 financial year.",
    instructions:
      "Provide the consolidated wage bill position, including the effect of any recruitment ceiling change.",
    ministry: "Ministry of Finance",
    officer: "Budget Director",
    deadline: "2026-08-20",
    state: "Not started",
    escalationPoint: "Secretary to Cabinet",
    escalated: false,
  },
  {
    id: "ACT-2026-0206",
    decisionId: "DEC-2026-0089",
    meetingId: "MTG-2026-013",
    description: "Confirm warehouse readiness at the four regional depots.",
    instructions:
      "Inspect each depot and confirm storage capacity ahead of the first delivery window.",
    ministry: "Ministry of Agriculture",
    officer: "Director of Crop Development",
    deadline: "2026-07-31",
    state: "Closed",
    escalationPoint: "Secretary to Cabinet",
    escalated: false,
    evidence: {
      reference: "AGR/DEP/2026/088",
      description: "Depot inspection reports for Mzuzu, Lilongwe, Zomba and Blantyre.",
      submittedBy: "Director of Crop Development",
      submittedAt: "2026-07-28T10:05",
    },
    verifiedBy: "Larry (Secretariat)",
    verifiedAt: "2026-07-30T09:40",
    closedAt: "2026-07-30T09:40",
  },
  {
    id: "ACT-2026-0207",
    decisionId: "DEC-2026-0088",
    meetingId: "MTG-2026-013",
    description: "Prepare the costing brief for the Committee on Social Services.",
    instructions: "Cost the framework over five years against three enrolment scenarios.",
    ministry: "Ministry of Finance",
    officer: "Budget Director",
    deadline: "2026-08-18",
    state: "In progress",
    escalationPoint: "Secretary to Cabinet",
    escalated: false,
    reminderSentAt: "2026-08-11T08:00",
  },
];

export const seedActionUpdates: ActionUpdate[] = [
  {
    id: "AU-0001",
    actionId: "ACT-2026-0201",
    at: "2026-08-08T09:15",
    by: "Secretary to the Treasury",
    narrative: "Draft circular prepared and with the Secretary to the Treasury for signature.",
    state: "In progress",
  },
  {
    id: "AU-0002",
    actionId: "ACT-2026-0201",
    at: "2026-08-14T11:30",
    by: "Secretary to the Treasury",
    narrative:
      "Circular signed. Distribution to the twenty-eight controlling officers begins Monday; receipt confirmations tracked centrally.",
    state: "In progress",
  },
  {
    id: "AU-0003",
    actionId: "ACT-2026-0202",
    at: "2026-08-10T14:00",
    by: "Principal Secretary — Health",
    narrative:
      "Government Actuary engaged. First data request answered; the assessment will not be ready before the deadline.",
    state: "In progress",
  },
  {
    id: "AU-0004",
    actionId: "ACT-2026-0202",
    at: "2026-08-13T08:05",
    by: "System",
    narrative:
      "Deadline passed with the action open. Escalated to the Chief Secretary under the configured escalation point.",
    state: "In progress",
  },
  {
    id: "AU-0005",
    actionId: "ACT-2026-0203",
    at: "2026-08-14T16:20",
    by: "Principal Secretary — Agriculture",
    narrative:
      "Verification complete. Report AGR/VER/2026/114 submitted for Secretariat verification.",
    state: "Submitted for closure",
  },
  {
    id: "AU-0006",
    actionId: "ACT-2026-0206",
    at: "2026-07-28T10:05",
    by: "Director of Crop Development",
    narrative: "All four depots inspected; reports attached.",
    state: "Submitted for closure",
  },
  {
    id: "AU-0007",
    actionId: "ACT-2026-0206",
    at: "2026-07-30T09:40",
    by: "Larry (Secretariat)",
    narrative: "Evidence checked against the decision. Closure verified.",
    state: "Closed",
  },
  {
    id: "AU-0008",
    actionId: "ACT-2026-0207",
    at: "2026-08-12T15:45",
    by: "Budget Director",
    narrative: "Two of the three enrolment scenarios costed. Third scenario awaits enrolment data from Health.",
    state: "In progress",
  },
];

export const seedMinutes: MinutesDocument[] = [
  {
    id: "MIN-2026-013",
    meetingId: "MTG-2026-013",
    meetingTitle: "13th Ordinary Cabinet Sitting",
    meetingDate: "2026-08-04",
    kind: "Minutes",
    state: "Circulated",
    classification: "SECRET",
    circulatedTo: ["Cabinet Members", "Chief Secretary", "Secretary to Cabinet"],
    decisionsIncluded: [
      "DEC-2026-0087",
      "DEC-2026-0088",
      "DEC-2026-0089",
      "DEC-2026-0090",
    ],
    preparedBy: "Larry (Secretariat)",
    approvedBy: "Secretary to Cabinet",
    circulatedAt: "2026-08-06T15:00",
    scope: "The full sitting, all four items.",
  },
  {
    id: "EXT-2026-0031",
    meetingId: "MTG-2026-013",
    meetingTitle: "13th Ordinary Cabinet Sitting",
    meetingDate: "2026-08-04",
    kind: "Extract",
    state: "Circulated",
    classification: "CONFIDENTIAL",
    circulatedTo: ["Principal Secretary — Agriculture", "Director of Crop Development"],
    decisionsIncluded: ["DEC-2026-0089"],
    preparedBy: "Larry (Secretariat)",
    approvedBy: "Secretary to Cabinet",
    circulatedAt: "2026-08-06T15:10",
    scope: "Item 5 only — the fertiliser subsidy decision and its actions.",
  },
  {
    id: "ACL-2026-013",
    meetingId: "MTG-2026-013",
    meetingTitle: "13th Ordinary Cabinet Sitting",
    meetingDate: "2026-08-04",
    kind: "Action list",
    state: "Circulated",
    classification: "CONFIDENTIAL",
    circulatedTo: [
      "Ministry of Finance",
      "Ministry of Health",
      "Ministry of Agriculture",
      "Ministry of Justice",
    ],
    decisionsIncluded: ["DEC-2026-0087", "DEC-2026-0088", "DEC-2026-0089", "DEC-2026-0090"],
    preparedBy: "Larry (Secretariat)",
    approvedBy: "Secretary to Cabinet",
    circulatedAt: "2026-08-06T15:20",
    scope: "Every action carried by the sitting, addressed to the responsible ministry.",
  },
  {
    id: "MIN-2026-015",
    meetingId: "MTG-2026-015",
    meetingTitle: "Economic Affairs Committee",
    meetingDate: "2026-08-15",
    kind: "Minutes",
    state: "In review",
    classification: "TOP SECRET — CABINET",
    circulatedTo: [],
    decisionsIncluded: ["DEC-2026-0091", "DEC-2026-0092"],
    preparedBy: "Larry (Secretariat)",
    scope: "The committee sitting. Not circulated while a decision is still in draft.",
  },
];

/**
 * FR-DEC-13 — decisions that predate this console but are named as the prior
 * step in a chain. Enough to render the history; not full records.
 */
export const PRIOR_DECISIONS: Record<
  string,
  { title: string; meeting: string; date: string; outcome: DecisionOutcomeCode }
> = {
  "DEC-2026-0061": {
    title: "National Health Insurance Framework — first reading",
    meeting: "11th Ordinary Cabinet Sitting",
    date: "2026-06-02",
    outcome: "Deferred",
  },
  "DEC-2026-0042": {
    title: "Fertiliser Subsidy Programme — 2025/26 outturn",
    meeting: "9th Ordinary Cabinet Sitting",
    date: "2026-04-14",
    outcome: "Noted",
  },
};

/**
 * The ministry-side viewer. FR-DEC-07 writes progress as the assigned officer,
 * so the ministry screens need an identity of their own — `OPERATOR` is the
 * Secretariat account and would sign a ministry's update with the wrong name.
 * Read this from the session alongside `OPERATOR` once roles come from the IdP.
 */
export const MINISTRY_VIEWER = {
  officer: "Budget Director",
  ministry: "Ministry of Finance",
} as const;
