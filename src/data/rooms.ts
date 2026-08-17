import type {
  AllowlistEntry,
  AvPolicy,
  BaselineState,
  EndpointDay,
  EndpointEvent,
  PeripheralPolicy,
  Room,
  RoomAsset,
  RoomSession,
} from "@/models/response/base-response";

/**
 * FR PRS seed state — the rooms and the devices in them.
 *
 * This is the administrative half of the requirement set. The presenting half
 * (FR-PRS-01 … 07 — host control, presenter view, whiteboarding) happens in the
 * room during a sitting; what is kept here is the configuration that governs it
 * and the record of what each session did.
 */

/** FR-PRS-12 — the baseline every managed endpoint is held to. */
export const BASELINE_CONTROLS = [
  { id: "diskEncryption", label: "Disk encryption", detail: "BitLocker, TPM-backed, full volume" },
  { id: "localFirewall", label: "Local firewall", detail: "Enabled on all profiles, inbound denied by default" },
  { id: "antiMalware", label: "Anti-malware", detail: "Managed agent, real-time protection on" },
  { id: "updatePolicy", label: "Update policy", detail: "Security updates within seven days of release" },
  { id: "screenLock", label: "Screen lock", detail: "Locks after five minutes idle" },
  { id: "localAdminRestricted", label: "Local administrator restricted", detail: "No interactive local administrator" },
] as const;

export const SCREEN_LOCK_LIMIT_MINUTES = 5;

export const seedRooms: Room[] = [
  {
    id: "ROOM-CAB",
    name: "Cabinet Room",
    location: "Capital Hill, Lilongwe",
    kind: "Cabinet room",
    seats: 28,
    idleDisplay: "Agenda and meeting status",
    wirelessCasting: "Disabled",
    guestTrafficIsolated: true,
    recording: "Blocked",
    whiteboarding: "Enabled",
  },
  {
    id: "ROOM-CMB",
    name: "Committee Room B",
    location: "Capital Hill, Lilongwe",
    kind: "Committee room",
    seats: 14,
    idleDisplay: "Agenda and meeting status",
    wirelessCasting: "Moderated",
    guestTrafficIsolated: true,
    recording: "Permitted",
    whiteboarding: "Enabled",
  },
  {
    id: "ROOM-SH",
    name: "State House Briefing Room",
    location: "State House, Lilongwe",
    kind: "Briefing room",
    seats: 10,
    idleDisplay: "Blank",
    wirelessCasting: "Disabled",
    guestTrafficIsolated: true,
    recording: "Blocked",
    whiteboarding: "Disabled",
  },
];

/** FR-PRS-10 */
export const seedAssets: RoomAsset[] = [
  { id: "AST-001", label: "Cabinet Room — OPS PC", kind: "OPS PC", roomId: "ROOM-CAB", assetTag: "GOM-ICT-04411", serial: "OPS7-4471-093", model: "IMAGO OPS module i7", commissionedAt: "2026-04-01", warrantyUntil: "2029-04-01", status: "Online", managed: true },
  { id: "AST-002", label: "Cabinet Room — main screen", kind: "Screen", roomId: "ROOM-CAB", assetTag: "GOM-ICT-04412", serial: "IMG86-2201", model: "IMAGO 86in interactive", commissionedAt: "2026-04-01", warrantyUntil: "2029-04-01", status: "Online", managed: true },
  { id: "AST-003", label: "Cabinet Room — second screen", kind: "Screen", roomId: "ROOM-CAB", assetTag: "GOM-ICT-04413", serial: "IMG86-2202", model: "IMAGO 86in interactive", commissionedAt: "2026-04-01", warrantyUntil: "2029-04-01", status: "Online", managed: true },
  { id: "AST-004", label: "Cabinet Room — camera", kind: "Camera", roomId: "ROOM-CAB", assetTag: "GOM-ICT-04414", serial: "CAM-9911", model: "PTZ 4K, privacy shutter", commissionedAt: "2026-04-01", status: "Online", managed: true },
  { id: "AST-005", label: "Cabinet Room — ceiling microphone array", kind: "Microphone", roomId: "ROOM-CAB", assetTag: "GOM-ICT-04415", serial: "MIC-3320", model: "Beamforming array", commissionedAt: "2026-04-01", status: "Online", managed: true },
  { id: "AST-006", label: "Cabinet Room — motorised stand", kind: "Stand", roomId: "ROOM-CAB", assetTag: "GOM-ICT-04416", serial: "STD-1180", model: "Height-adjustable floor stand", commissionedAt: "2026-04-01", status: "Online", managed: false },

  { id: "AST-011", label: "Committee Room B — OPS PC", kind: "OPS PC", roomId: "ROOM-CMB", assetTag: "GOM-ICT-04421", serial: "OPS7-4471-118", model: "IMAGO OPS module i7", commissionedAt: "2026-04-08", warrantyUntil: "2029-04-08", status: "Online", managed: true },
  { id: "AST-012", label: "Committee Room B — display", kind: "Screen", roomId: "ROOM-CMB", assetTag: "GOM-ICT-04422", serial: "IMG75-3310", model: "IMAGO 75in interactive", commissionedAt: "2026-04-08", warrantyUntil: "2029-04-08", status: "In maintenance", managed: true },
  { id: "AST-013", label: "Committee Room B — camera", kind: "Camera", roomId: "ROOM-CMB", assetTag: "GOM-ICT-04423", serial: "CAM-9942", model: "PTZ 4K, privacy shutter", commissionedAt: "2026-04-08", status: "Online", managed: true },
  { id: "AST-014", label: "Committee Room B — table microphones", kind: "Microphone", roomId: "ROOM-CMB", assetTag: "GOM-ICT-04424", serial: "MIC-3355", model: "Boundary array, 6 units", commissionedAt: "2026-04-08", status: "Online", managed: true },

  { id: "AST-021", label: "State House — OPS PC", kind: "OPS PC", roomId: "ROOM-SH", assetTag: "GOM-ICT-04431", serial: "OPS7-4471-204", model: "IMAGO OPS module i7", commissionedAt: "2026-08-12", warrantyUntil: "2029-08-12", status: "Online", managed: true },
  { id: "AST-022", label: "State House — briefing screen", kind: "Screen", roomId: "ROOM-SH", assetTag: "GOM-ICT-04432", serial: "IMG65-4410", model: "IMAGO 65in interactive", commissionedAt: "2026-08-12", warrantyUntil: "2029-08-12", status: "Online", managed: true },
  { id: "AST-023", label: "State House — camera", kind: "Camera", roomId: "ROOM-SH", assetTag: "GOM-ICT-04433", serial: "CAM-9970", model: "PTZ 4K, privacy shutter", commissionedAt: "2026-08-12", status: "Offline", managed: true },
];

/** FR-PRS-12 — compliance as last measured, not as configured. */
export const seedBaselines: BaselineState[] = [
  { assetId: "AST-001", diskEncryption: true, localFirewall: true, antiMalware: true, updatePolicy: "Current", screenLockMinutes: 5, localAdminRestricted: true, lastChecked: "2026-08-15T02:10" },
  { assetId: "AST-002", diskEncryption: true, localFirewall: true, antiMalware: true, updatePolicy: "Current", screenLockMinutes: 5, localAdminRestricted: true, lastChecked: "2026-08-15T02:10" },
  { assetId: "AST-003", diskEncryption: true, localFirewall: true, antiMalware: true, updatePolicy: "Current", screenLockMinutes: 5, localAdminRestricted: true, lastChecked: "2026-08-15T02:11" },
  { assetId: "AST-004", diskEncryption: true, localFirewall: true, antiMalware: true, updatePolicy: "Current", screenLockMinutes: 5, localAdminRestricted: true, lastChecked: "2026-08-15T02:11" },
  { assetId: "AST-005", diskEncryption: true, localFirewall: true, antiMalware: true, updatePolicy: "Current", screenLockMinutes: 5, localAdminRestricted: true, lastChecked: "2026-08-15T02:12" },
  // Committee Room B fell behind while the display was out for repair.
  { assetId: "AST-011", diskEncryption: true, localFirewall: true, antiMalware: true, updatePolicy: "Behind", screenLockMinutes: 15, localAdminRestricted: true, lastChecked: "2026-08-15T02:12" },
  { assetId: "AST-012", diskEncryption: true, localFirewall: true, antiMalware: false, updatePolicy: "Behind", screenLockMinutes: 15, localAdminRestricted: true, lastChecked: "2026-08-13T02:12" },
  { assetId: "AST-013", diskEncryption: true, localFirewall: true, antiMalware: true, updatePolicy: "Current", screenLockMinutes: 5, localAdminRestricted: true, lastChecked: "2026-08-15T02:13" },
  { assetId: "AST-014", diskEncryption: true, localFirewall: true, antiMalware: true, updatePolicy: "Current", screenLockMinutes: 5, localAdminRestricted: true, lastChecked: "2026-08-15T02:13" },
  // Newly commissioned; the local administrator account has not been removed.
  { assetId: "AST-021", diskEncryption: true, localFirewall: true, antiMalware: true, updatePolicy: "Current", screenLockMinutes: 5, localAdminRestricted: false, lastChecked: "2026-08-15T02:14" },
  { assetId: "AST-022", diskEncryption: true, localFirewall: true, antiMalware: true, updatePolicy: "Current", screenLockMinutes: 5, localAdminRestricted: true, lastChecked: "2026-08-15T02:14" },
  { assetId: "AST-023", diskEncryption: true, localFirewall: true, antiMalware: true, updatePolicy: "Current", screenLockMinutes: 5, localAdminRestricted: true, lastChecked: "2026-08-14T02:14" },
];

/** FR-PRS-09 */
export const seedAllowlist: AllowlistEntry[] = [
  { id: "APP-01", name: "e-Cabinet console", publisher: "Bahamus Limited", category: "e-Cabinet", state: "Approved" },
  { id: "APP-02", name: "e-Cabinet room presenter", publisher: "Bahamus Limited", category: "Presentation", state: "Approved" },
  { id: "APP-03", name: "IMAGO whiteboard", publisher: "IMAGO", category: "Presentation", state: "Approved", note: "Capture to the meeting record where the Secretariat elects" },
  { id: "APP-04", name: "Secure conferencing client", publisher: "Government of Malawi", category: "Conferencing", state: "Approved" },
  { id: "APP-05", name: "Endpoint management agent", publisher: "Government of Malawi", category: "System", state: "Approved" },
  { id: "APP-06", name: "Anti-malware agent", publisher: "Government of Malawi", category: "System", state: "Approved" },
  { id: "APP-90", name: "Web browser — general browsing", publisher: "Various", category: "System", state: "Blocked", note: "The presenter serves documents from within the platform; there is no browsing need in the room" },
  { id: "APP-91", name: "Office productivity suite", publisher: "Various", category: "System", state: "Blocked", note: "Presenting from a local file is what FR-PRS-03 exists to prevent" },
  { id: "APP-92", name: "Consumer conferencing apps", publisher: "Various", category: "Conferencing", state: "Blocked" },
  { id: "APP-93", name: "Removable media tools", publisher: "Various", category: "System", state: "Blocked" },
];

/** FR-PRS-13 / 14 */
export const seedPeripheralPolicies: PeripheralPolicy[] = [
  { roomId: "ROOM-CAB", usbMassStorage: "Disabled", wifi: "Disabled", bluetooth: "Input devices only", wirelessCasting: "Disabled", guestTrafficIsolated: true, lastApplied: "2026-08-14T02:00" },
  { roomId: "ROOM-CMB", usbMassStorage: "Read-only, approved transfers", wifi: "Managed network only", bluetooth: "Input devices only", wirelessCasting: "Moderated", guestTrafficIsolated: true, lastApplied: "2026-08-14T02:00" },
  { roomId: "ROOM-SH", usbMassStorage: "Disabled", wifi: "Disabled", bluetooth: "Disabled", wirelessCasting: "Disabled", guestTrafficIsolated: true, lastApplied: "2026-08-14T02:00" },
];

/** FR-PRS-15 */
export const seedAvPolicies: AvPolicy[] = [
  { roomId: "ROOM-CAB", whoMayStart: "Secretariat administrators only", recording: "Blocked", cameraShutdown: "At session end", microphoneDefault: "Muted", privacyShutter: true },
  { roomId: "ROOM-CMB", whoMayStart: "Secretariat administrators and the committee chair", recording: "Permitted", recordingApproval: "Written approval of the committee chair, minuted", cameraShutdown: "At session end", microphoneDefault: "Muted", privacyShutter: true },
  { roomId: "ROOM-SH", whoMayStart: "Secretariat administrators only", recording: "Blocked", cameraShutdown: "At session end", microphoneDefault: "Muted", privacyShutter: true },
];

/** FR-PRS-08 */
export const seedSessions: RoomSession[] = [
  {
    id: "RS-2026-0141",
    roomId: "ROOM-CAB",
    meetingId: "MTG-2026-013",
    meetingTitle: "13th Ordinary Cabinet Sitting",
    host: "Larry (Secretariat)",
    startedAt: "2026-08-04T08:42",
    endedAt: "2026-08-04T12:38",
    itemsPresented: 3,
    papersPresented: 2,
    whiteboardCaptured: false,
    recorded: false,
    clearDown: "Confirmed",
    clearDownAt: "2026-08-04T12:39",
  },
  {
    id: "RS-2026-0142",
    roomId: "ROOM-CMB",
    meetingId: "MTG-2026-013",
    meetingTitle: "Economic Affairs Committee — working session",
    host: "Larry (Secretariat)",
    startedAt: "2026-08-04T14:05",
    endedAt: "2026-08-04T15:50",
    itemsPresented: 2,
    papersPresented: 2,
    whiteboardCaptured: true,
    recorded: true,
    clearDown: "Failed",
    clearDownAt: "2026-08-04T15:52",
    clearDownNote:
      "Rendered page cache survived the automatic clear-down. Cleared manually and the endpoint held out of service until the next verification passes.",
  },
  {
    id: "RS-2026-0143",
    roomId: "ROOM-CAB",
    meetingId: "MTG-2026-014",
    meetingTitle: "14th Ordinary Cabinet Sitting — rehearsal",
    host: "Larry (Secretariat)",
    startedAt: "2026-08-15T07:30",
    itemsPresented: 1,
    papersPresented: 1,
    whiteboardCaptured: false,
    recorded: false,
    clearDown: "Pending",
  },
];

/** FR-PRS-11 */
export const seedEndpointEvents: EndpointEvent[] = [
  { id: "EV-9001", at: "2026-08-15T07:30", assetId: "AST-001", roomId: "ROOM-CAB", kind: "Sign-in", actor: "Larry (Secretariat)", detail: "Presenter signed in for the 14th Sitting rehearsal", severity: "info" },
  { id: "EV-9002", at: "2026-08-15T02:14", assetId: "AST-021", roomId: "ROOM-SH", kind: "Administrative change", actor: "R. Kamanga (adm-rkamanga)", detail: "Local administrator account retained during commissioning — baseline exception pending removal", severity: "critical" },
  { id: "EV-9003", at: "2026-08-14T22:40", assetId: "AST-023", roomId: "ROOM-SH", kind: "Device error", actor: "System", detail: "Camera stopped responding on the management network; last seen 22:38", severity: "critical" },
  { id: "EV-9004", at: "2026-08-14T02:00", assetId: "AST-011", roomId: "ROOM-CMB", kind: "Software update", actor: "System", detail: "Security update deferred — device offline during the maintenance window", severity: "warning" },
  { id: "EV-9005", at: "2026-08-13T16:22", assetId: "AST-012", roomId: "ROOM-CMB", kind: "Device error", actor: "System", detail: "Display panel reported a backlight fault and was taken into maintenance", severity: "warning", acknowledgedAt: "2026-08-13T16:40", acknowledgedBy: "R. Kamanga" },
  { id: "EV-9006", at: "2026-08-13T09:15", assetId: "AST-001", roomId: "ROOM-CAB", kind: "Application access", actor: "Larry (Secretariat)", detail: "e-Cabinet room presenter launched", severity: "info" },
  { id: "EV-9007", at: "2026-08-12T11:04", assetId: "AST-011", roomId: "ROOM-CMB", kind: "Application access", actor: "adm-rkamanga", detail: "Blocked application refused: office productivity suite", severity: "warning", acknowledgedAt: "2026-08-12T11:30", acknowledgedBy: "A. Msosa" },
  { id: "EV-9008", at: "2026-08-12T02:00", assetId: "AST-002", roomId: "ROOM-CAB", kind: "Software update", actor: "System", detail: "Security updates applied and verified", severity: "info" },
  { id: "EV-9009", at: "2026-08-04T15:52", assetId: "AST-012", roomId: "ROOM-CMB", kind: "Device error", actor: "System", detail: "Session clear-down incomplete — rendered page cache remained after session end", severity: "critical" },
  { id: "EV-9010", at: "2026-08-04T08:42", assetId: "AST-001", roomId: "ROOM-CAB", kind: "Sign-in", actor: "Larry (Secretariat)", detail: "Presenter signed in for the 13th Ordinary Sitting", severity: "info" },
];

/** Fourteen days of endpoint activity. */
export const seedEndpointDays: EndpointDay[] = [
  { date: "2026-08-02", signIns: 1, changes: 0, errors: 0 },
  { date: "2026-08-03", signIns: 2, changes: 1, errors: 0 },
  { date: "2026-08-04", signIns: 4, changes: 1, errors: 2 },
  { date: "2026-08-05", signIns: 1, changes: 0, errors: 0 },
  { date: "2026-08-06", signIns: 2, changes: 2, errors: 0 },
  { date: "2026-08-07", signIns: 1, changes: 0, errors: 1 },
  { date: "2026-08-08", signIns: 1, changes: 0, errors: 0 },
  { date: "2026-08-09", signIns: 0, changes: 0, errors: 0 },
  { date: "2026-08-10", signIns: 1, changes: 1, errors: 0 },
  { date: "2026-08-11", signIns: 3, changes: 1, errors: 0 },
  { date: "2026-08-12", signIns: 3, changes: 2, errors: 1 },
  { date: "2026-08-13", signIns: 4, changes: 1, errors: 1 },
  { date: "2026-08-14", signIns: 2, changes: 3, errors: 2 },
  { date: "2026-08-15", signIns: 2, changes: 1, errors: 0 },
];
