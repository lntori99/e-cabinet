import type { Classification } from "@/core/app-constants";

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* ---------- e-Cabinet domain ---------- */

export type MeetingType =
  | "Full Cabinet"
  | "Cabinet Committee"
  | "Emergency Session"
  | "Inter-Ministerial Briefing"
  | "Presidency Briefing";

export type MeetingStatus =
  | "Draft"
  | "Submissions Open"
  | "Pack Assembly"
  | "Pack Frozen"
  | "In Session"
  | "Concluded"
  | "Postponed"
  | "Cancelled";

/** FR-MTG-02 — each meeting type carries its own rules. */
export interface MeetingTypeConfig {
  name: MeetingType;
  participantRule: string;
  documentHandling: string;
  classificationDefault: Classification;
  approvalPath: string[];
}

/** FR-MTG-04 — the capacity each participant attends in. */
export type ParticipantCapacity =
  | "Member"
  | "Attendee"
  | "Presenter"
  | "Observer"
  | "Secretariat";

/** FR-MTG-13 — how they actually attended. */
export type AttendanceMode = "Physical" | "Video" | "Apology" | "Not recorded";

export interface MeetingParticipant {
  id: string;
  name: string;
  ministry: string;
  /** Lets a whole group be added at once (FR-MTG-04). */
  roleGroup: string;
  capacity: ParticipantCapacity;
  attendance: AttendanceMode;
}

/** FR-MTG-08 — item types, each with its own document expectations. */
export type AgendaItemType =
  | "Policy Paper"
  | "Information Note"
  | "Oral Item"
  | "Decision Item"
  | "Standing Item";

/** FR-MTG-07 — what can hang off an agenda item. */
export type AttachmentKind =
  | "Paper"
  | "Annex"
  | "Presentation"
  | "Secretariat Note";

export interface AgendaAttachment {
  id: string;
  kind: AttachmentKind;
  title: string;
}

export interface AgendaItem {
  id: string;
  /** Maintained by the store; never authored by hand (FR-MTG-06). */
  order: number;
  /** Sequencing group, e.g. "Policy". */
  section: string;
  title: string;
  type: AgendaItemType;
  ministry: string;
  attachments: AgendaAttachment[];
  /** FR-MTG-14 — restricts this item to a narrower participant list. */
  closedSession: boolean;
  closedParticipantIds: string[];
  /** FR-MTG-11 — provenance when an item was carried between sittings. */
  carriedFromMeetingId?: string;
  carriedToMeetingId?: string;
  decided: boolean;
}

/** FR-MTG-09 — trail of who changed the agenda, when, and what changed. */
export interface AgendaChange {
  id: string;
  at: string;
  by: string;
  summary: string;
}

/** FR-MTG-12 */
export interface MeetingDisruption {
  kind: "Cancelled" | "Postponed";
  reason: string;
  at: string;
  by: string;
  /** What happens to packs already released. */
  packHandling: "Recalled" | "Retained for the new date" | "Left in place";
  participantsNotified: boolean;
  postponedToDate?: string;
  postponedToTime?: string;
}

export type Recurrence =
  | "None"
  | "Weekly"
  | "Fortnightly"
  | "Monthly"
  | "Quarterly";

export interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  status: MeetingStatus;
  date: string;
  time: string;
  /** FR-MTG-03 — expected duration in minutes. */
  durationMinutes: number;
  venue: string;
  chair: string;
  participants: MeetingParticipant[];
  agenda: AgendaItem[];
  submissionDeadline: string;
  packFrozenAt?: string;
  packFrozenBy?: string;
  hybrid: boolean;
  /** FR-MTG-10 — sittings in one series share a seriesId. */
  seriesId?: string;
  recurrence: Recurrence;
  history: AgendaChange[];
  disruption?: MeetingDisruption;
}

export type DocumentStatus =
  | "Submitted"
  | "Policy Review"
  | "Legal Clearance"
  | "Approved"
  | "Circulated"
  | "Superseded";

export interface DocumentVersion {
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  note: string;
}

export interface CabinetDocument {
  id: string;
  title: string;
  ministry: string;
  classification: Classification;
  status: DocumentStatus;
  meetingId?: string;
  pages: number;
  sizeMb: number;
  watermarked: boolean;
  downloadable: boolean;
  printable: boolean;
  versions: DocumentVersion[];
  retentionClass: string;
}

export type DecisionOutcome = "Approved" | "Approved with amendments" | "Deferred" | "Rejected" | "Noted";

export interface Decision {
  id: string;
  meetingId: string;
  agendaItemTitle: string;
  outcome: DecisionOutcome;
  summary: string;
  recordedBy: string;
  recordedAt: string;
}

export type ActionStatus = "Not started" | "In progress" | "Overdue" | "Completed";

export interface ActionItem {
  id: string;
  decisionId: string;
  description: string;
  ministry: string;
  owner: string;
  deadline: string;
  status: ActionStatus;
}

export type AuditOutcome = "Success" | "Denied" | "Failed";

/**
 * FR-AUD-02 names eight things every event must carry. The four added below the
 * original set are optional in the type only so that the call sites written
 * before FR-AUD keep compiling — the reducer fills them in, so no event is
 * actually written without them.
 */
export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  ip: string;
  severity: "info" | "warning" | "critical";
  /** The version of the object acted on, where it has one. */
  objectVersion?: string;
  /** The device the action came from. */
  device?: string;
  outcome?: AuditOutcome;
  /** FR-AUD-02 — the clock, named, because "the server's time" is not a source. */
  timeSource?: string;
}

export type UserRole =
  | "Cabinet Member"
  | "Presidency Official"
  | "Secretariat Administrator"
  | "Ministry Submitter"
  | "Technical Administrator"
  | "Security / Audit"
  | "External Participant";

export interface CabinetUser {
  id: string;
  name: string;
  role: UserRole;
  ministry: string;
  mfa: "FIDO2 key" | "Authenticator app" | "Pending enrolment";
  device: "Managed laptop" | "Managed tablet" | "Secretariat workstation" | "IMAGO room endpoint";
  status: "Active" | "Suspended" | "Deactivated";
  lastSeen: string;
}

/* ---------- FR IAM — identity, access and role management ---------- */

/** FR-IAM-07 — the capability areas a role group is granted access to. */
export type IamCapability =
  | "Meetings & agenda"
  | "Cabinet papers"
  | "Decisions & actions"
  | "Video sessions"
  | "Audit log"
  | "Identity & access";

export type AccessLevel = "None" | "Read" | "Contribute" | "Manage" | "Full";

export interface RolePermissionSet {
  role: UserRole;
  /** How proposal Section 13 describes the group. */
  summary: string;
  /** FR-IAM-18 — the ceiling this role can reach, device trust permitting. */
  classificationCeiling: Classification;
  /** FR-IAM-12 — reached only through a separate administrative account. */
  privileged: boolean;
  levels: Record<IamCapability, AccessLevel>;
}

/** FR-IAM-02 — the Government directory this deployment authenticates against. */
export interface IdentityProviderBinding {
  name: string;
  protocol: "SAML 2.0" | "OIDC";
  status: "Connected" | "Degraded" | "Unreachable";
  entityId: string;
  lastHandshake: string;
  metadataRefreshed: string;
  /** FR-IAM-03 — who may fall back to local credentials, and for how long. */
  resiliencePath: {
    enabled: boolean;
    scope: string;
    maxHours: number;
    lastUsed?: string;
  };
}

/** FR-IAM-04 — which factors a role must present, and when. */
export interface MfaPolicy {
  role: UserRole;
  factors: string[];
  enforcement: "Always" | "Off-network only";
}

/** FR-IAM-05 — the phishing-resistant token registry. */
export interface Fido2Token {
  id: string;
  serial: string;
  model: string;
  holderId: string;
  registeredAt: string;
  lastUsed: string;
  status: "Active" | "Reported lost" | "Revoked";
}

/** FR-IAM-06 — the threshold above which a second challenge is demanded. */
export interface StepUpRule {
  classification: Classification;
  requires: string;
  maxAgeMinutes: number;
}

/** FR-IAM-14 / 15 — a live session and what revoking it takes away. */
export interface AccessSession {
  id: string;
  userId: string;
  device: string;
  ip: string;
  location: string;
  startedAt: string;
  lastActivityAt: string;
  expiresAt: string;
  mfaMethod: string;
  /** True where the session has been raised for a privileged action. */
  elevated: boolean;
  status: "Active" | "Idle" | "Revoked";
}

/** FR-IAM-15 — timeout and concurrency, per role. */
export interface SessionPolicy {
  role: UserRole;
  timeoutMinutes: number;
  concurrentSessions: number;
  reauthOnElevation: boolean;
}

/** FR-IAM-12 — an administrative identity, separate from the person's own. */
export interface AdminAccount {
  id: string;
  person: string;
  account: string;
  scope: string;
  bastionOnly: boolean;
  lastUsed: string;
}

/** FR-IAM-11 — time-boxed administrator access to document content. */
export interface BreakGlassGrant {
  id: string;
  adminAccount: string;
  requestedBy: string;
  reason: string;
  scope: string;
  requestedAt: string;
  /** The client's documented approval — a grant cannot exist without one. */
  approvedBy?: string;
  approvalReference?: string;
  grantedAt?: string;
  expiresAt?: string;
  /** FR-IAM-11 — the client security owner is alerted on grant. */
  securityOwnerAlerted: boolean;
  status: "Pending approval" | "Active" | "Expired" | "Revoked" | "Declined";
}

/** FR-IAM-12 — full session recording on the bastion. */
export interface BastionSession {
  id: string;
  adminAccount: string;
  host: string;
  startedAt: string;
  durationMinutes: number;
  recordingRef: string;
  mfaVerified: boolean;
}

/** FR-IAM-16 — what one user can currently reach, for quarterly review. */
export interface EntitlementReport {
  userId: string;
  cycle: string;
  generatedAt: string;
  meetings: string[];
  documentCount: number;
  functions: string[];
  reviewStatus: "Not started" | "In review" | "Attested" | "Changes requested";
  reviewer?: string;
  reviewedAt?: string;
}

/** FR-IAM-17 — a Cabinet member's access, lent for a bounded period. */
export interface Delegation {
  id: string;
  fromUserId: string;
  toUserId: string;
  scope: string;
  startsAt: string;
  endsAt: string;
  approvedBy: string;
  /** Every use of delegated access is counted and audited. */
  useCount: number;
  status: "Pending approval" | "Active" | "Expired" | "Revoked";
}

/** FR-IAM-18 — certificate-based device trust. */
export interface TrustedDevice {
  id: string;
  label: string;
  ownerId: string;
  kind: CabinetUser["device"];
  certificateSerial: string;
  issuedAt: string;
  expiresAt: string;
  attestation: "Attested" | "Attestation stale" | "Failed";
  maxClassification: Classification;
  status: "Trusted" | "Blocked";
  lastSeen: string;
}

/** FR-IAM-13 — an account the system must close within one working hour. */
export interface DeactivationRequest {
  id: string;
  userId: string;
  reason:
    | "Role change"
    | "Ministerial transition"
    | "Departure from office"
    | "Device loss"
    | "Suspected compromise";
  raisedAt: string;
  raisedBy: string;
  dueBy: string;
  status: "Awaiting action" | "Completed";
  completedAt?: string;
}

/** One day of authorisation decisions, for the access dashboard. */
export interface AccessDay {
  date: string;
  granted: number;
  denied: number;
}

/* ---------- FR SUB — submission and clearance workflow ---------- */

/** FR-SUB-07 — the configurable stages a paper is routed through. */
export type ClearanceStageName =
  | "Policy Review"
  | "Legal Clearance"
  | "Financial Clearance"
  | "Administrative Clearance"
  | "Final Approval";

/** FR-SUB-08 — how a stage is reached. */
export type StageMode = "Sequential" | "Parallel" | "Conditional";

/** FR-SUB-09 — what a clearance actor may do, and never without a comment. */
export type ClearanceDecision = "Approved" | "Rejected" | "Returned for amendment";

export type StageStatus =
  | "Not started"
  | "In progress"
  | "Approved"
  | "Rejected"
  | "Returned"
  | "Skipped by exception"
  | "Not applicable";

export type SubmissionStatus =
  | "Draft"
  | "Quarantined"
  | "Awaiting late authorisation"
  | "In clearance"
  | "Returned for amendment"
  | "Cleared"
  | "Rejected";

/** FR-SUB-03 — the metadata a submission cannot be made without. */
export interface SubmissionMetadata {
  originatingMinistry: string;
  responsibleOfficer: string;
  subject: string;
  meetingId: string;
  agendaItemTitle: string;
  classification: Classification;
  decisionSought: string;
  financialImplication: string;
  /** Drives the conditional financial clearance stage (FR-SUB-08). */
  financialAmountMwk: number;
  legalImplication: string;
}

/** FR-SUB-02 — a Government-defined template and what it requires. */
export interface PaperTemplate {
  id: string;
  name: string;
  appliesTo: string;
  requiredSections: string[];
  maxPages: number;
  version: string;
  updatedAt: string;
}

/** FR-SUB-04 — an uploaded file and what the scanner made of it. */
export interface SubmissionFile {
  id: string;
  kind: "Paper" | "Annex" | "Presentation" | "Secretariat Note";
  fileName: string;
  sizeMb: number;
  scan: "Clean" | "Quarantined" | "Scanning";
  /** Why it was quarantined — file type, size limit or malware. */
  quarantineReason?: string;
}

/** One stage of a paper's journey, as configured and as it actually went. */
export interface ClearanceStage {
  stage: ClearanceStageName;
  mode: StageMode;
  mandatory: boolean;
  /** The role that clears it, not the person — people are delegated in. */
  actorRole: string;
  actor?: string;
  status: StageStatus;
  /** FR-SUB-14 — the configured service time, in hours. */
  serviceHours: number;
  startedAt?: string;
  dueAt?: string;
  decidedAt?: string;
  /** FR-SUB-08 — why a conditional stage applies, or does not. */
  condition?: string;
}

/** FR-SUB-10 — the threaded clearance history against a paper. */
export interface ClearanceComment {
  id: string;
  at: string;
  by: string;
  role: string;
  stage: ClearanceStageName | "Submission";
  decision?: ClearanceDecision;
  body: string;
  /** Set where this is a submitter's reply to an earlier comment. */
  replyToId?: string;
}

export interface SubmissionVersion {
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  note: string;
}

/** FR-SUB-15 — an authorised skip of a mandatory stage. */
export interface ClearanceException {
  authorisedBy: string;
  reference: string;
  at: string;
  reason: string;
  stagesSkipped: ClearanceStageName[];
}

export interface Submission {
  id: string;
  title: string;
  templateId: string;
  /** FR-SUB-02 — a submission that does not conform is refused, not filed. */
  templateIssues: string[];
  metadata: SubmissionMetadata;
  status: SubmissionStatus;
  createdAt: string;
  submittedAt?: string;
  submittedBy: string;
  /** The sitting's submission deadline, copied at submission time. */
  deadline: string;
  /** FR-SUB-13 — arrived after the deadline. */
  late: boolean;
  lateAuthorisedBy?: string;
  lateAuthorisationRef?: string;
  stages: ClearanceStage[];
  comments: ClearanceComment[];
  versions: SubmissionVersion[];
  files: SubmissionFile[];
  exception?: ClearanceException;
}

/** FR-SUB-07 / 08 — a named routing configuration. */
export interface ClearancePath {
  id: string;
  name: string;
  appliesWhen: string;
  stages: {
    stage: ClearanceStageName;
    mode: StageMode;
    mandatory: boolean;
    actorRole: string;
    serviceHours: number;
    condition?: string;
  }[];
}

/* ---------- FR VID — secure video conferencing ---------- */

export type VideoSessionState =
  | "Scheduled"
  | "Waiting room open"
  | "In progress"
  | "Ended"
  | "Cancelled";

/** FR-VID-16 — one participant list, whether they are in the room or remote. */
export type JoinMode = "In the room" | "Remote" | "External";

/** FR-VID-02 / 03 — the authorisation a join is checked against. */
export interface JoinAuthorisation {
  id: string;
  sessionId: string;
  meetingId: string;
  name: string;
  role: string;
  mode: JoinMode;
  /** FR-VID-03 — required for privileged and remote participants. */
  mfaRequired: boolean;
  mfaMethod?: string;
  /** FR-VID-14 — external participation is pre-approved and scoped. */
  approvedBy?: string;
  scopeNote?: string;
  identityVerified?: boolean;
  state: "Authorised" | "Awaiting approval" | "Declined" | "Revoked";
}

export type VideoAttendanceState =
  | "Admitted"
  | "In waiting room"
  | "Refused"
  | "Left"
  | "Not joined";

/** FR-VID-05 / 06 / 15 — one person's participation in one session. */
export interface VideoAttendance {
  id: string;
  sessionId: string;
  name: string;
  role: string;
  mode: JoinMode;
  state: VideoAttendanceState;
  joinedAt?: string;
  leftAt?: string;
  muted: boolean;
  /** FR-VID-07 — off unless the host grants it for this session. */
  screenShareGranted: boolean;
  mfaMethod?: string;
}

/** FR-VID-15 — everything a session did, in order. */
export interface VideoEvent {
  id: string;
  sessionId: string;
  at: string;
  kind:
    | "Join"
    | "Leave"
    | "Admission"
    | "Refusal"
    | "Host action"
    | "Screen share"
    | "Recording"
    | "Administrative change";
  actor: string;
  detail: string;
  severity: "info" | "warning" | "critical";
}

/** FR-VID-09 — one sample of a session's quality. */
export interface QualitySample {
  minute: number;
  /** Kilobits per second, the adaptive bitrate as it actually settled. */
  bitrateKbps: number;
  packetLossPercent: number;
  latencyMs: number;
}

export interface VideoSession {
  id: string;
  meetingId: string;
  meetingTitle: string;
  roomId?: string;
  host: string;
  state: VideoSessionState;
  scheduledFor: string;
  startedAt?: string;
  endedAt?: string;
  /** FR-VID-05 */
  locked: boolean;
  /** FR-VID-06 */
  waitingRoom: boolean;
  /** FR-VID-07 — the default, before any per-participant grant. */
  screenShareHostOnly: boolean;
  /** FR-VID-08 — presented from within the platform, never a file share. */
  presentingPackId?: string;
  /** FR-VID-11 / 12 */
  recordingEnabled: boolean;
  recordingApproval?: string;
  /** FR-VID-09 */
  quality: QualitySample[];
  qualityRating: "Good" | "Fair" | "Poor";
  /** FR-VID-17 — Release 2. */
  breakoutRooms: { id: string; name: string; participants: string[] }[];
}

/** FR-VID-11 — the approved policy, without which recording stays off. */
export interface RecordingPolicy {
  enabledByDefault: boolean;
  storageLocation: string;
  retentionDays: number;
  authorisationPath: string[];
  accessRights: string;
  approvedBy: string;
  approvedAt: string;
  /** FR-VID-12 — the notice shown while recording runs. */
  participantNotice: string;
}

/** FR-VID-13 — Release 2. */
export interface RecordingRecord {
  id: string;
  sessionId: string;
  meetingTitle: string;
  recordedAt: string;
  durationMinutes: number;
  classification: Classification;
  storageLocation: string;
  retainUntil: string;
  accessGrantedTo: string[];
  state: "Held" | "Disposed" | "Awaiting disposal";
  disposedAt?: string;
}

/** FR-VID-10 — the media chain in a room. */
export interface RoomMedia {
  roomId: string;
  camera: string;
  ptz: boolean;
  presets: string[];
  microphones: string;
  dsp: string;
  speakers: string;
  echoCancellation: boolean;
  lastCalibrated: string;
}

/* ---------- FR PRS — meeting presentation and IMAGO room collaboration ---------- */

export type AssetKind =
  | "OPS PC"
  | "Screen"
  | "Camera"
  | "Microphone"
  | "Stand"
  | "Accessory";

/** FR-PRS-10 — every item under Government control, on the register. */
export interface RoomAsset {
  id: string;
  label: string;
  kind: AssetKind;
  roomId: string;
  assetTag: string;
  serial: string;
  model: string;
  commissionedAt: string;
  warrantyUntil?: string;
  status: "Online" | "Offline" | "In maintenance";
  /** Only a computing endpoint carries a baseline; a stand does not. */
  managed: boolean;
}

export interface Room {
  id: string;
  name: string;
  location: string;
  kind: "Cabinet room" | "Committee room" | "Briefing room";
  seats: number;
  /** FR-PRS-06 — what the screens show when nothing is being presented. */
  idleDisplay: "Agenda and meeting status" | "Blank";
  /** FR-PRS-14 */
  wirelessCasting: "Disabled" | "Moderated";
  guestTrafficIsolated: boolean;
  /** FR-PRS-15 */
  recording: "Permitted" | "Blocked";
  /** FR-PRS-07 */
  whiteboarding: "Enabled" | "Disabled";
}

/** FR-PRS-12 — the Windows 11 Professional security baseline, per device. */
export interface BaselineState {
  assetId: string;
  diskEncryption: boolean;
  localFirewall: boolean;
  antiMalware: boolean;
  updatePolicy: "Current" | "Behind";
  screenLockMinutes: number;
  localAdminRestricted: boolean;
  lastChecked: string;
}

/** FR-PRS-09 */
export interface AllowlistEntry {
  id: string;
  name: string;
  publisher: string;
  category: "e-Cabinet" | "Conferencing" | "Presentation" | "System";
  state: "Approved" | "Blocked";
  note?: string;
}

/** FR-PRS-13 / 14 — set centrally, applied per room. */
export interface PeripheralPolicy {
  roomId: string;
  usbMassStorage: "Disabled" | "Read-only, approved transfers";
  wifi: "Disabled" | "Managed network only";
  bluetooth: "Disabled" | "Input devices only";
  wirelessCasting: "Disabled" | "Moderated";
  guestTrafficIsolated: boolean;
  lastApplied: string;
}

/** FR-PRS-15 */
export interface AvPolicy {
  roomId: string;
  whoMayStart: string;
  recording: "Permitted" | "Blocked";
  recordingApproval?: string;
  cameraShutdown: "At session end" | "Manual";
  microphoneDefault: "Muted" | "Live";
  privacyShutter: boolean;
}

/** FR-PRS-08 — a session, and the clear-down that has to follow it. */
export interface RoomSession {
  id: string;
  roomId: string;
  meetingId: string;
  meetingTitle: string;
  host: string;
  startedAt: string;
  endedAt?: string;
  /** FR-PRS-01 / 04 — what was put on the screens, and by whom. */
  itemsPresented: number;
  papersPresented: number;
  /** FR-PRS-07 */
  whiteboardCaptured: boolean;
  recorded: boolean;
  /** FR-PRS-08 — state, cache, credentials and annotations cleared. */
  clearDown: "Confirmed" | "Failed" | "Pending";
  clearDownAt?: string;
  clearDownNote?: string;
}

/** FR-PRS-11 */
export interface EndpointEvent {
  id: string;
  at: string;
  assetId: string;
  roomId: string;
  kind:
    | "Sign-in"
    | "Administrative change"
    | "Application access"
    | "Software update"
    | "Device error";
  actor: string;
  detail: string;
  severity: "info" | "warning" | "critical";
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

/** Daily endpoint activity, for the rooms dashboard. */
export interface EndpointDay {
  date: string;
  signIns: number;
  changes: number;
  errors: number;
}

/* ---------- FR REV — review, annotation and acknowledgement ---------- */

export type AnnotationKind = "Highlight" | "Note" | "Bookmark";

/**
 * FR-REV-03 / 05 / 09 — private to its author. No administrator reads these,
 * they are encrypted at rest, and they stay bound to the version annotated.
 */
export interface Annotation {
  id: string;
  readerId: string;
  packId: string;
  meetingId: string;
  documentId: string;
  documentTitle: string;
  /** FR-REV-05 — bound to the version, not to the document. */
  versionId: string;
  page: number;
  kind: AnnotationKind;
  /** The passage the note hangs off, where there is one. */
  anchorText?: string;
  body: string;
  createdAt: string;
  /** FR-REV-11 — Release 2, and only where the Secretariat enables it. */
  sharedWithGroup?: string;
}

/** FR-REV-04 — visible to named recipients, unlike a private note. */
export interface FormalComment {
  id: string;
  readerId: string;
  author: string;
  packId: string;
  meetingId: string;
  documentId: string;
  documentTitle: string;
  page?: number;
  body: string;
  recipients: string[];
  at: string;
  replies: { id: string; by: string; role: string; at: string; body: string }[];
  status: "Open" | "Answered" | "Closed";
}

/** FR-REV-08 — surfaces on the Secretariat dashboard, not only in the reader's copy. */
export interface ReviewFlag {
  id: string;
  readerId: string;
  raisedBy: string;
  kind: "Requires attention" | "Requires discussion";
  packId: string;
  meetingId: string;
  documentId: string;
  documentTitle: string;
  agendaItemTitle: string;
  note: string;
  at: string;
  status: "Open" | "Scheduled" | "Resolved";
  /** Set when the Secretariat has placed it on an agenda. */
  scheduledFor?: string;
}

/** One paper as it appears in a reader's list (FR-REV-01 / 02 / 07). */
export interface ReadingItem {
  packId: string;
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  agendaItemTitle: string;
  documentId: string;
  documentTitle: string;
  classification: Classification;
  versionId: string;
  pages: number;
  releasedAt: string;
  /** FR-REV-07 — recorded with its timestamp. */
  acknowledgedAt?: string;
  /** Pages the reader has opened, for the progress a reading list shows. */
  pagesRead: number;
  /** FR-REV-06 — set where the version annotated has since been replaced. */
  supersededByVersionId?: string;
}

/** A reader's own activity, for the reading-room dashboard. */
export interface ReviewDay {
  date: string;
  notes: number;
  comments: number;
  flags: number;
}

/* ---------- FR DOC — classification, security and handling controls ---------- */

export type HandlingRight = "Blocked" | "Authorised roles" | "Permitted";

/** FR-DOC-02 — classification is the operative input, not a label on a page. */
export interface HandlingRule {
  classification: Classification;
  whoMayView: string;
  download: HandlingRight;
  print: HandlingRight;
  offline: HandlingRight;
  recording: HandlingRight;
  /** FR-DOC-13 — how long access survives the meeting. */
  retentionDays: number;
  /** FR-DOC-08 — whether a watermark is stamped on view and print. */
  watermark: boolean;
}

/** FR-DOC-08 / 09 */
export interface WatermarkPolicy {
  classification: Classification;
  onView: boolean;
  onPrint: boolean;
  fields: string[];
}

/** FR-DOC-03 / 04 */
export interface ReclassificationRequest {
  id: string;
  documentId: string;
  documentTitle: string;
  from: Classification;
  to: Classification;
  direction: "Raised" | "Lowered";
  reason: string;
  requestedBy: string;
  requestedAt: string;
  status: "Pending" | "Applied" | "Declined";
  decidedBy?: string;
  decidedAt?: string;
}

/** FR-DOC-14 */
export interface Revocation {
  id: string;
  scope: "Document" | "Pack" | "Version";
  targetId: string;
  targetTitle: string;
  audience: "All users" | "Named users";
  users: string[];
  reason: string;
  by: string;
  at: string;
  restoredAt?: string;
}

/** FR-DOC-15 / 16 / 17 / 19 */
export interface SecureEndpoint {
  id: string;
  label: string;
  location: string;
  kind: "IMAGO room endpoint" | "Room tablet" | "Room display";
  /** Must be false — FR-DOC-15. */
  persistentStorage: boolean;
  cacheEncrypted: boolean;
  cacheScope: "Current session only" | "Unbounded";
  /** Must be false on a shared device — FR-DOC-19. */
  offlineEnabled: boolean;
  lastSessionPackId?: string;
  lastVerifiedAt?: string;
  /** FR-DOC-17 — what the post-session inspection found. */
  verification: "Clean" | "Remnant found" | "Not verified";
  note?: string;
}

/** FR-DOC-18 — Release 2. */
export interface OfflineGrant {
  id: string;
  userName: string;
  deviceLabel: string;
  packId: string;
  grantedAt: string;
  expiresAt: string;
  status: "Active" | "Expired" | "Wiped" | "Awaiting sync";
  lastSyncAt?: string;
  wipeRequestedAt?: string;
}

/** FR-DOC-20 — Release 2. */
export interface TransferRecord {
  id: string;
  direction: "Import" | "Export";
  title: string;
  classification: Classification;
  counterparty: string;
  reference: string;
  approvedBy?: string;
  by: string;
  at: string;
  status: "Completed" | "Awaiting approval" | "Declined";
}

/** FR-DOC-05 / 06 / 07 */
export interface EncryptionLayer {
  id: string;
  layer: string;
  state: "Encrypted" | "Partial" | "Not encrypted";
  algorithm: string;
  keyTier: "HSM" | "Application";
  lastVerified: string;
  note?: string;
}

export interface KeyRecord {
  id: string;
  label: string;
  purpose: string;
  module: string;
  rotatedAt: string;
  nextRotation: string;
  /** FR-DOC-07 — never true: a key the application can export is not protected. */
  exportable: boolean;
}

/** FR-DOC-13 — one document's access clock. */
export interface AccessExpiry {
  documentId: string;
  title: string;
  classification: Classification;
  meetingId?: string;
  expiresAt: string;
  basis: "Meeting end" | "Retention period" | "Role loss";
  holders: number;
}

/** Print and download activity, for the security dashboard (FR-DOC-11). */
export interface HandlingDay {
  date: string;
  prints: number;
  downloads: number;
  blocked: number;
}

/* ---------- FR PCK — pack assembly, freeze, release and version control ---------- */

export type PackState =
  | "In assembly"
  | "Frozen"
  | "Released"
  | "Recalled"
  | "Superseded";

/** FR-PCK-12 — an addendum is not a replacement, and must never read as one. */
export type PackKind = "Primary" | "Supplementary" | "Addendum";

/** A paper as it sits inside a pack, at the version the pack fixed. */
export interface PackPaper {
  id: string;
  title: string;
  classification: Classification;
  pages: number;
  /** FR-PCK-13 — immutable, on screen and rendered into any output. */
  versionId: string;
}

/** FR-PCK-01 — one agenda item's place in the pack, in agenda sequence. */
export interface PackItem {
  agendaItemId: string;
  order: number;
  section: string;
  title: string;
  ministry: string;
  papers: PackPaper[];
  /** FR-PCK-11 — restricted items are omitted entirely from a partial release. */
  closedSession: boolean;
  closedParticipantIds: string[];
  /** FR-PCK-16 — what is not ready about this item. */
  clearanceComplete: boolean;
  unresolvedComments: number;
}

/** FR-PCK-05 / 06 / 07 — a frozen pack is replaced, never edited. */
export interface PackVersion {
  version: number;
  /** FR-PCK-13 — the identifier that travels with every rendering. */
  versionId: string;
  createdAt: string;
  /** FR-PCK-06 — required on any replacement. */
  authorisedBy?: string;
  reason?: string;
  supersededAt?: string;
  supersededByVersionId?: string;
}

/** FR-PCK-10 */
export interface PackAcknowledgement {
  participantId: string;
  name: string;
  ministry: string;
  receivedAt?: string;
  readAt?: string;
  /** FR-PCK-08 — which version they actually hold. */
  versionId: string;
}

/** FR-PCK-15 */
export interface PreStagingTarget {
  id: string;
  location: string;
  kind: "Cabinet room" | "Committee room" | "IMAGO endpoint" | "Secure store";
  status: "Not started" | "Staging" | "Staged" | "Failed";
  stagedAt?: string;
  note?: string;
}

/** FR-PCK-11 — a participant's copy with restricted items removed. */
export interface PartialRelease {
  participantId: string;
  name: string;
  omittedItemTitles: string[];
}

/** FR-PCK-17 — release forced past a failed readiness check. */
export interface PackOverride {
  by: string;
  reference: string;
  reason: string;
  at: string;
  failuresAccepted: string[];
}

export interface Pack {
  id: string;
  meetingId: string;
  title: string;
  kind: PackKind;
  state: PackState;
  /** FR-PCK-03 — inherited: the highest classification the pack contains. */
  classification: Classification;
  freezeCutOff: string;
  frozenAt?: string;
  frozenBy?: string;
  releasedAt?: string;
  releasedBy?: string;
  recalledAt?: string;
  recalledBy?: string;
  recallReason?: string;
  items: PackItem[];
  versions: PackVersion[];
  currentVersionId: string;
  acknowledgements: PackAcknowledgement[];
  preStaging: PreStagingTarget[];
  partialReleases: PartialRelease[];
  override?: PackOverride;
  /** FR-PCK-14 — what pre-processing achieved, against NFR-PER-02. */
  originalMb: number;
  optimisedMb: number;
  openSeconds: number;
  /** FR-PCK-12 — set on a supplementary or addendum. */
  primaryPackId?: string;
}

/** FR-SUB-12 — a clearance role held by someone else for a period. */
export interface ClearanceDelegation {
  id: string;
  stage: ClearanceStageName;
  fromRole: string;
  fromPerson: string;
  toPerson: string;
  startsAt: string;
  endsAt: string;
  approvedBy: string;
  reason: string;
  status: "Active" | "Expired" | "Revoked";
}

/* ---------- FR DEC — decision capture and action tracking ---------- */

/**
 * FR-DEC-03 — the outcome vocabulary is configurable, so it is held as data in
 * `OUTCOME_TYPES` rather than being spelled out in each screen.
 */
export type DecisionOutcomeCode =
  | "Approved"
  | "Approved with amendment"
  | "Deferred"
  | "Referred"
  | "Noted"
  | "Rejected"
  | "Withdrawn";

/** FR-DEC-04 — draft, review, finalisation. Nothing moves backwards. */
export type DecisionState = "Draft" | "In review" | "Finalised";

/**
 * FR-DEC-05 — a finalised decision is immutable, so a change is a new record
 * that sits beside the original rather than a rewrite of it.
 */
export interface DecisionCorrection {
  id: string;
  decisionId: string;
  at: string;
  authorisedBy: string;
  reason: string;
  /** Preserved verbatim. This is the point of the record. */
  originalText: string;
  correctedText: string;
}

/** FR-DEC-01, FR-DEC-02 — one decision, against one agenda item. */
export interface DecisionRecord {
  id: string;
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  agendaItemNumber: string;
  agendaItemTitle: string;
  text: string;
  outcome: DecisionOutcomeCode;
  state: DecisionState;
  classification: Classification;
  recordedBy: string;
  recordedAt: string;
  reviewedBy?: string;
  finalisedAt?: string;
  /** FR-DEC-13 — the earlier decision this one continues. */
  supersedes?: string;
  /** Ministries the decision speaks to, for the by-ministry views. */
  ministries: string[];
}

export type ActionState =
  | "Not started"
  | "In progress"
  | "Submitted for closure"
  | "Closed"
  | "Cancelled";

/** FR-DEC-07 — narrative progress, not just a status flag. */
export interface ActionUpdate {
  id: string;
  actionId: string;
  at: string;
  by: string;
  narrative: string;
  state: ActionState;
}

/** FR-DEC-10 — what the ministry attached when it asked for closure. */
export interface ClosureEvidence {
  reference: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
}

/** FR-DEC-06, FR-DEC-08, FR-DEC-09, FR-DEC-10 */
export interface ActionRecord {
  id: string;
  decisionId: string;
  meetingId: string;
  description: string;
  instructions: string;
  ministry: string;
  officer: string;
  deadline: string;
  state: ActionState;
  /** FR-DEC-08 — where an overdue action goes, and whether it has gone there. */
  escalationPoint: string;
  escalated: boolean;
  escalatedAt?: string;
  reminderSentAt?: string;
  evidence?: ClosureEvidence;
  /** FR-DEC-10 — Secretariat verification is a separate act from closure. */
  verifiedBy?: string;
  verifiedAt?: string;
  closedAt?: string;
}

export type MinutesState = "Draft" | "In review" | "Approved" | "Circulated";

/** FR-DEC-11, FR-DEC-12 */
export interface MinutesDocument {
  id: string;
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  kind: "Minutes" | "Extract" | "Action list";
  state: MinutesState;
  classification: Classification;
  /** Named parties, never a distribution list. FR-DEC-12. */
  circulatedTo: string[];
  decisionsIncluded: string[];
  preparedBy: string;
  approvedBy?: string;
  circulatedAt?: string;
  /** An extract covers one item; minutes cover the sitting. */
  scope: string;
}

/* ---------- FR SCH — search and retrieval ---------- */

export type ArchiveKind = "Paper" | "Decision" | "Action";

/**
 * FR-SCH-09 — a scanned annexe carries no text of its own. What is searchable
 * is what OCR recovered, and the confidence is part of the record because a
 * poor scan is a reason a search missed something.
 */
export interface OcrRecord {
  pages: number;
  /** 0–1. Below `OCR_CONFIDENCE_FLOOR` the result is flagged in the list. */
  confidence: number;
  processedAt: string;
}

/**
 * One searchable thing. Papers, decisions and actions are different records in
 * different apps; the archive is where they are read as one corpus.
 */
export interface ArchiveRecord {
  id: string;
  kind: ArchiveKind;
  title: string;
  /** FR-SCH-03 — the text itself, not the metadata around it. */
  body: string;
  ministry: string;
  meetingId?: string;
  meetingTitle?: string;
  date: string;
  classification: Classification;
  status: string;
  /**
   * FR-SCH-02 — the named parties who may see this at all. A viewer outside
   * the list is not told the record exists, and it is removed before anything
   * is counted.
   */
  entitledTo: string[];
  ocr?: OcrRecord;
  pages?: number;
}

export interface SearchFilters {
  kinds: ArchiveKind[];
  ministry: string;
  meeting: string;
  classification: string;
  status: string;
  /** Inclusive ISO dates. Empty means unbounded. */
  from: string;
  to: string;
}

/** FR-SCH-07 — a query plus its filters, kept per user and scoped to a role. */
export interface SavedSearch {
  id: string;
  name: string;
  owner: string;
  /** The role the view belongs to; a saved search does not widen entitlement. */
  role: string;
  query: string;
  filters: SearchFilters;
  createdAt: string;
  lastRunAt?: string;
  lastResultCount?: number;
}

/** FR-SCH-06 — every query, who ran it, and how many results came back. */
export interface QueryLogEntry {
  id: string;
  at: string;
  actor: string;
  role: string;
  query: string;
  /** Human-readable summary of the filters applied. */
  filterSummary: string;
  resultCount: number;
  /** FR-SCH-08 — measured against NFR-PER-04. */
  elapsedMs: number;
}

/** FR-SCH-04, FR-SCH-05 — where the index lives and how it is protected. */
export interface IndexSegment {
  kind: ArchiveKind;
  documents: number;
  /** Full-text terms held for this segment. */
  terms: number;
  sizeMb: number;
  lastBuiltAt: string;
}

/* ---------- FR NOT — notification, reminder and escalation ---------- */

/**
 * The events that generate a notification. FR-NOT-01 to FR-NOT-05 name these
 * exactly, so the union is the requirement list rather than a guess at it.
 */
export type NotificationTrigger =
  | "Meeting created"
  | "Meeting amended"
  | "Meeting postponed"
  | "Meeting cancelled"
  | "Pack released"
  | "Pack superseded"
  | "Submission deadline approaching"
  | "Submission deadline missed"
  | "Clearance awaiting action"
  | "Clearance service time breached"
  | "Action assigned"
  | "Action deadline approaching"
  | "Action escalated";

export type NotificationChannel = "In-platform" | "Email" | "SMS";

export type DeliveryState = "Delivered" | "Pending" | "Failed";

/**
 * FR-NOT-06 and FR-NOT-07 are enforced here rather than in each message: a
 * template that carried content or an attachment could not be sent, because
 * there is no field on the record for either.
 */
export interface NotificationTemplate {
  id: string;
  trigger: NotificationTrigger;
  channel: NotificationChannel;
  /** No classification-bearing text. Reviewed against handling policy. */
  subject: string;
  /** Never the paper. Says what happened and where to go, and nothing else. */
  body: string;
  /** FR-NOT-07 — where the recipient lands once inside the platform. */
  deepLink: string;
  /** The call-to-action wording on that link. */
  linkLabel: string;
  reviewedBy: string;
  reviewedAt: string;
}

/** FR-NOT-01 to FR-NOT-05 — which event notifies whom, and when. */
export interface TriggerRule {
  id: string;
  trigger: NotificationTrigger;
  /** Roles, never individuals. Membership is resolved at send time. */
  recipients: string[];
  channels: NotificationChannel[];
  /** Hours before the deadline the reminder goes out; null where not timed. */
  reminderLeadHours: number | null;
  /** Hours after which an unmet item escalates; null where it does not. */
  escalateAfterHours: number | null;
  /** FR-NOT-08 — a mandatory notification cannot be switched off by anyone. */
  mandatory: boolean;
  requirement: string;
}

/** FR-NOT-04, FR-NOT-05 — who an unmet item goes to, and after how long. */
export interface EscalationPoint {
  id: string;
  /** The clearance stage or the action type this applies to. */
  scope: string;
  kind: "Clearance stage" | "Action type";
  serviceTimeHours: number;
  escalateTo: string;
  thenTo?: string;
  notes: string;
}

/** FR-NOT-10 — every notification sent, with what happened to it. */
export interface DeliveryRecord {
  id: string;
  at: string;
  trigger: NotificationTrigger;
  templateId: string;
  recipient: string;
  role: string;
  channel: NotificationChannel;
  state: DeliveryState;
  attempts: number;
  /** Present only on a failure, and never quotes the message. */
  failureReason?: string;
  /** The record the notification points at — not its content. */
  subjectRef: string;
}

/** FR-NOT-08 — a user's own settings, within the limits policy allows. */
export interface NotificationPreference {
  trigger: NotificationTrigger;
  channels: NotificationChannel[];
  /** Mirrors the rule. A mandatory trigger renders locked, not merely unset. */
  mandatory: boolean;
}

/** FR-NOT-09 — an outstanding item in the in-platform centre. */
export interface CentreItem {
  id: string;
  at: string;
  trigger: NotificationTrigger;
  headline: string;
  detail: string;
  deepLink: string;
  linkLabel: string;
  read: boolean;
  /** True where the item is waiting on this user to do something. */
  actionable: boolean;
  dueAt?: string;
}

/* ---------- FR AUD — audit, reporting and oversight ---------- */

/** FR-AUD-04 — a verification run over a range of the log. */
export interface IntegrityRun {
  id: string;
  at: string;
  /** Inclusive range of event IDs the run covered. */
  fromEvent: string;
  toEvent: string;
  eventsChecked: number;
  /** The chain head after the run, which is what an outside party checks. */
  rootHash: string;
  result: "Verified" | "Failed";
  /** Who ran it. An internal run and an independent one are different things. */
  runBy: string;
  independent: boolean;
  durationSeconds: number;
}

/** FR-AUD-05 — the write-once store outside the administrators' reach. */
export interface ReplicationSample {
  at: string;
  /** Seconds behind the primary log. */
  lagSeconds: number;
  eventsBehind: number;
}

/** FR-AUD-15 — the four patterns the requirement names. */
export type AnomalyPattern =
  | "Bulk download"
  | "Out-of-hours access to high classification"
  | "Repeated authorisation failure"
  | "Privilege change";

export type AlertState = "Open" | "Under review" | "Closed — explained" | "Closed — acted on";

export interface AnomalyAlert {
  id: string;
  raisedAt: string;
  pattern: AnomalyPattern;
  actor: string;
  role: string;
  /** What the detector saw, in numbers rather than adjectives. */
  observation: string;
  /** The rule that fired, so the reader can judge whether it is a good rule. */
  rule: string;
  severity: "warning" | "critical";
  state: AlertState;
  /** Event IDs the alert was raised from. */
  evidence: string[];
  reviewedBy?: string;
  reviewedAt?: string;
  disposition?: string;
}

/** FR-AUD-12 — one line of a quarterly access review. */
export interface EntitlementLine {
  id: string;
  user: string;
  role: string;
  ministry: string;
  /** What the role grants, in the reviewer's language rather than the schema's. */
  entitlements: string[];
  lastActiveAt?: string;
  /** Events in the review period. Zero is the finding a review exists to make. */
  eventsInPeriod: number;
  decision: "Not reviewed" | "Confirmed" | "Reduce" | "Revoke";
  reviewedBy?: string;
  note?: string;
}

/** FR-AUD-09 — a standing report the system owner can produce. */
export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  /** Which audit actions it draws on. */
  covers: string[];
  requirement: string;
  lastRunAt?: string;
  lastRunRows?: number;
}

/** FR-AUD-14 — an export, with the attestation that makes it evidential. */
export interface ExportRecord {
  id: string;
  at: string;
  requestedBy: string;
  purpose: string;
  scope: string;
  rows: number;
  format: "CSV" | "JSON" | "PDF";
  /** The hash the recipient checks the file against. */
  digest: string;
  attestedBy: string;
  /** Where the export went. An evidential export is not a download. */
  releasedTo: string;
}

/** FR-AUD-13 — a retention class and what it is holding. */
export interface RetentionClass {
  id: string;
  name: string;
  /** Years. Government-defined; the platform does not choose it. */
  years: number;
  appliesTo: string;
  eventsHeld: number;
  oldestEvent: string;
  /**
   * FR-AUD-13 — the audit record outlives the thing it describes, so this
   * counts events whose subject document has already been destroyed.
   */
  orphanedButRetained: number;
  authority: string;
}

/* ---------- FR ADM — administration and configuration ---------- */

export type ConfigArea =
  | "Roles and permissions"
  | "Classification handling"
  | "Meeting types"
  | "Clearance paths"
  | "Retention classes"
  | "Notification templates";

/** FR-ADM-02, FR-ADM-03 — settings held as data, changed without a release. */
export interface ConfigSetting {
  id: string;
  area: ConfigArea;
  label: string;
  value: string;
  /** What the setting does, in the administrator's language. */
  description: string;
  /** FR-ADM-05 — a security-relevant change needs a second approver. */
  securityRelevant: boolean;
  requirement: string;
  lastChangedBy: string;
  lastChangedAt: string;
}

/** FR-ADM-04 — previous value, new value, actor, timestamp. All four, always. */
export interface ConfigChange {
  id: string;
  at: string;
  actor: string;
  role: string;
  area: ConfigArea;
  settingId: string;
  label: string;
  previousValue: string;
  newValue: string;
  securityRelevant: boolean;
  /** The approval that let a security-relevant change through, where one applies. */
  approvalId?: string;
}

export type ApprovalState = "Awaiting approval" | "Approved" | "Rejected";

/** FR-ADM-05 — the implementer cannot approve their own change. */
export interface ChangeApproval {
  id: string;
  submittedAt: string;
  implementer: string;
  area: ConfigArea;
  label: string;
  previousValue: string;
  proposedValue: string;
  justification: string;
  state: ApprovalState;
  approver?: string;
  decidedAt?: string;
  decisionNote?: string;
}

export type ServiceStatus = "Healthy" | "Degraded" | "Down";

/** FR-ADM-06 */
export interface ServiceHealth {
  id: string;
  name: string;
  kind: "Service" | "Storage" | "Queue" | "Backup" | "Integration";
  status: ServiceStatus;
  detail: string;
  /** Percentage used, where the measure is a capacity. */
  usedPercent?: number;
  /** Items waiting, where the measure is a queue. */
  queueDepth?: number;
  lastCheckedAt: string;
}

export type MaintenanceState = "Scheduled" | "In progress" | "Completed" | "Cancelled";

/** FR-ADM-10 */
export interface MaintenanceWindow {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  state: MaintenanceState;
  /** What stops, and what keeps running. Silence here is what alarms people. */
  affectedServices: string[];
  /** FR-ADM-10 — participants are told before, not discovered at the door. */
  notifiedAt?: string;
  notifiedGroups: string[];
  /** Whether sessions are drained rather than dropped. */
  gracefulSuspension: boolean;
  /** A window that collides with a sitting is the one nobody should approve. */
  clashesWith?: string;
  raisedBy: string;
}

export type DeviceCompliance = "Compliant" | "At risk" | "Non-compliant" | "Wiped";

/** FR-ADM-08, FR-ADM-09 */
export interface ManagedDevice {
  id: string;
  label: string;
  kind: "Laptop" | "Tablet" | "Phone" | "Room device";
  assignedTo: string;
  ministry: string;
  enrolledAt: string;
  lastSeenAt: string;
  osVersion: string;
  compliance: DeviceCompliance;
  /** Why it is not compliant, where it is not. Never just a red dot. */
  findings: string[];
  encrypted: boolean;
  /** FR-ADM-09 */
  wipedAt?: string;
  wipedBy?: string;
  reportedLost?: boolean;
}

/** FR-ADM-07 — a non-production environment configured identically. */
export interface EnvironmentRecord {
  id: string;
  name: string;
  purpose: string;
  hostedAt: string;
  /** Each line the two environments are compared on. */
  parity: { item: string; production: string; nonProduction: string; matches: boolean }[];
  lastRefreshedAt: string;
  /** Non-production must not hold real Cabinet material. */
  dataPolicy: string;
}

export type OnboardingState = "Draft" | "Validated" | "Applied" | "Rejected";

/** FR-ADM-12 */
export interface OnboardingBatch {
  id: string;
  ministry: string;
  submittedBy: string;
  submittedAt: string;
  rows: number;
  /** Rows that failed validation and why. A silent partial import is a fault. */
  errors: { row: number; field: string; problem: string }[];
  rolesAssigned: string[];
  state: OnboardingState;
  appliedAt?: string;
  appliedBy?: string;
}

/** FR-ADM-11 — administrative sessions are recorded. */
export interface AdminSession {
  id: string;
  actor: string;
  role: string;
  startedAt: string;
  endedAt?: string;
  /** Where from, so a session out of hours from outside is visible. */
  sourceAddress: string;
  purpose: string;
  changeReference?: string;
  recordingId: string;
  recordingSizeMb: number;
  retainUntil: string;
  reviewed: boolean;
}

/**
 * FR-ADM-13 — pairs of rights no single account may hold. Held as data so the
 * check is a rule the platform applies, not a policy somebody remembers.
 */
export interface DutySeparationRule {
  id: string;
  leftRight: string;
  rightRight: string;
  reason: string;
  /** Accounts currently holding both. Anything but empty is a breach. */
  breachedBy: string[];
}

/* ---------- FR DAT — data governance, retention, archival, continuity ---------- */

/** The six kinds of Cabinet record FR-DAT-02 names. */
export type RecordKind =
  | "Paper"
  | "Pack"
  | "Decision"
  | "Action"
  | "Attendance"
  | "Audit";

/** FR-DAT-01 — a class, and the rules that travel with it. */
export interface RetentionClassDef {
  id: string;
  name: string;
  /** Years. 999 means permanent preservation. */
  years: number;
  appliesTo: RecordKind[];
  /** What the platform does when the period runs out. */
  disposalAction: "Transfer to the National Archives" | "Destroy" | "Review";
  rules: string[];
  authority: string;
}

/** FR-DAT-01, FR-DAT-02 — one record, under one class. */
export interface RetainedRecord {
  id: string;
  kind: RecordKind;
  title: string;
  classification: Classification;
  createdAt: string;
  retentionClassId: string;
  /** The date the class puts on it. Null where the class is permanent. */
  expiresAt: string | null;
  /** FR-DAT-05 — a hold suspends the expiry, it does not change it. */
  holdId?: string;
  /** FR-DAT-03 — where it went, once it went. */
  transferId?: string;
}

export type HoldState = "In force" | "Lifted";

/** FR-DAT-05 */
export interface LegalHold {
  id: string;
  name: string;
  raisedBy: string;
  /** The instrument the hold rests on. A hold without one is somebody's opinion. */
  authority: string;
  raisedAt: string;
  scope: string;
  recordIds: string[];
  state: HoldState;
  liftedAt?: string;
  liftedBy?: string;
}

/** FR-DAT-03 — the three things a transfer must not lose. */
export interface ArchivalTransfer {
  id: string;
  transferredAt: string;
  destination: string;
  recordIds: string[];
  metadataPreserved: boolean;
  classificationPreserved: boolean;
  auditLinkagePreserved: boolean;
  /** What the receiving archive checks the batch against. */
  manifestDigest: string;
  acceptedBy: string;
  acceptedAt?: string;
}

export type DeletionState =
  | "Awaiting approval"
  | "Approved"
  | "Rejected"
  | "Executed";

/**
 * FR-DAT-04 — authorised approval, recorded in the audit log, and not
 * executable by a single administrator. Three separate conditions, so three
 * separate fields: the requester, the approver, and whoever carried it out.
 */
export interface DeletionRequest {
  id: string;
  requestedBy: string;
  requestedAt: string;
  scope: string;
  recordIds: string[];
  reason: string;
  state: DeletionState;
  approver?: string;
  decidedAt?: string;
  decisionNote?: string;
  executedBy?: string;
  executedAt?: string;
}

/** FR-DAT-07 — Release 2. What personal information a record holds. */
export interface PersonalDataFinding {
  id: string;
  recordId: string;
  recordTitle: string;
  category: string;
  /** How many distinct data subjects the record touches. */
  subjects: number;
  basis: string;
  detectedAt: string;
  /** Whether a person has confirmed the automated finding. */
  confirmed: boolean;
}

/** FR-DAT-08 */
export interface BackupSet {
  id: string;
  name: string;
  takenAt: string;
  sizeGb: number;
  location: string;
  encrypted: boolean;
  /** The copy an administrator cannot delete. At least one must be true. */
  immutable: boolean;
  monitored: boolean;
  verifiedAt?: string;
  state: "Verified" | "Unverified" | "Failed";
  retainUntil: string;
}

/** FR-DAT-09, FR-DAT-12 */
export interface RecoveryTest {
  id: string;
  kind: "Restore" | "Failover";
  at: string;
  scope: string;
  result: "Passed" | "Failed" | "Passed with findings";
  durationMinutes: number;
  /** Measured against the objective, not asserted. */
  rpoAchievedMinutes?: number;
  rtoAchievedMinutes?: number;
  findings: string[];
  evidenceRef: string;
  witnessedBy: string;
  /** FR-DAT-09 — whether this test is the one gating go-live. */
  goLiveGate: boolean;
}

/** FR-DAT-10 */
export interface ReplicationTarget {
  id: string;
  component: "Application configuration" | "Database" | "Document repository";
  from: string;
  to: string;
  mode: "Continuous" | "Scheduled";
  lagSeconds: number;
  lastVerifiedAt: string;
  healthy: boolean;
  note: string;
}

/** FR-DAT-11 — the five things the procedure must confirm. */
export interface RecoveryProcedure {
  rpoMinutes: number;
  rtoMinutes: number;
  decisionAuthority: string;
  /** Who may declare a disaster, in order, if the first is unreachable. */
  authorityChain: string[];
  steps: { order: number; step: string; owner: string; minutes: number }[];
  communication: { audience: string; channel: string; timing: string }[];
  lastReviewedAt: string;
  approvedBy: string;
  documentRef: string;
}

/** FR-DAT-13 — recovery needs several people, not one. */
export interface KeyCustodian {
  id: string;
  name: string;
  role: string;
  /** Where the share physically lives. */
  custody: string;
  lastVerifiedAt: string;
  available: boolean;
}

/** FR-DAT-06 — where a store physically is, and who operates it. */
export interface ResidencyRecord {
  id: string;
  store: string;
  contents: string;
  site: string;
  country: string;
  operator: string;
  /** Anything that leaves the country would show here. Nothing should. */
  leavesMalawi: boolean;
  note: string;
}
