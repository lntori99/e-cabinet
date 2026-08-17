/**
 * FR-AUD seed data — audit, reporting and oversight.
 *
 * The event log the console reads is not seeded here in full. Most of it is the
 * live log every other app writes to, which is the point: an audit console that
 * only shows its own fixtures is not auditing anything. What is here is the
 * history that predates this session, plus the things only oversight owns —
 * integrity runs, replication samples, alerts, reviews, exports and retention.
 */
import type {
  AnomalyAlert,
  AuditEvent,
  EntitlementLine,
  ExportRecord,
  IntegrityRun,
  ReplicationSample,
  ReportDefinition,
  RetentionClass,
} from "@/models/response/base-response";

const CLOCK = "NTP — Malawi Bureau of Standards, stratum 2";

/**
 * FR-AUD-01 names eight kinds of act that must be recorded. Held as data so the
 * event log can group by them and the overview can chart them.
 */
export const AUDITED_ACTIONS = [
  "Upload",
  "View",
  "Annotation",
  "Download",
  "Print",
  "Approval",
  "Deletion",
  "Administrative change",
] as const;

export type AuditedAction = (typeof AUDITED_ACTIONS)[number];

/**
 * The log the platform writes uses sentences rather than a fixed vocabulary,
 * so the console classifies each event into the FR-AUD-01 kinds on read. The
 * order matters: "late replacement uploaded" is an upload, not a view.
 */
const CLASSIFIERS: { kind: AuditedAction; match: RegExp }[] = [
  { kind: "Deletion", match: /delet|destroy|dispose|revoke|purge/i },
  { kind: "Print", match: /print/i },
  { kind: "Download", match: /download|export|offline/i },
  { kind: "Upload", match: /upload|submit|new version|replacement/i },
  { kind: "Annotation", match: /annotat|comment|note added|mark(ed)? up/i },
  {
    kind: "Approval",
    match: /approv|clear(ed|ance)|verif|finalis|sign-?off|release|freeze|frozen|escalat|decision/i,
  },
  { kind: "View", match: /view|open|read|search|acknowledg/i },
];

export function classifyAction(action: string): AuditedAction {
  return CLASSIFIERS.find((c) => c.match.test(action))?.kind ?? "Administrative change";
}

/**
 * FR-AUD-03, FR-AUD-05, FR-AUD-06, FR-AUD-07, FR-AUD-08 — the properties of the
 * store rather than of any one event. Held as data so the overview states them
 * beside the evidence rather than as a paragraph nobody checks.
 */
export const AUDIT_POSTURE = [
  {
    requirement: "FR-AUD-03",
    claim: "Append-only",
    detail:
      "There is no interface, at any privilege level, that modifies or deletes an audit event. The console offers no such control because the service exposes no such call.",
  },
  {
    requirement: "FR-AUD-04",
    claim: "Integrity-protected",
    detail:
      "Each event carries a hash over its own fields and the previous event's hash. Altering one row breaks every row after it, and the chain head is published so the break is visible from outside.",
  },
  {
    requirement: "FR-AUD-05",
    claim: "Replicated outside administrative reach",
    detail:
      "Events are written to a second, write-once store the platform administrators hold no credential for. Losing the primary does not lose the record.",
  },
  {
    requirement: "FR-AUD-06",
    claim: "Independently readable",
    detail:
      "The client security owner holds read access to the audit store under their own credential, issued by Government and not held by Bahamus.",
  },
  {
    requirement: "FR-AUD-07",
    claim: "Written before the response",
    detail:
      "A state-changing request does not return until its audit event is durable. If the write fails, the operation fails — the platform would rather refuse than act unrecorded.",
  },
  {
    requirement: "FR-AUD-08",
    claim: "Read-only for those who read it",
    detail:
      "Security and audit accounts can read every record and alter none. The oversight role carries no write capability over any Cabinet record.",
  },
] as const;

/** FR-AUD-05 — the last twelve hourly samples. */
export const seedReplication: ReplicationSample[] = [
  { at: "2026-08-15T09:00", lagSeconds: 3, eventsBehind: 0 },
  { at: "2026-08-15T08:00", lagSeconds: 4, eventsBehind: 1 },
  { at: "2026-08-15T07:00", lagSeconds: 3, eventsBehind: 0 },
  { at: "2026-08-15T06:00", lagSeconds: 5, eventsBehind: 2 },
  { at: "2026-08-15T05:00", lagSeconds: 41, eventsBehind: 18 },
  { at: "2026-08-15T04:00", lagSeconds: 96, eventsBehind: 44 },
  { at: "2026-08-15T03:00", lagSeconds: 12, eventsBehind: 5 },
  { at: "2026-08-15T02:00", lagSeconds: 4, eventsBehind: 1 },
  { at: "2026-08-15T01:00", lagSeconds: 3, eventsBehind: 0 },
  { at: "2026-08-15T00:00", lagSeconds: 3, eventsBehind: 0 },
  { at: "2026-08-14T23:00", lagSeconds: 6, eventsBehind: 2 },
  { at: "2026-08-14T22:00", lagSeconds: 3, eventsBehind: 0 },
];

/** Seconds. Beyond this the replica is far enough behind to be a finding. */
export const REPLICATION_THRESHOLD_SECONDS = 30;

export const seedIntegrityRuns: IntegrityRun[] = [
  {
    id: "IVR-2026-0214",
    at: "2026-08-15T04:00",
    fromEvent: "AUD-0001",
    toEvent: "AUD-4188",
    eventsChecked: 4188,
    rootHash: "9f2c41ab7e5d0c88a13f6b92e4d7150cbb3a8e6f2019d4c7ab5e83f01d6c294a",
    result: "Verified",
    runBy: "Platform — scheduled",
    independent: false,
    durationSeconds: 34,
  },
  {
    id: "IVR-2026-0213",
    at: "2026-08-14T11:20",
    fromEvent: "AUD-0001",
    toEvent: "AUD-4102",
    eventsChecked: 4102,
    rootHash: "3d7e19c5f4a2b60d8e91c73a0f5b2846dd1c9e07b3a6f582c40de71b9a8f3125",
    result: "Verified",
    runBy: "Security & Audit — Government credential",
    independent: true,
    durationSeconds: 41,
  },
  {
    id: "IVR-2026-0212",
    at: "2026-08-14T04:00",
    fromEvent: "AUD-0001",
    toEvent: "AUD-4061",
    eventsChecked: 4061,
    rootHash: "c81a5f30d92e7b64af0c31d857e2946b0f7ad3c25e918b46da7f20c53b8e19d7",
    result: "Verified",
    runBy: "Platform — scheduled",
    independent: false,
    durationSeconds: 33,
  },
  {
    id: "IVR-2026-0208",
    at: "2026-08-11T04:00",
    fromEvent: "AUD-0001",
    toEvent: "AUD-3902",
    eventsChecked: 3902,
    rootHash: "7b04e29da61c58f3b920e47d05a1c86fe3d92b71a05c4f68e9d31207ba4c58e6",
    result: "Verified",
    runBy: "Platform — scheduled",
    independent: false,
    durationSeconds: 31,
  },
];

export const seedAlerts: AnomalyAlert[] = [
  {
    id: "ALR-2026-0061",
    raisedAt: "2026-08-15T02:41",
    pattern: "Out-of-hours access to high classification",
    actor: "R. Kamanga",
    role: "Technical Administrator",
    observation:
      "Four SECRET papers opened between 02:14 and 02:39, from an address outside the Capital Hill range.",
    rule: "Any access to SECRET or above between 22:00 and 05:00 raises an alert.",
    severity: "critical",
    state: "Open",
    evidence: ["AUD-4171", "AUD-4172", "AUD-4174", "AUD-4177"],
  },
  {
    id: "ALR-2026-0060",
    raisedAt: "2026-08-14T16:08",
    pattern: "Bulk download",
    actor: "G. Phiri",
    role: "Ministry Submitter",
    observation: "22 documents downloaded in 6 minutes against a rolling baseline of 3 per hour.",
    rule: "More than 15 downloads by one account inside 15 minutes raises an alert.",
    severity: "warning",
    state: "Under review",
    evidence: ["AUD-4140", "AUD-4141", "AUD-4142"],
  },
  {
    id: "ALR-2026-0059",
    raisedAt: "2026-08-13T09:20",
    pattern: "Repeated authorisation failure",
    actor: "unknown",
    role: "—",
    observation:
      "Five consecutive failed sign-ins against account j.tembo from 41.87.12.9, an address outside Government ranges.",
    rule: "Five failures against one account inside 10 minutes locks it and raises an alert.",
    severity: "critical",
    state: "Closed — acted on",
    evidence: ["AUD-0006"],
    reviewedBy: "Security & Audit",
    reviewedAt: "2026-08-13T10:05",
    disposition:
      "Account locked and the officer contacted. Credential rotated; no successful sign-in occurred.",
  },
  {
    id: "ALR-2026-0058",
    raisedAt: "2026-08-12T10:15",
    pattern: "Privilege change",
    actor: "R. Kamanga",
    role: "Technical Administrator",
    observation:
      "Privileged session opened on prod-app-cluster via the bastion, outside a standing entitlement.",
    rule: "Any privilege elevation raises an alert, whether or not a change record exists.",
    severity: "warning",
    state: "Closed — explained",
    evidence: ["AUD-0009"],
    reviewedBy: "Security & Audit",
    reviewedAt: "2026-08-12T13:40",
    disposition:
      "Matched to approved change CH-118. The alert is expected behaviour, not a fault — the rule fires on every elevation by design.",
  },
];

export const seedEntitlements: EntitlementLine[] = [
  {
    id: "ENT-001",
    user: "Larry",
    role: "Secretariat Administrator",
    ministry: "Office of the President & Cabinet",
    entitlements: [
      "Create and amend meetings",
      "Assemble, freeze and release packs",
      "Record and finalise decisions",
      "Verify action closures",
    ],
    lastActiveAt: "2026-08-15T09:02",
    eventsInPeriod: 412,
    decision: "Confirmed",
    reviewedBy: "Chief Secretary",
  },
  {
    id: "ENT-002",
    user: "R. Kamanga",
    role: "Technical Administrator",
    ministry: "Office of the President & Cabinet",
    entitlements: [
      "Platform configuration",
      "Privileged session via bastion",
      "No access to Cabinet document content",
    ],
    lastActiveAt: "2026-08-15T02:39",
    eventsInPeriod: 87,
    decision: "Reduce",
    reviewedBy: "Chief Secretary",
    note: "Standing bastion access to be replaced by per-change elevation. Raised with the vendor.",
  },
  {
    id: "ENT-003",
    user: "Hon. Minister of Health",
    role: "Cabinet Member",
    ministry: "Health",
    entitlements: ["Read released packs", "Annotate own copy", "Acknowledge receipt"],
    lastActiveAt: "2026-08-14T08:03",
    eventsInPeriod: 46,
    decision: "Confirmed",
    reviewedBy: "Chief Secretary",
  },
  {
    id: "ENT-004",
    user: "G. Phiri",
    role: "Ministry Submitter",
    ministry: "Agriculture",
    entitlements: ["Submit papers", "Upload replacement versions", "Read own submissions"],
    lastActiveAt: "2026-08-14T16:08",
    eventsInPeriod: 133,
    decision: "Not reviewed",
  },
  {
    id: "ENT-005",
    user: "J. Tembo",
    role: "Presidency Official",
    ministry: "Office of the President & Cabinet",
    entitlements: ["Read released packs", "Read the decision record"],
    lastActiveAt: "2026-04-02T11:14",
    // Four months without an event. This is the finding a review exists to make.
    eventsInPeriod: 0,
    decision: "Revoke",
    reviewedBy: "Chief Secretary",
    note: "No activity in the review period and no forthcoming requirement. Entitlement withdrawn.",
  },
  {
    id: "ENT-006",
    user: "Security & Audit",
    role: "Security Officer",
    ministry: "Office of the President & Cabinet",
    entitlements: [
      "Read every audit record",
      "Run independent integrity verification",
      "No write capability over any Cabinet record",
    ],
    lastActiveAt: "2026-08-14T11:20",
    eventsInPeriod: 58,
    decision: "Confirmed",
    reviewedBy: "Chief Secretary",
    note: "Read-only by construction — FR-AUD-08.",
  },
];

/** The quarter under review, for the access-review header. */
export const REVIEW_PERIOD = {
  label: "Q2 2026/27",
  from: "2026-05-01",
  to: "2026-07-31",
  dueBy: "2026-08-31",
  owner: "Chief Secretary",
};

/** FR-AUD-09 — the five reports the requirement names. */
export const seedReports: ReportDefinition[] = [
  {
    id: "RPT-ACCESS",
    name: "Document access",
    description:
      "Who opened what, when, and at which version. The report a leak enquiry starts from.",
    covers: ["View"],
    requirement: "FR-AUD-09",
    lastRunAt: "2026-08-14T07:30",
    lastRunRows: 1_284,
  },
  {
    id: "RPT-DOWNLOAD",
    name: "Downloads",
    description:
      "Every download and offline grant, with the classification of what was taken.",
    covers: ["Download"],
    requirement: "FR-AUD-09",
    lastRunAt: "2026-08-14T07:30",
    lastRunRows: 96,
  },
  {
    id: "RPT-ADMIN",
    name: "Administrative changes",
    description:
      "Configuration, entitlement and policy changes, with the officer who made each.",
    covers: ["Administrative change", "Approval"],
    requirement: "FR-AUD-09",
    lastRunAt: "2026-08-01T06:00",
    lastRunRows: 211,
  },
  {
    id: "RPT-ATTENDANCE",
    name: "Meeting attendance",
    description:
      "Who attended each sitting, from the room and remotely, with join and leave times.",
    covers: ["View", "Approval"],
    requirement: "FR-AUD-09",
    lastRunAt: "2026-08-05T09:00",
    lastRunRows: 74,
  },
  {
    id: "RPT-WORKFLOW",
    name: "Workflow actions",
    description:
      "Clearance decisions, pack freezes and releases, decision finalisation and action closure.",
    covers: ["Approval", "Upload"],
    requirement: "FR-AUD-09",
    lastRunAt: "2026-08-14T07:30",
    lastRunRows: 338,
  },
];

export const seedExports: ExportRecord[] = [
  {
    id: "EXP-2026-0019",
    at: "2026-08-13T11:02",
    requestedBy: "Security & Audit",
    purpose: "Investigation into the failed sign-in sequence against account j.tembo",
    scope: "All events for account j.tembo, 2026-08-01 to 2026-08-13",
    rows: 41,
    format: "CSV",
    digest: "sha256:6a1f83c0e94b27d5fa08c31e762b9d40a5f8c17e3b90d2465ca7e08f13bd952c",
    attestedBy: "Chief Secretary",
    releasedTo: "Office of the Chief Secretary — hand delivery on encrypted media",
  },
  {
    id: "EXP-2026-0018",
    at: "2026-07-31T16:40",
    requestedBy: "Chief Secretary",
    purpose: "Quarterly access review evidence pack",
    scope: "Entitlement and administrative-change events, Q1 2026/27",
    rows: 618,
    format: "PDF",
    digest: "sha256:d40b7e13a95f28c604e1b8f3072ac5d916e4b8072f31ca9d5e806b4f2a71c3d8",
    attestedBy: "Chief Secretary",
    releasedTo: "Office of the Chief Secretary",
  },
];

export const seedRetention: RetentionClass[] = [
  {
    id: "RET-PERM",
    name: "Permanent — National Archives",
    years: 999,
    appliesTo: "Cabinet decisions, minutes, and every audit event describing them",
    eventsHeld: 2_914,
    oldestEvent: "2024-01-08",
    orphanedButRetained: 186,
    authority: "National Archives Act — permanent preservation",
  },
  {
    id: "RET-25",
    name: "Twenty-five years",
    years: 25,
    appliesTo: "Papers, packs, clearance and workflow actions",
    eventsHeld: 1_072,
    oldestEvent: "2024-01-08",
    orphanedButRetained: 47,
    authority: "Government records schedule, class B",
  },
  {
    id: "RET-7",
    name: "Seven years",
    years: 7,
    appliesTo: "Sign-in, session and device events",
    eventsHeld: 202,
    oldestEvent: "2025-06-11",
    orphanedButRetained: 0,
    authority: "Government records schedule, class D",
  },
];

/**
 * Events from before this session, carrying the full FR-AUD-02 field set. The
 * console reads these together with the live log every other app writes to.
 */
export const seedAuditHistory: AuditEvent[] = [
  {
    id: "AUD-4177",
    timestamp: "2026-08-15T02:39:11",
    actor: "R. Kamanga",
    role: "Technical Administrator",
    action: "Document viewed (watermarked)",
    target: "DOC-0352",
    objectVersion: "v3",
    ip: "41.220.14.88",
    device: "UNMANAGED-BROWSER (Chrome 141, Windows)",
    outcome: "Success",
    timeSource: CLOCK,
    severity: "critical",
  },
  {
    id: "AUD-4174",
    timestamp: "2026-08-15T02:31:04",
    actor: "R. Kamanga",
    role: "Technical Administrator",
    action: "Document viewed (watermarked)",
    target: "DOC-0341",
    objectVersion: "v2",
    ip: "41.220.14.88",
    device: "UNMANAGED-BROWSER (Chrome 141, Windows)",
    outcome: "Success",
    timeSource: CLOCK,
    severity: "critical",
  },
  {
    id: "AUD-4172",
    timestamp: "2026-08-15T02:19:47",
    actor: "R. Kamanga",
    role: "Technical Administrator",
    action: "Document viewed (watermarked)",
    target: "DOC-0344",
    objectVersion: "v1",
    ip: "41.220.14.88",
    device: "UNMANAGED-BROWSER (Chrome 141, Windows)",
    outcome: "Success",
    timeSource: CLOCK,
    severity: "critical",
  },
  {
    id: "AUD-4171",
    timestamp: "2026-08-15T02:14:02",
    actor: "R. Kamanga",
    role: "Technical Administrator",
    action: "Document viewed (watermarked)",
    target: "DOC-0355",
    objectVersion: "v1",
    ip: "41.220.14.88",
    device: "UNMANAGED-BROWSER (Chrome 141, Windows)",
    outcome: "Success",
    timeSource: CLOCK,
    severity: "critical",
  },
  {
    id: "AUD-4142",
    timestamp: "2026-08-14T16:08:52",
    actor: "G. Phiri",
    role: "Ministry Submitter",
    action: "Document downloaded",
    target: "DOC-0198",
    objectVersion: "v1",
    ip: "10.44.1.23",
    device: "AGR-LT-0231 (managed laptop)",
    outcome: "Success",
    timeSource: CLOCK,
    severity: "warning",
  },
  {
    id: "AUD-4141",
    timestamp: "2026-08-14T16:06:18",
    actor: "G. Phiri",
    role: "Ministry Submitter",
    action: "Document downloaded",
    target: "DOC-0176",
    objectVersion: "v1",
    ip: "10.44.1.23",
    device: "AGR-LT-0231 (managed laptop)",
    outcome: "Success",
    timeSource: CLOCK,
    severity: "warning",
  },
  {
    id: "AUD-4140",
    timestamp: "2026-08-14T16:02:33",
    actor: "G. Phiri",
    role: "Ministry Submitter",
    action: "Document downloaded",
    target: "DOC-0142",
    objectVersion: "v1",
    ip: "10.44.1.23",
    device: "AGR-LT-0231 (managed laptop)",
    outcome: "Success",
    timeSource: CLOCK,
    severity: "warning",
  },
  {
    id: "AUD-4133",
    timestamp: "2026-08-14T11:20:06",
    actor: "Security & Audit",
    role: "Security Officer",
    action: "Independent integrity verification completed",
    target: "IVR-2026-0213",
    ip: "10.20.5.9",
    device: "SEC-WS-0002 (managed workstation)",
    outcome: "Success",
    timeSource: CLOCK,
    severity: "info",
  },
  {
    id: "AUD-4120",
    timestamp: "2026-08-14T09:41:15",
    actor: "Hon. Minister of Education",
    role: "Cabinet Member",
    action: "Print attempted — denied by handling policy",
    target: "DOC-0352",
    objectVersion: "v3",
    ip: "10.33.7.14",
    device: "EDU-TAB-0044 (managed tablet)",
    outcome: "Denied",
    timeSource: CLOCK,
    severity: "warning",
  },
  {
    id: "AUD-4098",
    timestamp: "2026-08-13T15:02:44",
    actor: "Larry",
    role: "Secretariat Administrator",
    action: "Annotation added to own copy",
    target: "DOC-0347",
    objectVersion: "v2",
    ip: "10.20.4.11",
    device: "SEC-LT-0114 (managed laptop)",
    outcome: "Success",
    timeSource: CLOCK,
    severity: "info",
  },
  {
    id: "AUD-4061",
    timestamp: "2026-08-12T09:12:31",
    actor: "Larry",
    role: "Secretariat Administrator",
    action: "Superseded version deleted from the reading room",
    target: "DOC-0333",
    objectVersion: "v1",
    ip: "10.20.4.11",
    device: "SEC-LT-0114 (managed laptop)",
    outcome: "Success",
    timeSource: CLOCK,
    severity: "warning",
  },
  {
    id: "AUD-4044",
    timestamp: "2026-08-11T14:33:09",
    actor: "P. Mwale",
    role: "Ministry Submitter",
    action: "New version uploaded",
    target: "DOC-0341",
    objectVersion: "v2",
    ip: "10.42.3.18",
    device: "FIN-LT-0177 (managed laptop)",
    outcome: "Success",
    timeSource: CLOCK,
    severity: "info",
  },
];
