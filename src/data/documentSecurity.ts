import type { Classification } from "@/core/app-constants";
import type {
  AccessExpiry,
  EncryptionLayer,
  HandlingDay,
  HandlingRule,
  KeyRecord,
  OfflineGrant,
  ReclassificationRequest,
  Revocation,
  SecureEndpoint,
  TransferRecord,
  WatermarkPolicy,
} from "@/models/response/base-response";

/**
 * FR DOC configuration and seed state.
 *
 * The handling matrix is the centre of it: FR-DOC-02 makes classification the
 * operative input to access, download, print, offline, retention and recording,
 * so those decisions are read from one table rather than scattered through the
 * screens that enforce them.
 */

/** FR-DOC-01 — defaults applied when a paper is created for a meeting type. */
export const CLASSIFICATION_DEFAULTS: {
  meetingType: string;
  classification: Classification;
}[] = [
  { meetingType: "Full Cabinet", classification: "TOP SECRET — CABINET" },
  { meetingType: "Cabinet Committee", classification: "SECRET" },
  { meetingType: "Emergency Session", classification: "TOP SECRET — CABINET" },
  { meetingType: "Inter-Ministerial Briefing", classification: "CONFIDENTIAL" },
  { meetingType: "Presidency Briefing", classification: "TOP SECRET — CABINET" },
];

/** FR-DOC-02 / 10 / 11 / 13 */
export const HANDLING_RULES: HandlingRule[] = [
  {
    classification: "TOP SECRET — CABINET",
    whoMayView: "Named participants of the sitting only",
    download: "Blocked",
    print: "Blocked",
    offline: "Blocked",
    recording: "Blocked",
    retentionDays: 0,
    watermark: true,
  },
  {
    classification: "SECRET",
    whoMayView: "Participants and the Secretariat",
    download: "Blocked",
    print: "Authorised roles",
    offline: "Blocked",
    recording: "Blocked",
    retentionDays: 7,
    watermark: true,
  },
  {
    classification: "CONFIDENTIAL",
    whoMayView: "Participants, Secretariat and the originating ministry",
    download: "Authorised roles",
    print: "Authorised roles",
    offline: "Authorised roles",
    recording: "Blocked",
    retentionDays: 30,
    watermark: true,
  },
  {
    classification: "RESTRICTED",
    whoMayView: "Any authorised platform user with a business need",
    download: "Permitted",
    print: "Permitted",
    offline: "Authorised roles",
    recording: "Authorised roles",
    retentionDays: 90,
    watermark: true,
  },
  {
    classification: "OFFICIAL",
    whoMayView: "Any authorised platform user",
    download: "Permitted",
    print: "Permitted",
    offline: "Permitted",
    recording: "Permitted",
    retentionDays: 365,
    watermark: false,
  },
];

export function handlingRule(classification: string): HandlingRule {
  return (
    HANDLING_RULES.find((r) => r.classification === classification) ??
    HANDLING_RULES[0]
  );
}

/** FR-DOC-08 / 09 */
export const WATERMARK_POLICIES: WatermarkPolicy[] = [
  {
    classification: "TOP SECRET — CABINET",
    onView: true,
    onPrint: true,
    fields: ["User identity", "Date and time", "Meeting reference", "Classification"],
  },
  {
    classification: "SECRET",
    onView: true,
    onPrint: true,
    fields: ["User identity", "Date and time", "Meeting reference", "Classification"],
  },
  {
    classification: "CONFIDENTIAL",
    onView: true,
    onPrint: true,
    fields: ["User identity", "Date and time", "Classification"],
  },
  {
    classification: "RESTRICTED",
    onView: false,
    onPrint: true,
    fields: ["User identity", "Date and time"],
  },
  { classification: "OFFICIAL", onView: false, onPrint: false, fields: [] },
];

/** FR-DOC-03 / 04 */
export const seedReclassifications: ReclassificationRequest[] = [
  {
    id: "RCL-018",
    documentId: "DOC-0344",
    documentTitle: "Draft Bill: Data Protection (Amendment) Bill, 2026",
    from: "CONFIDENTIAL",
    to: "SECRET",
    direction: "Raised",
    reason:
      "The Bill now carries the cross-border transfer schedule, which engages the SADC negotiating position. Confidential is no longer sufficient.",
    requestedBy: "L. Banda",
    requestedAt: "2026-08-14T09:20",
    status: "Pending",
  },
  {
    id: "RCL-017",
    documentId: "DOC-0349",
    documentTitle: "Progress Report: e-Cabinet Rollout Phase 4",
    from: "CONFIDENTIAL",
    to: "RESTRICTED",
    direction: "Lowered",
    reason:
      "The commercial terms were removed at version 3. What remains is a delivery status report with no market-sensitive content.",
    requestedBy: "R. Kamanga",
    requestedAt: "2026-08-11T14:05",
    status: "Applied",
    decidedBy: "Larry (Secretariat)",
    decidedAt: "2026-08-11T16:40",
  },
  {
    id: "RCL-016",
    documentId: "DOC-0333",
    documentTitle: "Technical Report: Blantyre DR Environment Commissioning",
    from: "RESTRICTED",
    to: "OFFICIAL",
    direction: "Lowered",
    reason: "Requested for publication on the ministry website.",
    requestedBy: "R. Kamanga",
    requestedAt: "2026-07-29T11:00",
    status: "Declined",
    decidedBy: "A. Msosa",
    decidedAt: "2026-07-29T15:12",
  },
];

/** FR-DOC-14 */
export const seedRevocations: Revocation[] = [
  {
    id: "REV-031",
    scope: "Pack",
    targetId: "PCK-2026-013-S1",
    targetTitle: "13th Ordinary Sitting — supplementary pack 1",
    audience: "All users",
    users: [],
    reason:
      "Wrong annex circulated — an internal working draft went out in place of the cleared version.",
    by: "Larry (Secretariat)",
    at: "2026-08-03T12:15",
  },
  {
    id: "REV-030",
    scope: "Document",
    targetId: "DOC-0355",
    targetTitle: "Briefing Note: Regional Diplomatic Positions — SADC Summit",
    audience: "Named users",
    users: ["Hon. Minister of Education", "Director of Budget"],
    reason:
      "Item moved into closed session after release; the two participants are not on the admitted list.",
    by: "Larry (Secretariat)",
    at: "2026-08-12T16:22",
  },
  {
    id: "REV-029",
    scope: "Version",
    targetId: "DOC-0335-v1",
    targetTitle: "Technical Report: Blantyre DR Commissioning, version 1",
    audience: "All users",
    users: [],
    reason: "Superseded by version 2 after the section citation was corrected.",
    by: "Larry (Secretariat)",
    at: "2026-08-02T11:22",
    restoredAt: undefined,
  },
];

/** FR-DOC-15 / 16 / 17 / 19 */
export const seedEndpoints: SecureEndpoint[] = [
  {
    id: "EP-01",
    label: "Cabinet Room — IMAGO endpoint",
    location: "Cabinet Room, Capital Hill",
    kind: "IMAGO room endpoint",
    persistentStorage: false,
    cacheEncrypted: true,
    cacheScope: "Current session only",
    offlineEnabled: false,
    lastSessionPackId: "PCK-2026-013-A",
    lastVerifiedAt: "2026-08-04T13:10",
    verification: "Clean",
  },
  {
    id: "EP-02",
    label: "Cabinet Room — tablet 04",
    location: "Cabinet Room, Capital Hill",
    kind: "Room tablet",
    persistentStorage: false,
    cacheEncrypted: true,
    cacheScope: "Current session only",
    offlineEnabled: false,
    lastSessionPackId: "PCK-2026-013-A",
    lastVerifiedAt: "2026-08-04T13:14",
    verification: "Clean",
  },
  {
    id: "EP-03",
    label: "Committee Room B — display",
    location: "Committee Room B, Capital Hill",
    kind: "Room display",
    persistentStorage: false,
    cacheEncrypted: true,
    cacheScope: "Current session only",
    offlineEnabled: false,
    lastSessionPackId: "PCK-2026-013-A",
    lastVerifiedAt: "2026-08-04T13:20",
    verification: "Remnant found",
    note:
      "A rendered page cache survived session end. Cleared manually on 4 August; the endpoint is held out of service until the next verification passes.",
  },
  {
    id: "EP-04",
    label: "State House — briefing room tablet",
    location: "State House Briefing Room, Lilongwe",
    kind: "Room tablet",
    persistentStorage: false,
    cacheEncrypted: true,
    cacheScope: "Current session only",
    offlineEnabled: false,
    verification: "Not verified",
    note: "Commissioned 12 August. No session has run on it yet.",
  },
];

/** FR-DOC-18 — Release 2, shown so the control is visible before it is enabled. */
export const seedOfflineGrants: OfflineGrant[] = [
  {
    id: "OFF-004",
    userName: "Hon. Minister of Finance",
    deviceLabel: "Finance — Cabinet tablet 04",
    packId: "PCK-2026-013-A",
    grantedAt: "2026-08-01T17:00",
    expiresAt: "2026-08-04T17:00",
    status: "Expired",
    lastSyncAt: "2026-08-04T08:12",
  },
  {
    id: "OFF-003",
    userName: "Hon. Minister of Health",
    deviceLabel: "Health — Cabinet tablet 07",
    packId: "PCK-2026-013-A",
    grantedAt: "2026-08-01T17:00",
    expiresAt: "2026-08-04T17:00",
    status: "Wiped",
    wipeRequestedAt: "2026-08-02T09:40",
    lastSyncAt: "2026-08-02T09:41",
  },
];

/** FR-DOC-20 — Release 2. */
export const seedTransfers: TransferRecord[] = [
  {
    id: "TRF-009",
    direction: "Export",
    title: "Decisions of the 13th Ordinary Sitting — extract",
    classification: "RESTRICTED",
    counterparty: "National Archives of Malawi",
    reference: "OPC/ARC/2026/031",
    approvedBy: "Secretary to Cabinet",
    by: "Larry (Secretariat)",
    at: "2026-08-06T10:20",
    status: "Completed",
  },
  {
    id: "TRF-010",
    direction: "Import",
    title: "SADC Secretariat position paper",
    classification: "CONFIDENTIAL",
    counterparty: "Ministry of Foreign Affairs",
    reference: "OPC/FOR/2026/044",
    by: "C. Gondwe",
    at: "2026-08-14T11:05",
    status: "Awaiting approval",
  },
];

/** FR-DOC-05 / 06 */
export const ENCRYPTION_LAYERS: EncryptionLayer[] = [
  { id: "ENC-1", layer: "Document store", state: "Encrypted", algorithm: "AES-256-GCM", keyTier: "HSM", lastVerified: "2026-08-14T02:00" },
  { id: "ENC-2", layer: "Document metadata", state: "Encrypted", algorithm: "AES-256-GCM", keyTier: "HSM", lastVerified: "2026-08-14T02:00" },
  { id: "ENC-3", layer: "Search index", state: "Encrypted", algorithm: "AES-256-GCM", keyTier: "HSM", lastVerified: "2026-08-14T02:00", note: "Index terms are encrypted at rest; query evaluation happens inside the protected tier." },
  { id: "ENC-4", layer: "Backups", state: "Encrypted", algorithm: "AES-256-GCM", keyTier: "HSM", lastVerified: "2026-08-13T23:30" },
  { id: "ENC-5", layer: "Temporary caches", state: "Encrypted", algorithm: "AES-256-GCM", keyTier: "HSM", lastVerified: "2026-08-14T02:00", note: "Session-scoped and cleared at session end — see endpoint controls." },
  { id: "ENC-6", layer: "In transit", state: "Encrypted", algorithm: "TLS 1.3 · ECDHE-ECDSA-AES256-GCM-SHA384", keyTier: "HSM", lastVerified: "2026-08-14T06:00", note: "TLS 1.2 and below are refused at the edge." },
];

/** FR-DOC-07 */
export const KEY_RECORDS: KeyRecord[] = [
  { id: "KEY-DOC", label: "Document encryption key", purpose: "Document store and metadata", module: "HSM cluster — Lilongwe", rotatedAt: "2026-06-01", nextRotation: "2026-12-01", exportable: false },
  { id: "KEY-IDX", label: "Index key", purpose: "Search index at rest", module: "HSM cluster — Lilongwe", rotatedAt: "2026-06-01", nextRotation: "2026-12-01", exportable: false },
  { id: "KEY-BAK", label: "Backup key", purpose: "Backup sets, both sites", module: "HSM cluster — Blantyre", rotatedAt: "2026-05-15", nextRotation: "2026-11-15", exportable: false },
  { id: "KEY-TLS", label: "Edge TLS key", purpose: "Transport termination", module: "HSM cluster — Lilongwe", rotatedAt: "2026-07-20", nextRotation: "2026-10-20", exportable: false },
];

/** FR-DOC-13 */
export const seedAccessExpiry: AccessExpiry[] = [
  { documentId: "DOC-0333", title: "Progress Report: e-Cabinet Rollout Phase 4", classification: "OFFICIAL", meetingId: "MTG-2026-013", expiresAt: "2027-08-04T00:00", basis: "Retention period", holders: 6 },
  { documentId: "DOC-0335", title: "Technical Report: Blantyre DR Commissioning", classification: "RESTRICTED", meetingId: "MTG-2026-013", expiresAt: "2026-11-02T00:00", basis: "Retention period", holders: 6 },
  { documentId: "DOC-0341", title: "Cabinet Paper: National Fibre Backbone Phase III", classification: "SECRET", meetingId: "MTG-2026-014", expiresAt: "2026-08-25T00:00", basis: "Retention period", holders: 7 },
  { documentId: "DOC-0355", title: "Briefing Note: Regional Diplomatic Positions", classification: "TOP SECRET — CABINET", meetingId: "MTG-2026-014", expiresAt: "2026-08-18T12:00", basis: "Meeting end", holders: 4 },
  { documentId: "DOC-0352", title: "Committee Paper: Mid-Year Budget Performance", classification: "SECRET", meetingId: "MTG-2026-015", expiresAt: "2026-08-28T00:00", basis: "Retention period", holders: 3 },
  { documentId: "DOC-0347", title: "Cabinet Paper: District Hospital Equipment", classification: "CONFIDENTIAL", meetingId: "MTG-2026-014", expiresAt: "2026-09-17T00:00", basis: "Retention period", holders: 7 },
  { documentId: "DOC-0349", title: "Cabinet Paper: Teacher Deployment Framework", classification: "RESTRICTED", meetingId: "MTG-2026-014", expiresAt: "2026-08-16T09:00", basis: "Role loss", holders: 1 },
];

/** FR-DOC-11 — fourteen days of print and download activity. */
export const seedHandlingDays: HandlingDay[] = [
  { date: "2026-08-02", prints: 4, downloads: 11, blocked: 1 },
  { date: "2026-08-03", prints: 9, downloads: 18, blocked: 2 },
  { date: "2026-08-04", prints: 22, downloads: 31, blocked: 5 },
  { date: "2026-08-05", prints: 6, downloads: 14, blocked: 1 },
  { date: "2026-08-06", prints: 8, downloads: 16, blocked: 0 },
  { date: "2026-08-07", prints: 5, downloads: 12, blocked: 2 },
  { date: "2026-08-08", prints: 7, downloads: 15, blocked: 1 },
  { date: "2026-08-09", prints: 1, downloads: 3, blocked: 0 },
  { date: "2026-08-10", prints: 3, downloads: 9, blocked: 1 },
  { date: "2026-08-11", prints: 12, downloads: 24, blocked: 4 },
  { date: "2026-08-12", prints: 17, downloads: 29, blocked: 9 },
  { date: "2026-08-13", prints: 21, downloads: 34, blocked: 7 },
  { date: "2026-08-14", prints: 14, downloads: 22, blocked: 3 },
  { date: "2026-08-15", prints: 6, downloads: 10, blocked: 1 },
];
