import type {
  AccessDay,
  AccessSession,
  AdminAccount,
  BastionSession,
  BreakGlassGrant,
  DeactivationRequest,
  Delegation,
  EntitlementReport,
  Fido2Token,
  IamCapability,
  IdentityProviderBinding,
  MfaPolicy,
  RolePermissionSet,
  SessionPolicy,
  StepUpRule,
  TrustedDevice,
  UserRole,
} from "@/models/response/base-response";

/**
 * FR IAM configuration and seed state. Everything here is configuration rather
 * than code — the seven role groups, the authentication policy and the trust
 * rules are what an administrator edits, so they live in one file the way
 * meeting types do.
 */

/** FR-IAM-07 — the seven role groups of proposal Section 13, in order. */
export const ROLE_GROUPS: UserRole[] = [
  "Cabinet Member",
  "Presidency Official",
  "Secretariat Administrator",
  "Ministry Submitter",
  "Technical Administrator",
  "Security / Audit",
  "External Participant",
];

export const IAM_CAPABILITIES: IamCapability[] = [
  "Meetings & agenda",
  "Cabinet papers",
  "Decisions & actions",
  "Video sessions",
  "Audit log",
  "Identity & access",
];

/**
 * FR-IAM-07 / 10 — the permission set behind each role group. Technical
 * administrators deliberately hold no read access to paper content: they
 * administer the platform, and reaching content takes a break-glass grant.
 */
export const ROLE_PERMISSIONS: RolePermissionSet[] = [
  {
    role: "Cabinet Member",
    summary: "Cabinet members and authorised principals",
    classificationCeiling: "TOP SECRET — CABINET",
    privileged: false,
    levels: {
      "Meetings & agenda": "Read",
      "Cabinet papers": "Read",
      "Decisions & actions": "Read",
      "Video sessions": "Contribute",
      "Audit log": "None",
      "Identity & access": "None",
    },
  },
  {
    role: "Presidency Official",
    summary: "Presidency officials acting for the Head of State",
    classificationCeiling: "TOP SECRET — CABINET",
    privileged: false,
    levels: {
      "Meetings & agenda": "Read",
      "Cabinet papers": "Read",
      "Decisions & actions": "Read",
      "Video sessions": "Contribute",
      "Audit log": "None",
      "Identity & access": "None",
    },
  },
  {
    role: "Secretariat Administrator",
    summary: "Cabinet Secretariat administrators",
    classificationCeiling: "TOP SECRET — CABINET",
    privileged: false,
    levels: {
      "Meetings & agenda": "Full",
      "Cabinet papers": "Manage",
      "Decisions & actions": "Manage",
      "Video sessions": "Manage",
      "Audit log": "Read",
      "Identity & access": "Manage",
    },
  },
  {
    role: "Ministry Submitter",
    summary: "Ministry submitters clearing papers into the workflow",
    classificationCeiling: "SECRET",
    privileged: false,
    levels: {
      "Meetings & agenda": "Read",
      "Cabinet papers": "Contribute",
      "Decisions & actions": "Read",
      "Video sessions": "None",
      "Audit log": "None",
      "Identity & access": "None",
    },
  },
  {
    role: "Technical Administrator",
    summary: "Platform and infrastructure administrators",
    classificationCeiling: "OFFICIAL",
    privileged: true,
    levels: {
      "Meetings & agenda": "None",
      "Cabinet papers": "None",
      "Decisions & actions": "None",
      "Video sessions": "Manage",
      "Audit log": "Read",
      "Identity & access": "Full",
    },
  },
  {
    role: "Security / Audit",
    summary: "Security and audit users with oversight of the record",
    classificationCeiling: "RESTRICTED",
    privileged: true,
    levels: {
      "Meetings & agenda": "Read",
      "Cabinet papers": "None",
      "Decisions & actions": "Read",
      "Video sessions": "None",
      "Audit log": "Full",
      "Identity & access": "Read",
    },
  },
  {
    role: "External Participant",
    summary: "Invited external participants, by convened list only",
    classificationCeiling: "OFFICIAL",
    privileged: false,
    levels: {
      "Meetings & agenda": "Read",
      "Cabinet papers": "None",
      "Decisions & actions": "None",
      "Video sessions": "Contribute",
      "Audit log": "None",
      "Identity & access": "None",
    },
  },
];

/**
 * FR-IAM-08 — what the server weighs on every request. Listed so the rule is
 * legible to the people who have to answer for it, not only to the code.
 */
export const AUTHORISATION_FACTORS: { factor: string; detail: string }[] = [
  { factor: "User role", detail: "The role group's permission set, above" },
  {
    factor: "Committee and Cabinet membership",
    detail: "Named on the sitting, or a member of the committee that owns it",
  },
  {
    factor: "Ministry affiliation",
    detail: "Papers a ministry submitted, and items it is responsible for",
  },
  {
    factor: "Document classification",
    detail: "Against the role ceiling and the device's attested trust level",
  },
  {
    factor: "Meeting state",
    detail: "Packs open only once released; closed items stay with their list",
  },
];

/** FR-IAM-02 / 03 */
export const IDENTITY_PROVIDER: IdentityProviderBinding = {
  name: "Government Directory — GovNet",
  protocol: "SAML 2.0",
  status: "Connected",
  entityId: "urn:mw:gov:ecabinet:sp",
  lastHandshake: "2026-08-14T13:41",
  metadataRefreshed: "2026-08-13T02:00",
  resiliencePath: {
    enabled: true,
    scope: "Secretariat administrators and technical administrators",
    maxHours: 12,
    lastUsed: "2026-06-19T08:20",
  },
};

/** FR-IAM-04 */
export const MFA_POLICIES: MfaPolicy[] = [
  { role: "Cabinet Member", factors: ["FIDO2 key", "Biometrics"], enforcement: "Always" },
  { role: "Presidency Official", factors: ["FIDO2 key", "Biometrics"], enforcement: "Always" },
  {
    role: "Secretariat Administrator",
    factors: ["FIDO2 key", "Authenticator"],
    enforcement: "Always",
  },
  {
    role: "Ministry Submitter",
    factors: ["Authenticator", "Email"],
    enforcement: "Off-network only",
  },
  {
    role: "Technical Administrator",
    factors: ["FIDO2 key", "Authenticator"],
    enforcement: "Always",
  },
  { role: "Security / Audit", factors: ["FIDO2 key"], enforcement: "Always" },
  { role: "External Participant", factors: ["Email", "Authenticator"], enforcement: "Always" },
];

/** FR-IAM-06 — the classification threshold that demands a fresh challenge. */
export const STEP_UP_RULES: StepUpRule[] = [
  {
    classification: "TOP SECRET — CABINET",
    requires: "FIDO2 key, re-presented",
    maxAgeMinutes: 15,
  },
  { classification: "SECRET", requires: "FIDO2 key or authenticator", maxAgeMinutes: 30 },
  { classification: "CONFIDENTIAL", requires: "Authenticator", maxAgeMinutes: 60 },
  { classification: "RESTRICTED", requires: "Session factor is sufficient", maxAgeMinutes: 240 },
  { classification: "OFFICIAL", requires: "Session factor is sufficient", maxAgeMinutes: 480 },
];

/** FR-IAM-05 */
export const seedTokens: Fido2Token[] = [
  { id: "TOK-01", serial: "YK5-4471-093", model: "YubiKey 5 NFC", holderId: "USR-001", registeredAt: "2026-02-11", lastUsed: "2026-08-14T07:58", status: "Active" },
  { id: "TOK-02", serial: "YK5-4471-118", model: "YubiKey 5 NFC", holderId: "USR-002", registeredAt: "2026-02-11", lastUsed: "2026-08-14T08:03", status: "Active" },
  { id: "TOK-03", serial: "YK5-4471-204", model: "YubiKey 5 NFC", holderId: "USR-003", registeredAt: "2026-01-08", lastUsed: "2026-08-14T08:12", status: "Active" },
  { id: "TOK-04", serial: "YK5-4471-233", model: "YubiKey 5C", holderId: "USR-006", registeredAt: "2026-03-02", lastUsed: "2026-08-12T10:15", status: "Active" },
  { id: "TOK-05", serial: "YK5-4471-260", model: "YubiKey 5C", holderId: "USR-007", registeredAt: "2026-03-02", lastUsed: "2026-08-13T09:30", status: "Active" },
  { id: "TOK-06", serial: "YK5-4471-281", model: "YubiKey 5 NFC", holderId: "USR-009", registeredAt: "2026-04-19", lastUsed: "2026-08-13T18:20", status: "Active" },
  { id: "TOK-07", serial: "YK5-4470-902", model: "YubiKey 5 NFC", holderId: "USR-010", registeredAt: "2025-11-30", lastUsed: "2026-08-13T09:20", status: "Revoked" },
  { id: "TOK-08", serial: "YK5-4471-315", model: "YubiKey 5C", holderId: "USR-004", registeredAt: "2026-07-22", lastUsed: "2026-08-06T09:44", status: "Reported lost" },
];

/** FR-IAM-15 */
export const SESSION_POLICIES: SessionPolicy[] = [
  { role: "Cabinet Member", timeoutMinutes: 15, concurrentSessions: 2, reauthOnElevation: true },
  { role: "Presidency Official", timeoutMinutes: 15, concurrentSessions: 2, reauthOnElevation: true },
  { role: "Secretariat Administrator", timeoutMinutes: 30, concurrentSessions: 3, reauthOnElevation: true },
  { role: "Ministry Submitter", timeoutMinutes: 30, concurrentSessions: 2, reauthOnElevation: false },
  { role: "Technical Administrator", timeoutMinutes: 10, concurrentSessions: 1, reauthOnElevation: true },
  { role: "Security / Audit", timeoutMinutes: 20, concurrentSessions: 1, reauthOnElevation: true },
  { role: "External Participant", timeoutMinutes: 10, concurrentSessions: 1, reauthOnElevation: true },
];

/** FR-IAM-14 */
export const seedSessions: AccessSession[] = [
  { id: "SES-8841", userId: "USR-003", device: "Secretariat workstation", ip: "10.20.4.11", location: "Capital Hill, Lilongwe", startedAt: "2026-08-14T08:12", lastActivityAt: "2026-08-14T13:58", expiresAt: "2026-08-14T14:28", mfaMethod: "FIDO2 key", elevated: false, status: "Active" },
  { id: "SES-8843", userId: "USR-001", device: "Managed tablet", ip: "10.31.7.52", location: "Capital Hill, Lilongwe", startedAt: "2026-08-14T07:58", lastActivityAt: "2026-08-14T13:44", expiresAt: "2026-08-14T13:59", mfaMethod: "FIDO2 key", elevated: true, status: "Active" },
  { id: "SES-8845", userId: "USR-002", device: "Managed tablet", ip: "41.87.12.9", location: "Blantyre — off network", startedAt: "2026-08-14T08:03", lastActivityAt: "2026-08-14T12:10", expiresAt: "2026-08-14T12:25", mfaMethod: "FIDO2 key", elevated: false, status: "Idle" },
  { id: "SES-8849", userId: "USR-006", device: "Managed laptop", ip: "10.20.9.34", location: "Capital Hill, Lilongwe", startedAt: "2026-08-14T13:20", lastActivityAt: "2026-08-14T13:55", expiresAt: "2026-08-14T14:05", mfaMethod: "FIDO2 key", elevated: true, status: "Active" },
  { id: "SES-8850", userId: "USR-009", device: "Managed tablet", ip: "10.44.1.6", location: "State House, Lilongwe", startedAt: "2026-08-14T11:02", lastActivityAt: "2026-08-14T13:51", expiresAt: "2026-08-14T14:06", mfaMethod: "FIDO2 key", elevated: false, status: "Active" },
  { id: "SES-8852", userId: "USR-008", device: "Managed laptop", ip: "41.87.44.101", location: "Unrecognised — Mzuzu", startedAt: "2026-08-14T07:55", lastActivityAt: "2026-08-14T07:57", expiresAt: "2026-08-14T08:27", mfaMethod: "Password only", elevated: false, status: "Revoked" },
  { id: "SES-8853", userId: "USR-004", device: "Managed laptop", ip: "10.22.3.77", location: "Capital Hill, Lilongwe", startedAt: "2026-08-14T09:30", lastActivityAt: "2026-08-14T11:12", expiresAt: "2026-08-14T11:42", mfaMethod: "Authenticator", elevated: false, status: "Idle" },
];

/** FR-IAM-12 */
export const seedAdminAccounts: AdminAccount[] = [
  { id: "ADM-01", person: "R. Kamanga", account: "adm-rkamanga", scope: "Platform and application administration", bastionOnly: true, lastUsed: "2026-08-14T13:20" },
  { id: "ADM-02", person: "A. Msosa", account: "adm-amsosa", scope: "Security tooling and audit export", bastionOnly: true, lastUsed: "2026-08-13T09:34" },
  { id: "ADM-03", person: "Bahamus support", account: "adm-vendor-01", scope: "Vendor support, engaged by ticket only", bastionOnly: true, lastUsed: "2026-07-28T16:05" },
];

/** FR-IAM-11 */
export const seedBreakGlass: BreakGlassGrant[] = [
  {
    id: "BG-2026-014",
    adminAccount: "adm-rkamanga",
    requestedBy: "R. Kamanga",
    reason:
      "Pack assembly failed on DOC-0352 — the file will not render for any participant and the sitting is on Friday.",
    scope: "DOC-0352 content, read only",
    requestedAt: "2026-08-14T12:40",
    securityOwnerAlerted: false,
    status: "Pending approval",
  },
  {
    id: "BG-2026-013",
    adminAccount: "adm-vendor-01",
    requestedBy: "Bahamus support",
    reason: "Storage migration verification against a known checksum sample.",
    scope: "Three sampled documents, read only",
    requestedAt: "2026-08-14T09:05",
    approvedBy: "Secretary to Cabinet",
    approvalReference: "OPC/SEC/2026/118",
    grantedAt: "2026-08-14T09:35",
    expiresAt: "2026-08-14T15:35",
    securityOwnerAlerted: true,
    status: "Active",
  },
  {
    id: "BG-2026-012",
    adminAccount: "adm-amsosa",
    requestedBy: "A. Msosa",
    reason: "Investigation of a reported unauthorised access attempt on DOC-0344.",
    scope: "DOC-0344 access records and content",
    requestedAt: "2026-07-30T14:02",
    approvedBy: "Secretary to Cabinet",
    approvalReference: "OPC/SEC/2026/104",
    grantedAt: "2026-07-30T14:20",
    expiresAt: "2026-07-30T18:20",
    securityOwnerAlerted: true,
    status: "Expired",
  },
  {
    id: "BG-2026-011",
    adminAccount: "adm-vendor-01",
    requestedBy: "Bahamus support",
    reason: "Requested content access to reproduce a rendering defect.",
    scope: "Any Cabinet paper",
    requestedAt: "2026-07-18T10:11",
    approvedBy: "Secretary to Cabinet",
    approvalReference: "OPC/SEC/2026/097",
    securityOwnerAlerted: true,
    status: "Declined",
  },
];

export const seedBastionSessions: BastionSession[] = [
  { id: "BAS-4471", adminAccount: "adm-rkamanga", host: "app-lil-02", startedAt: "2026-08-14T13:20", durationMinutes: 38, recordingRef: "REC-2026-08-14-01", mfaVerified: true },
  { id: "BAS-4468", adminAccount: "adm-amsosa", host: "audit-lil-01", startedAt: "2026-08-13T09:34", durationMinutes: 22, recordingRef: "REC-2026-08-13-03", mfaVerified: true },
  { id: "BAS-4459", adminAccount: "adm-vendor-01", host: "store-btr-01", startedAt: "2026-07-28T16:05", durationMinutes: 96, recordingRef: "REC-2026-07-28-02", mfaVerified: true },
];

/** FR-IAM-16 */
export const seedEntitlementReports: EntitlementReport[] = [
  { userId: "USR-001", cycle: "Q3 2026", generatedAt: "2026-08-14T06:00", meetings: ["MTG-2026-014", "MTG-2026-015", "MTG-2026-013"], documentCount: 18, functions: ["Read papers", "Join video sessions", "Acknowledge packs"], reviewStatus: "Attested", reviewer: "Secretary to Cabinet", reviewedAt: "2026-08-11T10:20" },
  { userId: "USR-002", cycle: "Q3 2026", generatedAt: "2026-08-14T06:00", meetings: ["MTG-2026-014", "MTG-2026-013"], documentCount: 14, functions: ["Read papers", "Join video sessions"], reviewStatus: "Attested", reviewer: "Secretary to Cabinet", reviewedAt: "2026-08-11T10:24" },
  { userId: "USR-003", cycle: "Q3 2026", generatedAt: "2026-08-14T06:00", meetings: ["MTG-2026-014", "MTG-2026-015", "MTG-2026-016", "MTG-2026-013"], documentCount: 32, functions: ["Create meetings", "Freeze packs", "Manage participants", "Manage accounts"], reviewStatus: "In review", reviewer: "A. Msosa" },
  { userId: "USR-004", cycle: "Q3 2026", generatedAt: "2026-08-14T06:00", meetings: ["MTG-2026-015"], documentCount: 6, functions: ["Submit papers", "Upload annexes"], reviewStatus: "Not started" },
  { userId: "USR-006", cycle: "Q3 2026", generatedAt: "2026-08-14T06:00", meetings: [], documentCount: 0, functions: ["Manage accounts", "Manage video endpoints", "Read audit log"], reviewStatus: "Changes requested", reviewer: "A. Msosa", reviewedAt: "2026-08-12T16:40" },
  { userId: "USR-007", cycle: "Q3 2026", generatedAt: "2026-08-14T06:00", meetings: ["MTG-2026-014"], documentCount: 0, functions: ["Read audit log", "Export audit log"], reviewStatus: "Attested", reviewer: "Secretary to Cabinet", reviewedAt: "2026-08-11T11:02" },
  { userId: "USR-009", cycle: "Q3 2026", generatedAt: "2026-08-14T06:00", meetings: ["MTG-2026-016"], documentCount: 9, functions: ["Read papers", "Join video sessions"], reviewStatus: "Not started" },
];

/** FR-IAM-17 */
export const seedDelegations: Delegation[] = [
  { id: "DLG-021", fromUserId: "USR-002", toUserId: "USR-004", scope: "Papers for MTG-2026-015 only", startsAt: "2026-08-13", endsAt: "2026-08-22", approvedBy: "Secretary to Cabinet", useCount: 4, status: "Active" },
  { id: "DLG-020", fromUserId: "USR-001", toUserId: "USR-003", scope: "Acknowledgement of the MTG-2026-014 pack", startsAt: "2026-08-15", endsAt: "2026-08-19", approvedBy: "Awaiting Secretary to Cabinet", useCount: 0, status: "Pending approval" },
  { id: "DLG-018", fromUserId: "USR-009", toUserId: "USR-003", scope: "Presidency briefing papers", startsAt: "2026-07-02", endsAt: "2026-07-16", approvedBy: "Chief of Staff", useCount: 11, status: "Expired" },
  { id: "DLG-017", fromUserId: "USR-001", toUserId: "USR-005", scope: "Finance committee papers", startsAt: "2026-06-10", endsAt: "2026-06-30", approvedBy: "Secretary to Cabinet", useCount: 2, status: "Revoked" },
];

/** FR-IAM-18 */
export const seedDevices: TrustedDevice[] = [
  { id: "DEV-101", label: "Finance — Cabinet tablet 04", ownerId: "USR-001", kind: "Managed tablet", certificateSerial: "3A:91:44:0C", issuedAt: "2026-02-11", expiresAt: "2027-02-11", attestation: "Attested", maxClassification: "TOP SECRET — CABINET", status: "Trusted", lastSeen: "2026-08-14T07:58" },
  { id: "DEV-102", label: "Health — Cabinet tablet 07", ownerId: "USR-002", kind: "Managed tablet", certificateSerial: "3A:91:44:1B", issuedAt: "2026-02-11", expiresAt: "2027-02-11", attestation: "Attestation stale", maxClassification: "SECRET", status: "Trusted", lastSeen: "2026-08-14T08:03" },
  { id: "DEV-103", label: "Secretariat workstation 01", ownerId: "USR-003", kind: "Secretariat workstation", certificateSerial: "3A:90:12:77", issuedAt: "2026-01-08", expiresAt: "2027-01-08", attestation: "Attested", maxClassification: "TOP SECRET — CABINET", status: "Trusted", lastSeen: "2026-08-14T08:12" },
  { id: "DEV-104", label: "Finance ministry laptop 12", ownerId: "USR-004", kind: "Managed laptop", certificateSerial: "3B:04:56:2E", issuedAt: "2026-03-02", expiresAt: "2027-03-02", attestation: "Attested", maxClassification: "SECRET", status: "Trusted", lastSeen: "2026-08-12T15:40" },
  { id: "DEV-105", label: "ICT admin laptop 02", ownerId: "USR-006", kind: "Managed laptop", certificateSerial: "3B:04:56:5F", issuedAt: "2026-03-02", expiresAt: "2027-03-02", attestation: "Attested", maxClassification: "OFFICIAL", status: "Trusted", lastSeen: "2026-08-14T13:20" },
  { id: "DEV-106", label: "Foreign Affairs laptop 09", ownerId: "USR-008", kind: "Managed laptop", certificateSerial: "3B:07:19:A4", issuedAt: "2025-11-30", expiresAt: "2026-11-30", attestation: "Failed", maxClassification: "OFFICIAL", status: "Blocked", lastSeen: "2026-08-14T07:55" },
  { id: "DEV-107", label: "Cabinet Room IMAGO endpoint", ownerId: "USR-003", kind: "IMAGO room endpoint", certificateSerial: "3C:22:80:11", issuedAt: "2026-04-01", expiresAt: "2027-04-01", attestation: "Attested", maxClassification: "TOP SECRET — CABINET", status: "Trusted", lastSeen: "2026-08-13T16:40" },
];

/** FR-IAM-13 — the one-working-hour clock starts when the request is raised. */
export const seedDeactivations: DeactivationRequest[] = [
  { id: "DEA-044", userId: "USR-008", reason: "Suspected compromise", raisedAt: "2026-08-14T08:05", raisedBy: "A. Msosa", dueBy: "2026-08-14T09:05", status: "Awaiting action" },
  { id: "DEA-045", userId: "USR-005", reason: "Ministerial transition", raisedAt: "2026-08-14T13:30", raisedBy: "Larry", dueBy: "2026-08-14T14:30", status: "Awaiting action" },
  { id: "DEA-043", userId: "USR-010", reason: "Departure from office", raisedAt: "2026-08-13T08:40", raisedBy: "Larry", dueBy: "2026-08-13T09:40", status: "Completed", completedAt: "2026-08-13T09:12" },
];

/**
 * Fourteen days of authorisation decisions. The denial spike on 12–14 August
 * is the one the access dashboard is meant to surface.
 */
export const seedAccessDays: AccessDay[] = [
  { date: "2026-08-01", granted: 412, denied: 3 },
  { date: "2026-08-02", granted: 96, denied: 1 },
  { date: "2026-08-03", granted: 508, denied: 4 },
  { date: "2026-08-04", granted: 743, denied: 6 },
  { date: "2026-08-05", granted: 521, denied: 2 },
  { date: "2026-08-06", granted: 498, denied: 5 },
  { date: "2026-08-07", granted: 466, denied: 3 },
  { date: "2026-08-08", granted: 382, denied: 4 },
  { date: "2026-08-09", granted: 88, denied: 0 },
  { date: "2026-08-10", granted: 534, denied: 7 },
  { date: "2026-08-11", granted: 611, denied: 9 },
  { date: "2026-08-12", granted: 587, denied: 24 },
  { date: "2026-08-13", granted: 640, denied: 31 },
  { date: "2026-08-14", granted: 402, denied: 18 },
];

export function rolePermissions(role: UserRole): RolePermissionSet {
  return ROLE_PERMISSIONS.find((r) => r.role === role) ?? ROLE_PERMISSIONS[0];
}

export function mfaPolicy(role: UserRole): MfaPolicy {
  return MFA_POLICIES.find((p) => p.role === role) ?? MFA_POLICIES[0];
}

export function sessionPolicy(role: UserRole): SessionPolicy {
  return SESSION_POLICIES.find((p) => p.role === role) ?? SESSION_POLICIES[0];
}
