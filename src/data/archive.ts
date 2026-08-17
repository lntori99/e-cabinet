/**
 * FR-SCH seed data — search and retrieval.
 *
 * Most of what the archive holds is composed live from the other apps: the
 * papers in FR-DOC, the decisions and actions in FR-DEC. What lives here is the
 * material those apps do not carry — the years before this console, the
 * full-text bodies, the OCR results and the query log — plus the two things the
 * archive owns outright: saved searches and the index itself.
 */
import type {
  ArchiveRecord,
  IndexSegment,
  QueryLogEntry,
  SavedSearch,
  SearchFilters,
} from "@/models/response/base-response";

/** NFR-PER-04. FR-SCH-08 measures every query against this. */
export const SEARCH_THRESHOLD_MS = 2000;

/** Below this an OCR result is flagged in the list rather than trusted. */
export const OCR_CONFIDENCE_FLOOR = 0.9;

export const EMPTY_FILTERS: SearchFilters = {
  kinds: ["Paper", "Decision", "Action"],
  ministry: "All",
  meeting: "All",
  classification: "All",
  status: "All",
  from: "",
  to: "",
};

/**
 * FR-SCH-04, FR-SCH-05 — the index is built and held inside the Malawi-hosted
 * environment, at the same standard as the repository it indexes.
 */
export const INDEX_POSTURE = {
  location: "Lilongwe production — same environment as the document repository",
  replication: "Blantyre disaster-recovery site, encrypted in transit",
  encryptionAtRest: "AES-256-GCM, keys held in the platform HSM",
  accessControl: "Index queries run under the requesting user's entitlements",
  externalCalls: "None. No content and no query leaves the environment.",
  analyser: "English and Chichewa stemming, built locally",
} as const;

export const seedIndexSegments: IndexSegment[] = [
  {
    kind: "Paper",
    documents: 486,
    terms: 1_284_900,
    sizeMb: 742.4,
    lastBuiltAt: "2026-08-15T04:00",
  },
  {
    kind: "Decision",
    documents: 312,
    terms: 96_400,
    sizeMb: 41.8,
    lastBuiltAt: "2026-08-15T04:00",
  },
  {
    kind: "Action",
    documents: 604,
    terms: 118_700,
    sizeMb: 33.2,
    lastBuiltAt: "2026-08-15T04:00",
  },
];

/**
 * Full text for the papers the repository holds. FR-SCH-03 — a paper is found
 * by what it says, not only by what it is called, so the archive carries the
 * body separately from the document record.
 */
export const PAPER_BODIES: Record<string, string> = {
  "DOC-0341":
    "The Phase III financing options set out three routes to completing the national fibre backbone: concessional borrowing against the existing facility, a public-private partnership on the northern corridor, and phased appropriation over three financial years. The paper recommends the third on the ground that it carries no contingent liability, and notes that the second would require an amendment to the Public Private Partnership Act.",
  "DOC-0344":
    "The Bill amends the Data Protection Act to establish an independent supervisory authority, to require notification of personal data breaches within seventy-two hours, and to create an offence of unlawful re-identification of anonymised data. Clause 14 extends the Act to processing carried out outside Malawi where the data subject is in Malawi.",
  "DOC-0347":
    "The procurement plan covers diagnostic equipment for twenty-eight district hospitals. Lots one and two are open international tender; lot three is restricted to suppliers with an in-country service presence, on the ground that maintenance response time has been the binding constraint on equipment availability.",
  "DOC-0349":
    "The framework review finds that teacher deployment continues to favour urban districts, with a pupil-teacher ratio of 41:1 in urban primary schools against 78:1 in the four northern rural districts. The review recommends a hardship allowance tied to distance from a district centre rather than to district classification.",
  "DOC-0355":
    "Malawi's positions ahead of the SADC Summit cover the regional trade protocol, the standby force contribution, and the tariff schedule under negotiation. The briefing note sets out where the national position differs from the regional consensus and what may be conceded.",
  "DOC-0352":
    "The mid-year budget performance review reports revenue at 94 per cent of the half-year target and recurrent expenditure at 103 per cent. The gap is attributed to the wage bill and to fuel subsidy arrears carried from the previous year. The review recommends holding the recurrent ceiling and re-phasing three development projects.",
  "DOC-0333":
    "Phase 4 of the e-Cabinet rollout covers the remaining eleven ministries, the Blantyre disaster-recovery environment and the secure room installations at Capital Hill. The report records that the Lilongwe production environment has been commissioned and that all indexing and conferencing infrastructure is hosted in country.",
  "DOC-0335":
    "The Blantyre disaster-recovery environment has been commissioned and tested against the recovery point and recovery time objectives. Replication from Lilongwe is continuous and encrypted in transit. A full failover exercise was conducted over a weekend window with no data loss.",
};

/**
 * Papers from before this console. They are in the archive and nowhere else,
 * which is what makes the by-year view worth looking at.
 */
export const seedHistoricalPapers: ArchiveRecord[] = [
  {
    id: "DOC-0198",
    kind: "Paper",
    title: "Cabinet Paper: Fertiliser Subsidy Programme — 2025/26 Design",
    body: "The programme design for 2025/26 sets the beneficiary target at 3.6 million farming households, reduces the subsidised price by fifteen per cent and moves redemption onto the national identity system. The paper notes that the previous season's exception rate at redemption was driven by duplicate registrations rather than by fraud at the depot.",
    ministry: "Agriculture",
    meetingId: "MTG-2025-041",
    meetingTitle: "41st Ordinary Cabinet Sitting",
    date: "2025-09-16",
    classification: "CONFIDENTIAL",
    status: "Circulated",
    entitledTo: ["Cabinet Members", "Secretariat", "Ministry of Agriculture"],
    pages: 34,
  },
  {
    id: "DOC-0176",
    kind: "Paper",
    title: "Cabinet Paper: National Health Insurance — Concept Note",
    body: "The concept note proposes a contributory national health insurance scheme with a subsidised premium for the indigent, administered by a new authority under the Ministry of Health. The note is silent on the wage bill implications of the administering authority, which the Ministry of Finance has asked to be costed before a framework is brought forward.",
    ministry: "Health",
    meetingId: "MTG-2025-036",
    meetingTitle: "36th Ordinary Cabinet Sitting",
    date: "2025-06-03",
    classification: "SECRET",
    status: "Circulated",
    entitledTo: ["Cabinet Members", "Secretariat"],
    pages: 22,
  },
  {
    id: "DOC-0142",
    kind: "Paper",
    title: "Annex: Lilongwe Western Bypass — Feasibility Study (scanned)",
    body: "The feasibility study assesses three alignments for the western bypass. Alignment B carries the lowest resettlement burden at 214 households and the highest construction cost. Traffic modelling projects a twenty-two per cent reduction in heavy goods movement through the city centre by the fifth year of operation.",
    ministry: "Transport",
    meetingId: "MTG-2025-028",
    meetingTitle: "28th Ordinary Cabinet Sitting",
    date: "2025-02-18",
    classification: "RESTRICTED",
    status: "Circulated",
    entitledTo: ["Cabinet Members", "Secretariat", "Ministry of Transport"],
    // FR-SCH-09 — a bound study, scanned. The text below is what OCR recovered.
    ocr: { pages: 118, confidence: 0.83, processedAt: "2026-03-04T22:15" },
    pages: 118,
  },
  {
    id: "DOC-0119",
    kind: "Paper",
    title: "Annex: District Hospital Equipment Inventory 2024 (scanned)",
    body: "The inventory records equipment holdings by district hospital as at December 2024, with condition and last service date. Twelve of the twenty-eight hospitals report no functioning theatre-grade anaesthetic machine.",
    ministry: "Health",
    meetingId: "MTG-2024-052",
    meetingTitle: "52nd Ordinary Cabinet Sitting",
    date: "2024-11-12",
    classification: "OFFICIAL",
    status: "Circulated",
    entitledTo: ["Cabinet Members", "Secretariat", "Ministry of Health"],
    ocr: { pages: 64, confidence: 0.96, processedAt: "2026-02-19T03:40" },
    pages: 64,
  },
  {
    id: "DOC-0088",
    kind: "Paper",
    title: "Cabinet Paper: Public Private Partnership Act — Review",
    body: "The review of the Public Private Partnership Act finds the approval pathway unclear where a partnership crosses two ministries, and recommends that the Public Private Partnership Commission be given a statutory role at the appraisal stage rather than at financial close.",
    ministry: "Finance & Economic Affairs",
    meetingId: "MTG-2024-031",
    meetingTitle: "31st Ordinary Cabinet Sitting",
    date: "2024-05-21",
    classification: "CONFIDENTIAL",
    status: "Circulated",
    entitledTo: ["Cabinet Members", "Secretariat"],
    pages: 41,
  },
  {
    id: "DOC-0301",
    kind: "Paper",
    title: "Briefing: Presidency Security Posture Review",
    body: "Withheld from this viewer by entitlement.",
    ministry: "Office of the President & Cabinet",
    meetingId: "MTG-2026-016",
    meetingTitle: "Presidency Security Briefing",
    date: "2026-07-09",
    classification: "TOP SECRET — CABINET",
    status: "Circulated",
    // FR-SCH-02 — the viewer is not on this list, so the record never reaches
    // the result set. Nothing in the interface counts it or names it.
    entitledTo: ["His Excellency the President", "Chief Secretary", "Security & Audit"],
    pages: 19,
  },
];

/**
 * Historical actions closed before this console. FR-SCH-01 asks for action
 * records to be searchable, and the ones worth searching are mostly the old
 * ones — a live action is found in FR-DEC, not here.
 */
export const seedHistoricalActions: ArchiveRecord[] = [
  {
    id: "ACT-2025-0912",
    kind: "Action",
    title: "Move fertiliser redemption onto the national identity system.",
    body: "Integrate the redemption terminal at each depot with the national identity system and report the duplicate registration rate before the season opens. Closed on evidence AGR/RED/2025/210 — integration completed at 412 of 419 depots, the remainder served by offline batch reconciliation.",
    ministry: "Ministry of Agriculture",
    meetingId: "MTG-2025-041",
    meetingTitle: "41st Ordinary Cabinet Sitting",
    date: "2025-11-28",
    classification: "CONFIDENTIAL",
    status: "Closed",
    entitledTo: ["Cabinet Members", "Secretariat", "Ministry of Agriculture"],
  },
  {
    id: "ACT-2025-0744",
    kind: "Action",
    title: "Cost the administering authority for national health insurance.",
    body: "Provide the establishment cost and recurrent wage bill implication of a national health insurance authority over five years. Closed on evidence FIN/EST/2025/166 — costed at MK 14.2 billion establishment and MK 3.8 billion recurrent, against three staffing scenarios.",
    ministry: "Ministry of Finance",
    meetingId: "MTG-2025-036",
    meetingTitle: "36th Ordinary Cabinet Sitting",
    date: "2025-08-14",
    classification: "SECRET",
    status: "Closed",
    entitledTo: ["Cabinet Members", "Secretariat"],
  },
  {
    id: "ACT-2024-0517",
    kind: "Action",
    title: "Give the PPP Commission a statutory role at appraisal.",
    body: "Prepare amending instructions to the Public Private Partnership Act giving the Commission a statutory role at the appraisal stage. Closed on evidence JUS/DRF/2024/301 — drafting instructions issued to the Law Commission.",
    ministry: "Ministry of Justice",
    meetingId: "MTG-2024-031",
    meetingTitle: "31st Ordinary Cabinet Sitting",
    date: "2024-09-30",
    classification: "CONFIDENTIAL",
    status: "Closed",
    entitledTo: ["Cabinet Members", "Secretariat"],
  },
];

/**
 * Decisions from earlier sittings, held for the record. The current cycle's
 * decisions come from FR-DEC rather than from here.
 */
export const seedHistoricalDecisions: ArchiveRecord[] = [
  {
    id: "DEC-2026-0061",
    kind: "Decision",
    title: "National Health Insurance Framework — first reading",
    body: "Cabinet deferred the framework on first reading and directed the Ministry of Finance to cost the administering authority before the framework returns.",
    ministry: "Ministry of Health",
    meetingId: "MTG-2026-011",
    meetingTitle: "11th Ordinary Cabinet Sitting",
    date: "2026-06-02",
    classification: "SECRET",
    status: "Finalised · Deferred",
    entitledTo: ["Cabinet Members", "Secretariat"],
  },
  {
    id: "DEC-2026-0042",
    kind: "Decision",
    title: "Fertiliser Subsidy Programme — 2025/26 outturn",
    body: "Cabinet noted the 2025/26 outturn, recording 3.54 million households served against a target of 3.6 million, and asked that the exception rate at redemption be reported with the 2026/27 design.",
    ministry: "Ministry of Agriculture",
    meetingId: "MTG-2026-009",
    meetingTitle: "9th Ordinary Cabinet Sitting",
    date: "2026-04-14",
    classification: "CONFIDENTIAL",
    status: "Finalised · Noted",
    entitledTo: ["Cabinet Members", "Secretariat", "Ministry of Agriculture"],
  },
  {
    id: "DEC-2025-0388",
    kind: "Decision",
    title: "Public Private Partnership Act — review",
    body: "Cabinet approved the recommendations of the review and directed the Ministry of Justice to prepare amending instructions giving the Commission a statutory role at appraisal.",
    ministry: "Ministry of Justice",
    meetingId: "MTG-2024-031",
    meetingTitle: "31st Ordinary Cabinet Sitting",
    date: "2024-05-21",
    classification: "CONFIDENTIAL",
    status: "Finalised · Approved",
    entitledTo: ["Cabinet Members", "Secretariat"],
  },
];

/** FR-SCH-07 */
export const seedSavedSearches: SavedSearch[] = [
  {
    id: "SS-0011",
    name: "Fertiliser subsidy — everything",
    owner: "Larry",
    role: "Secretariat Administrator",
    query: "fertiliser subsidy",
    filters: { ...EMPTY_FILTERS },
    createdAt: "2026-06-11T09:20",
    lastRunAt: "2026-08-14T08:05",
    lastResultCount: 7,
  },
  {
    id: "SS-0014",
    name: "Health papers awaiting a decision",
    owner: "Larry",
    role: "Secretariat Administrator",
    query: "",
    filters: {
      ...EMPTY_FILTERS,
      kinds: ["Paper"],
      ministry: "Health",
    },
    createdAt: "2026-07-02T14:40",
    lastRunAt: "2026-08-12T11:15",
    lastResultCount: 3,
  },
  {
    id: "SS-0019",
    name: "Wage bill, this financial year",
    owner: "Larry",
    role: "Secretariat Administrator",
    query: "wage bill",
    filters: { ...EMPTY_FILTERS, from: "2026-04-01", to: "2027-03-31" },
    createdAt: "2026-08-01T10:02",
    lastRunAt: "2026-08-15T07:44",
    lastResultCount: 4,
  },
];

/** FR-SCH-06, FR-SCH-08 — the log the audit trail is built from. */
export const seedQueryLog: QueryLogEntry[] = [
  {
    id: "QL-2026-0912",
    at: "2026-08-15T07:44",
    actor: "Larry",
    role: "Secretariat Administrator",
    query: "wage bill",
    filterSummary: "2026-04-01 to 2027-03-31",
    resultCount: 4,
    elapsedMs: 312,
  },
  {
    id: "QL-2026-0911",
    at: "2026-08-14T16:31",
    actor: "P. Mwale",
    role: "Ministry Submitter",
    query: "recurrent ceiling",
    filterSummary: "Papers · Finance & Economic Affairs",
    resultCount: 2,
    elapsedMs: 268,
  },
  {
    id: "QL-2026-0910",
    at: "2026-08-14T08:05",
    actor: "Larry",
    role: "Secretariat Administrator",
    query: "fertiliser subsidy",
    filterSummary: "All record types",
    resultCount: 7,
    elapsedMs: 441,
  },
  {
    id: "QL-2026-0909",
    at: "2026-08-13T15:12",
    actor: "Chief Secretary",
    role: "Chief Secretary",
    query: "actuarial assessment",
    filterSummary: "Decisions, Actions",
    resultCount: 3,
    elapsedMs: 205,
  },
  {
    id: "QL-2026-0908",
    at: "2026-08-13T09:58",
    actor: "Larry",
    role: "Secretariat Administrator",
    query: "bypass alignment resettlement",
    filterSummary: "Papers · includes scanned annexes",
    resultCount: 1,
    elapsedMs: 2_140,
  },
  {
    id: "QL-2026-0907",
    at: "2026-08-12T11:15",
    actor: "Larry",
    role: "Secretariat Administrator",
    query: "",
    filterSummary: "Papers · Health",
    resultCount: 3,
    elapsedMs: 189,
  },
  {
    id: "QL-2026-0906",
    at: "2026-08-11T13:26",
    actor: "Security & Audit",
    role: "Security Officer",
    query: "classification downgrade",
    filterSummary: "All record types",
    resultCount: 0,
    elapsedMs: 174,
  },
];

/**
 * FR-SCH-02 — who this viewer is, for entitlement scoping. Read from the
 * session once a real IdP is wired in; the filter itself does not change.
 */
export const VIEWER_ENTITLEMENTS = ["Cabinet Members", "Secretariat"];
