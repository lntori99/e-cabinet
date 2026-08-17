/**
 * FR-DAT seed data — data governance, retention, archival and continuity.
 *
 * Chosen so each screen has something real to say: records that have already
 * passed their expiry and are held only by a legal hold, a deletion waiting on
 * a second authority, a restore test that passed with findings, a replication
 * target running behind, and one custodian unavailable. The residency register
 * is the one place nothing is wrong, because under FR-DAT-06 anything wrong
 * there would be a breach rather than a finding.
 */
import type {
  ArchivalTransfer,
  BackupSet,
  DeletionRequest,
  KeyCustodian,
  LegalHold,
  PersonalDataFinding,
  RecordKind,
  RecoveryProcedure,
  RecoveryTest,
  ReplicationTarget,
  ResidencyRecord,
  RetainedRecord,
  RetentionClassDef,
} from "@/models/response/base-response";

/** FR-DAT-02 — the six kinds the requirement names. All must be preserved. */
export const RECORD_KINDS: RecordKind[] = [
  "Paper",
  "Pack",
  "Decision",
  "Action",
  "Attendance",
  "Audit",
];

/** How close to expiry counts as "approaching", in days. */
export const APPROACHING_DAYS = 180;

export const seedRetentionClasses: RetentionClassDef[] = [
  {
    id: "RC-PERM",
    name: "Permanent — National Archives",
    years: 999,
    appliesTo: ["Decision", "Attendance", "Audit"],
    disposalAction: "Transfer to the National Archives",
    rules: [
      "Never destroyed by the platform, at any classification",
      "Transferred to the National Archives with metadata, classification and audit linkage intact",
      "A legal hold cannot shorten it and does not need to lengthen it",
    ],
    authority: "National Archives Act — permanent preservation",
  },
  {
    id: "RC-25",
    name: "Twenty-five years",
    years: 25,
    appliesTo: ["Paper", "Pack", "Decision"],
    disposalAction: "Transfer to the National Archives",
    rules: [
      "Held for twenty-five years from the date of the sitting it belongs to",
      "Reviewed for permanent preservation before transfer",
      "The audit events describing it outlive it — they are held permanently",
    ],
    authority: "Government records schedule, class B",
  },
  {
    id: "RC-7",
    name: "Seven years",
    years: 7,
    appliesTo: ["Action", "Attendance"],
    disposalAction: "Destroy",
    rules: [
      "Destroyed at the end of the period unless a hold is in force",
      "Destruction requires an approved request and two people to carry out",
      "The audit record of the destruction is itself permanent",
    ],
    authority: "Government records schedule, class D",
  },
  {
    id: "RC-3",
    name: "Three years — working material",
    years: 3,
    appliesTo: ["Paper"],
    disposalAction: "Review",
    rules: [
      "Drafts, superseded versions and working annexes",
      "Reviewed at three years; kept only where the review says so",
      "Nothing that reached a pack falls in this class",
    ],
    authority: "Government records schedule, class E",
  },
];

export const seedRetainedRecords: RetainedRecord[] = [
  {
    id: "DEC-2026-0087",
    kind: "Decision",
    title: "Mid-Year Budget Review 2026/27",
    classification: "SECRET",
    createdAt: "2026-08-04",
    retentionClassId: "RC-PERM",
    expiresAt: null,
  },
  {
    id: "DEC-2026-0089",
    kind: "Decision",
    title: "Fertiliser Subsidy Programme — 2026/27 Season",
    classification: "CONFIDENTIAL",
    createdAt: "2026-08-04",
    retentionClassId: "RC-PERM",
    expiresAt: null,
  },
  {
    id: "DOC-0341",
    kind: "Paper",
    title: "National Fibre Backbone Phase III Financing Options",
    classification: "SECRET",
    createdAt: "2026-08-10",
    retentionClassId: "RC-25",
    expiresAt: "2051-08-10",
  },
  {
    id: "PCK-2026-014-B",
    kind: "Pack",
    title: "14th Ordinary Cabinet Sitting — pack, version B",
    classification: "SECRET",
    createdAt: "2026-08-14",
    retentionClassId: "RC-25",
    expiresAt: "2051-08-14",
  },
  {
    id: "DOC-0119",
    kind: "Paper",
    title: "District Hospital Equipment Inventory 2024 (scanned annexe)",
    classification: "OFFICIAL",
    createdAt: "2024-11-12",
    retentionClassId: "RC-3",
    // Already past its date. Held only because a hold is in force.
    expiresAt: "2027-11-12",
  },
  {
    id: "DOC-0088",
    kind: "Paper",
    title: "Public Private Partnership Act — Review",
    classification: "CONFIDENTIAL",
    createdAt: "2024-05-21",
    retentionClassId: "RC-3",
    expiresAt: "2027-05-21",
  },
  {
    id: "ACT-2019-0442",
    kind: "Action",
    title: "Publish the revised procurement thresholds",
    classification: "CONFIDENTIAL",
    createdAt: "2019-03-11",
    retentionClassId: "RC-7",
    expiresAt: "2026-03-11",
  },
  {
    id: "ACT-2019-0518",
    kind: "Action",
    title: "Report on the district road maintenance backlog",
    classification: "CONFIDENTIAL",
    createdAt: "2019-07-02",
    retentionClassId: "RC-7",
    expiresAt: "2026-07-02",
  },
  {
    id: "ACT-2019-0603",
    kind: "Action",
    title: "Commission the northern corridor feasibility study",
    classification: "RESTRICTED",
    createdAt: "2019-01-19",
    retentionClassId: "RC-7",
    // Its seven years ran out in January. It is still here because LH-2026-002
    // suspends the disposal, which is what a hold is for.
    expiresAt: "2026-01-19",
    holdId: "LH-2026-002",
  },
  {
    id: "ATT-2019-0044",
    kind: "Attendance",
    title: "44th Ordinary Cabinet Sitting — attendance record",
    classification: "CONFIDENTIAL",
    createdAt: "2019-09-04",
    retentionClassId: "RC-7",
    expiresAt: "2026-09-04",
  },
  {
    id: "ATT-2026-0013",
    kind: "Attendance",
    title: "13th Ordinary Cabinet Sitting — attendance record",
    classification: "CONFIDENTIAL",
    createdAt: "2026-08-04",
    retentionClassId: "RC-PERM",
    expiresAt: null,
  },
  {
    id: "AUD-RANGE-2024",
    kind: "Audit",
    title: "Audit events, calendar year 2024",
    classification: "OFFICIAL",
    createdAt: "2024-12-31",
    retentionClassId: "RC-PERM",
    expiresAt: null,
  },
  {
    id: "DOC-0198",
    kind: "Paper",
    title: "Fertiliser Subsidy Programme — 2025/26 Design",
    classification: "CONFIDENTIAL",
    createdAt: "2025-09-16",
    retentionClassId: "RC-25",
    expiresAt: "2050-09-16",
  },
  {
    id: "ACT-2018-0221",
    kind: "Action",
    title: "Establish the inter-ministerial water task force",
    classification: "RESTRICTED",
    createdAt: "2018-06-14",
    retentionClassId: "RC-7",
    // Transferred and gone from the live store.
    expiresAt: "2025-06-14",
    transferId: "ARC-2025-0007",
  },
];

export const seedHolds: LegalHold[] = [
  {
    id: "LH-2026-002",
    name: "Northern corridor procurement enquiry",
    raisedBy: "Attorney General",
    authority: "Commission of Inquiry (Northern Corridor) Order, 2026",
    raisedAt: "2026-05-20",
    scope:
      "Every record touching the northern corridor feasibility study and the procurement that followed it.",
    recordIds: ["ACT-2019-0603"],
    state: "In force",
  },
  {
    id: "LH-2025-011",
    name: "Fertiliser distribution audit",
    raisedBy: "Auditor General",
    authority: "Public Audit Act, section 12 — production notice",
    raisedAt: "2025-11-03",
    scope: "Subsidy programme design and outturn records for 2024/25 and 2025/26.",
    recordIds: ["DOC-0198"],
    state: "Lifted",
    liftedAt: "2026-06-30",
    liftedBy: "Auditor General",
  },
];

export const seedTransfers: ArchivalTransfer[] = [
  {
    id: "ARC-2025-0007",
    transferredAt: "2025-07-02",
    destination: "National Archives of Malawi — Zomba",
    recordIds: ["ACT-2018-0221"],
    metadataPreserved: true,
    classificationPreserved: true,
    auditLinkagePreserved: true,
    manifestDigest:
      "sha256:41b9c07e35d82a6f19c4e0b73d158a6c2790eb5147da3b862f0c19de4a85b703",
    acceptedBy: "Director, National Archives",
    acceptedAt: "2025-07-09",
  },
  {
    id: "ARC-2024-0003",
    transferredAt: "2024-11-18",
    destination: "National Archives of Malawi — Zomba",
    recordIds: ["ATT-2017-0091", "ATT-2017-0092", "ATT-2017-0093"],
    metadataPreserved: true,
    classificationPreserved: true,
    auditLinkagePreserved: true,
    manifestDigest:
      "sha256:8d3f26a1904cb75e0f2d8641bc93705ae2f18c40db765932ea814cf07b6d2915",
    acceptedBy: "Director, National Archives",
    acceptedAt: "2024-11-27",
  },
];

export const seedDeletions: DeletionRequest[] = [
  {
    id: "DEL-2026-0004",
    requestedBy: "Larry (Secretariat)",
    requestedAt: "2026-08-14T14:20",
    scope: "Three action records past their seven-year period, no hold in force",
    recordIds: ["ACT-2019-0442", "ACT-2019-0518", "ATT-2019-0044"],
    reason:
      "End of the retention period under class D. Reviewed and not marked for permanent preservation.",
    state: "Awaiting approval",
  },
  {
    id: "DEL-2026-0002",
    requestedBy: "R. Kamanga (Technical Administrator)",
    requestedAt: "2026-06-11T09:40",
    scope: "One working draft superseded before it reached a pack",
    recordIds: ["DOC-0291"],
    reason: "Superseded working material at the end of the three-year class.",
    state: "Executed",
    approver: "Chief Secretary",
    decidedAt: "2026-06-12T11:05",
    decisionNote: "Approved. Confirmed the draft never formed part of a released pack.",
    executedBy: "Larry (Secretariat)",
    executedAt: "2026-06-12T15:30",
  },
  {
    id: "DEL-2026-0001",
    requestedBy: "R. Kamanga (Technical Administrator)",
    requestedAt: "2026-04-02T16:15",
    scope: "A block of attendance records from 2019",
    recordIds: ["ATT-2019-0031", "ATT-2019-0032"],
    reason: "Retention period reached.",
    state: "Rejected",
    approver: "Chief Secretary",
    decidedAt: "2026-04-03T10:20",
    decisionNote:
      "Refused. Two of these attendance records relate to a sitting under enquiry and fall inside the hold raised in May. Resubmit once the hold is lifted.",
  },
];

/** FR-DAT-07 — Release 2. */
export const seedPersonalData: PersonalDataFinding[] = [
  {
    id: "PII-0011",
    recordId: "ATT-2026-0013",
    recordTitle: "13th Ordinary Cabinet Sitting — attendance record",
    category: "Names and official roles of attendees",
    subjects: 14,
    basis: "Public task — the conduct of Cabinet business",
    detectedAt: "2026-08-05",
    confirmed: true,
  },
  {
    id: "PII-0009",
    recordId: "DOC-0198",
    recordTitle: "Fertiliser Subsidy Programme — 2025/26 Design",
    category: "Beneficiary identifiers referenced in an annexe",
    subjects: 3_600_000,
    basis: "Public task — administration of a national subsidy",
    detectedAt: "2026-07-14",
    confirmed: true,
  },
  {
    id: "PII-0007",
    recordId: "DOC-0119",
    recordTitle: "District Hospital Equipment Inventory 2024 (scanned annexe)",
    category: "Staff names in a scanned signature block",
    subjects: 28,
    basis: "Public task",
    detectedAt: "2026-03-04",
    // Recovered by OCR, so the finding needs a person to look at it.
    confirmed: false,
  },
];

export const seedBackups: BackupSet[] = [
  {
    id: "BK-2026-0815",
    name: "Nightly full — 15 August",
    takenAt: "2026-08-15T02:14",
    sizeGb: 812.4,
    location: "Lilongwe — PowerProtect DD6400",
    encrypted: true,
    immutable: true,
    monitored: true,
    verifiedAt: "2026-08-15T03:02",
    state: "Verified",
    retainUntil: "2026-09-14",
  },
  {
    id: "BK-2026-0814",
    name: "Nightly full — 14 August",
    takenAt: "2026-08-14T02:11",
    sizeGb: 809.7,
    location: "Lilongwe — PowerProtect DD6400",
    encrypted: true,
    immutable: true,
    monitored: true,
    verifiedAt: "2026-08-14T02:58",
    state: "Verified",
    retainUntil: "2026-09-13",
  },
  {
    id: "BK-2026-W33",
    name: "Weekly offsite — week 33",
    takenAt: "2026-08-10T01:00",
    sizeGb: 806.2,
    location: "Blantyre — write-once vault",
    encrypted: true,
    immutable: true,
    monitored: true,
    verifiedAt: "2026-08-10T04:41",
    state: "Verified",
    retainUntil: "2027-08-10",
  },
  {
    id: "BK-2026-0813",
    name: "Nightly full — 13 August",
    takenAt: "2026-08-13T02:09",
    sizeGb: 804.9,
    location: "Lilongwe — PowerProtect DD6400",
    encrypted: true,
    immutable: true,
    monitored: true,
    state: "Unverified",
    retainUntil: "2026-09-12",
  },
];

export const seedRecoveryTests: RecoveryTest[] = [
  {
    id: "RT-2026-0009",
    kind: "Restore",
    at: "2026-07-26T22:00",
    scope: "Full document repository and database, restored into staging",
    result: "Passed",
    durationMinutes: 214,
    rpoAchievedMinutes: 4,
    rtoAchievedMinutes: 214,
    findings: [],
    evidenceRef: "OPS/RST/2026/009",
    witnessedBy: "Security & Audit",
    goLiveGate: true,
  },
  {
    id: "RT-2026-0007",
    kind: "Restore",
    at: "2026-05-17T22:00",
    scope: "Document repository only",
    result: "Passed with findings",
    durationMinutes: 168,
    rpoAchievedMinutes: 6,
    rtoAchievedMinutes: 168,
    findings: [
      "Search index had to be rebuilt after the restore; not covered by the documented procedure at the time",
      "Procedure updated on 2026-05-20 to include the rebuild step",
    ],
    evidenceRef: "OPS/RST/2026/007",
    witnessedBy: "Security & Audit",
    goLiveGate: false,
  },
  {
    id: "FO-2026-0002",
    kind: "Failover",
    at: "2026-06-20T22:00",
    scope: "Partial — database and application tier to Blantyre, repository left in place",
    result: "Passed with findings",
    durationMinutes: 47,
    rtoAchievedMinutes: 47,
    findings: [
      "Conferencing service did not follow; media nodes are not yet replicated",
      "Full-service failover is Release 2 and remains untested",
    ],
    evidenceRef: "OPS/FO/2026/002",
    witnessedBy: "Security & Audit",
    goLiveGate: false,
  },
];

export const seedReplication: ReplicationTarget[] = [
  {
    id: "REP-CFG",
    component: "Application configuration",
    from: "Lilongwe production",
    to: "Blantyre disaster recovery",
    mode: "Continuous",
    lagSeconds: 2,
    lastVerifiedAt: "2026-08-15T09:00",
    healthy: true,
    note: "Configuration changes reach Blantyre within seconds of being applied.",
  },
  {
    id: "REP-DB",
    component: "Database",
    from: "Lilongwe production",
    to: "Blantyre disaster recovery",
    mode: "Continuous",
    lagSeconds: 3,
    lastVerifiedAt: "2026-08-15T09:00",
    healthy: true,
    note: "Streaming replication, encrypted in transit.",
  },
  {
    id: "REP-DOC",
    component: "Document repository",
    from: "Lilongwe production",
    to: "Blantyre disaster recovery",
    mode: "Continuous",
    lagSeconds: 412,
    lastVerifiedAt: "2026-08-15T09:00",
    healthy: false,
    note: "Behind since the overnight OCR run added 40 GB of scanned annexes. Catching up.",
  },
];

/** Objectives the procedure is measured against, in minutes. */
export const RPO_TARGET_MINUTES = 15;
export const RTO_TARGET_MINUTES = 240;

export const RECOVERY_PROCEDURE: RecoveryProcedure = {
  rpoMinutes: RPO_TARGET_MINUTES,
  rtoMinutes: RTO_TARGET_MINUTES,
  decisionAuthority: "Chief Secretary",
  authorityChain: [
    "Chief Secretary",
    "Secretary to Cabinet",
    "Head of ICT, Office of the President & Cabinet",
  ],
  steps: [
    {
      order: 1,
      step: "Declare the disaster and record the declaration, with the time and the authority.",
      owner: "Chief Secretary",
      minutes: 10,
    },
    {
      order: 2,
      step: "Confirm the Lilongwe environment is unrecoverable within the recovery time objective.",
      owner: "Head of ICT",
      minutes: 20,
    },
    {
      order: 3,
      step: "Promote the Blantyre database replica and verify the last committed transaction.",
      owner: "Technical Administrator",
      minutes: 30,
    },
    {
      order: 4,
      step: "Bring up the application tier at Blantyre and verify the configuration matches.",
      owner: "Technical Administrator",
      minutes: 45,
    },
    {
      order: 5,
      step: "Verify the document repository and reconcile against the audit chain head.",
      owner: "Technical Administrator",
      minutes: 60,
    },
    {
      order: 6,
      step: "Reconstitute key material with the custodian quorum.",
      owner: "Key custodians",
      minutes: 45,
    },
    {
      order: 7,
      step: "Confirm service and notify. Record the recovery point actually achieved.",
      owner: "Head of ICT",
      minutes: 30,
    },
  ],
  communication: [
    {
      audience: "Cabinet Members",
      channel: "SMS, then in-platform once service is up",
      timing: "Within 30 minutes of the declaration",
    },
    {
      audience: "Ministry Submitters",
      channel: "Email",
      timing: "Within 60 minutes",
    },
    {
      audience: "Office of the President & Cabinet",
      channel: "Telephone to the Chief Secretary's office",
      timing: "Immediately on declaration",
    },
    {
      audience: "Security & Audit",
      channel: "Email and telephone",
      timing: "Immediately on declaration, and at each step completion",
    },
  ],
  lastReviewedAt: "2026-07-30",
  approvedBy: "Chief Secretary",
  documentRef: "OPC/DR/2026/rev4",
};

/** FR-DAT-13 — three of five shares reconstitute the master key. */
export const KEY_QUORUM = { required: 3, total: 5 };

export const seedCustodians: KeyCustodian[] = [
  {
    id: "KC-01",
    name: "Chief Secretary",
    role: "Office of the President & Cabinet",
    custody: "Sealed envelope, OPC safe",
    lastVerifiedAt: "2026-07-30",
    available: true,
  },
  {
    id: "KC-02",
    name: "Secretary to Cabinet",
    role: "Office of the President & Cabinet",
    custody: "Sealed envelope, OPC safe",
    lastVerifiedAt: "2026-07-30",
    available: true,
  },
  {
    id: "KC-03",
    name: "Head of ICT",
    role: "Office of the President & Cabinet",
    custody: "Hardware token, Capital Hill secure store",
    lastVerifiedAt: "2026-07-30",
    available: true,
  },
  {
    id: "KC-04",
    name: "Security & Audit lead",
    role: "Security and audit",
    custody: "Hardware token, Capital Hill secure store",
    lastVerifiedAt: "2026-07-30",
    available: true,
  },
  {
    id: "KC-05",
    name: "Director, Reserve Bank operations",
    role: "External custodian",
    custody: "Sealed envelope, Reserve Bank vault",
    // On secondment. Four available custodians still clears the quorum of three.
    lastVerifiedAt: "2026-02-11",
    available: false,
  },
];

/** FR-DAT-06 — every store, and where it physically sits. */
export const seedResidency: ResidencyRecord[] = [
  {
    id: "RES-DOC",
    store: "Document repository",
    contents: "Cabinet papers, packs, annexes and every version of each",
    site: "Lilongwe production data centre",
    country: "Malawi",
    operator: "Government of Malawi, operated under contract by Bahamus Limited",
    leavesMalawi: false,
    note: "No object storage tier outside the country, and no content delivery cache.",
  },
  {
    id: "RES-DB",
    store: "Application database",
    contents: "Meetings, agendas, decisions, actions, attendance and configuration",
    site: "Lilongwe production data centre",
    country: "Malawi",
    operator: "Government of Malawi, operated under contract by Bahamus Limited",
    leavesMalawi: false,
    note: "Replicated only to Blantyre.",
  },
  {
    id: "RES-AUD",
    store: "Audit store",
    contents: "Every audit event, held permanently",
    site: "Lilongwe production, replicated to a write-once store at Blantyre",
    country: "Malawi",
    operator: "Government of Malawi",
    leavesMalawi: false,
    note: "The write-once copy is outside the platform administrators' reach and inside the country.",
  },
  {
    id: "RES-IDX",
    store: "Search index",
    contents: "Full text of papers, decisions and actions",
    site: "Lilongwe production data centre",
    country: "Malawi",
    operator: "Government of Malawi, operated under contract by Bahamus Limited",
    leavesMalawi: false,
    note: "Indexing runs locally. No query and no content is sent to an external service.",
  },
  {
    id: "RES-BK",
    store: "Backups",
    contents: "Nightly full backups and the weekly offsite copy",
    site: "Lilongwe PowerProtect appliance; weekly copy to the Blantyre vault",
    country: "Malawi",
    operator: "Government of Malawi",
    leavesMalawi: false,
    note: "No cloud backup target. The offsite copy is a second Malawian site, not a foreign one.",
  },
  {
    id: "RES-VID",
    store: "Conferencing media and recordings",
    contents: "Session media, and recordings where the approved path was followed",
    site: "Lilongwe production data centre",
    country: "Malawi",
    operator: "Government of Malawi, operated under contract by Bahamus Limited",
    leavesMalawi: false,
    note: "Media is relayed in country. No third-party conferencing service is involved.",
  },
];
