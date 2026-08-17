import {
  FiGrid,
  FiCalendar,
  FiFileText,
  FiCheckSquare,
  FiVideo,
  FiList,
  FiUsers,
  FiRepeat,
  FiCornerUpRight,
  FiClock,
  FiSlash,
  FiSliders,
  FiLayers,
  FiShield,
  FiKey,
  FiMonitor,
  FiLock,
  FiClipboard,
  FiUserCheck,
  FiSmartphone,
  FiInbox,
  FiUploadCloud,
  FiCornerDownLeft,
  FiEdit3,
  FiAlertTriangle,
  FiFlag,
  FiShieldOff,
  FiGitBranch,
  FiPackage,
  FiCheckCircle,
  FiSend,
  FiCopy,
  FiPlusSquare,
  FiXOctagon,
  FiServer,
  FiTag,
  FiSliders as FiRules,
  FiRefreshCw,
  FiDroplet,
  FiClock as FiExpiry,
  FiHardDrive,
  FiWifiOff,
  FiRepeat as FiTransfer,
  FiCpu,
  FiBookOpen,
  FiBook,
  FiFolder,
  FiMessageSquare,
  FiArchive,
  FiHome,
  FiTablet,
  FiCheckSquare as FiBaseline,
  FiGrid as FiApps,
  FiActivity,
  FiCamera,
  FiPlayCircle,
  FiFileText as FiLogs,
  FiUserPlus,
  FiGlobe as FiExternal,
  FiCircle as FiRecord,
  FiFilm,
  FiSpeaker,
  FiWifi,
  FiColumns,
  FiCheckCircle as FiFinalised,
  FiEdit as FiCorrection,
  FiTrendingUp as FiEscalate,
  FiBookmark as FiMinutes,
  FiLink as FiChain,
  FiUser as FiMyActions,
  FiBriefcase,
  FiSunrise,
  FiThumbsUp,
  FiArchive as FiClosed,
  FiSearch,
  FiFileText as FiArchivePapers,
  FiCheckCircle as FiArchiveDecisions,
  FiCheckSquare as FiArchiveActions,
  FiBookmark as FiSaved,
  FiBell,
  FiSend as FiDeliveryLog,
  FiAlertOctagon,
  FiMail,
  FiZap,
  FiTrendingUp,
  FiSliders as FiPrefs,
  FiFileText as FiDocHistory,
  FiUser as FiUserActivity,
  FiUserCheck as FiAccessReview,
  FiBarChart2,
  FiAlertOctagon as FiAnomalies,
  FiShield as FiIntegrity,
  FiDownload,
  FiArchive as FiRetention,
  FiSettings,
  FiSliders as FiConfig,
  FiCheckSquare as FiApprovals,
  FiClock as FiHistory,
  FiActivity as FiHealth,
  FiTool,
  FiSmartphone as FiDevices,
  FiServer as FiEnvironments,
  FiUploadCloud as FiOnboarding,
  FiFilm as FiSessions,
  FiDatabase,
  FiClock as FiClasses,
  FiFileText as FiRecords,
  FiLock as FiHolds,
  FiSend as FiTransferOut,
  FiTrash2,
  FiUsers as FiPersonal,
  FiHardDrive as FiBackups,
  FiRotateCcw as FiRestore,
  FiRepeat as FiReplication,
  FiLifeBuoy,
  FiZapOff,
  FiKey as FiCustody,
  FiGlobe as FiResidency,
} from "react-icons/fi";
import type { IconType } from "react-icons";

export interface NavSubItem {
  name: string;
  href: string;
  icon: IconType;
}

export interface NavItem extends NavSubItem {
  section?: string;
  subItems?: NavSubItem[];
}

export interface AppNavigation {
  app: string;
  match: string[];
  items: NavItem[];
}



export const meetingsNavigation: NavItem[] = [
  {
    section: "Meetings & agenda",

    name: "Overview",
    href: "/meetings-agenda/overview",
    icon: FiGrid,
  },
  {
   
    name: "Calendar",
    href: "/meetings-agenda/calendar",
    icon: FiCalendar,
  },
  {
    name: "Meetings",
    // Unused while `subItems` is present — the item renders as an accordion, not
    // a link — but kept pointing at the first child so the group still has a
    // sensible destination if it is ever flattened back into one.
    href: "/meetings-agenda/all-meetings",
    icon: FiLayers,
    subItems: [
      {
        name: "All Meetings",
        href: "/meetings-agenda/all-meetings",
        icon: FiList,
      },
      {
        name: "Series and Recurring",
        href: "/meetings-agenda/series-and-recurring",
        icon: FiRepeat,
      },
      {
        name: "Carried Forward",
        href: "/meetings-agenda/carried-forward",
        icon: FiCornerUpRight,
      },
      {
        name: "Deadlines",
        href: "/meetings-agenda/deadlines",
        icon: FiClock,
      },
      {
        name: "Cancelled and Postponed",
        href: "/meetings-agenda/cancelled-postponed",
        icon: FiSlash,
      },
    ],
  },
  {
    name: "Meeting Types",
    href: "/meetings-agenda/meeting-types",
    icon: FiSliders,
  },
];

// ─── FR IAM · Identity and Access ─────────────────────────────────────────────

export const identityNavigation: NavItem[] = [
  {
    section: "Identity & access",
    name: "Access Overview",
    href: "/identity-access/overview",
    icon: FiGrid,
  },
  {
    name: "Users",
    href: "/identity-access/users",
    icon: FiUsers,
  },
  {
    name: "Roles and Permissions",
    href: "/identity-access/roles-permissions",
    icon: FiShield,
  },
  {
    name: "Authentication",
    href: "/identity-access/authentication",
    icon: FiKey,
  },
  {
    name: "Sessions",
    href: "/identity-access/sessions",
    icon: FiMonitor,
  },
  {
    name: "Privileged Access",
    href: "/identity-access/privileged-access",
    icon: FiLock,
  },
  {
    name: "Access Review",
    href: "/identity-access/access-review",
    icon: FiClipboard,
  },
  {
    name: "Delegations",
    href: "/identity-access/delegations",
    icon: FiUserCheck,
  },
  {
    name: "Trusted Devices",
    href: "/identity-access/trusted-devices",
    icon: FiSmartphone,
  },
];

// ─── FR SUB · Submission and clearance ────────────────────────────────────────

/**
 * Two sidebars, not one with hidden rows. A ministry submitter and a clearance
 * actor have almost no overlap, and FR-SUB-05 makes the boundary a security
 * requirement: a submitter must not be able to infer what another ministry has
 * in flight, and the surest way to hold that line is to keep the two audiences
 * on separate routes with separate navigation.
 */
export const papersNavigation: NavItem[] = [
  {
    section: "Papers",
    name: "My Submissions",
    href: "/submission-clearance/papers/my-submissions",
    icon: FiInbox,
  },
  {
    name: "New Submission",
    href: "/submission-clearance/papers/new-submission",
    icon: FiUploadCloud,
  },
  {
    name: "Awaiting My Response",
    href: "/submission-clearance/papers/awaiting-response",
    icon: FiCornerDownLeft,
  },
  {
    name: "Drafts",
    href: "/submission-clearance/papers/drafts",
    icon: FiEdit3,
  },
  {
    name: "Deadlines",
    href: "/submission-clearance/papers/deadlines",
    icon: FiClock,
  },
];

export const clearanceNavigation: NavItem[] = [
  {
    section: "Clearance",
    name: "Clearance Overview",
    href: "/submission-clearance/clearance/overview",
    icon: FiGrid,
  },
  {
    name: "My Queue",
    href: "/submission-clearance/clearance/my-queue",
    icon: FiCheckSquare,
  },
  {
    name: "All In Clearance",
    href: "/submission-clearance/clearance/all-in-clearance",
    icon: FiLayers,
  },
  {
    name: "Late Submissions",
    href: "/submission-clearance/clearance/late-submissions",
    icon: FiClock,
  },
  {
    name: "Escalations",
    href: "/submission-clearance/clearance/escalations",
    icon: FiAlertTriangle,
  },
  {
    name: "Exceptions",
    href: "/submission-clearance/clearance/exceptions",
    icon: FiFlag,
  },
  {
    name: "Quarantine",
    href: "/submission-clearance/clearance/quarantine",
    icon: FiShieldOff,
  },
  {
    name: "Delegations",
    href: "/submission-clearance/clearance/delegations",
    icon: FiUserCheck,
  },
  {
    section: "Configuration",
    name: "Clearance Paths",
    href: "/submission-clearance/clearance/clearance-paths",
    icon: FiGitBranch,
  },
  {
    name: "Paper Templates",
    href: "/submission-clearance/clearance/paper-templates",
    icon: FiFileText,
  },
];

// ─── FR PCK · Packs and Versions ──────────────────────────────────────────────

/**
 * The lifecycle is the navigation: assembly, readiness, freeze, release, and
 * everything that happens to a pack afterwards. The order is deliberate — a
 * pack only ever moves down this list.
 */
export const packsNavigation: NavItem[] = [
  {
    section: "Packs",
    name: "Pack Overview",
    href: "/packs-version/overview",
    icon: FiGrid,
  },
  {
    name: "In Assembly",
    href: "/packs-version/in-assembly",
    icon: FiPackage,
  },
  {
    name: "Readiness Checks",
    href: "/packs-version/readiness-checks",
    icon: FiCheckCircle,
  },
  {
    name: "Frozen",
    href: "/packs-version/frozen",
    icon: FiLock,
  },
  {
    name: "Released",
    href: "/packs-version/released",
    icon: FiSend,
  },
  {
    name: "Acknowledgements",
    href: "/packs-version/acknowledgements",
    icon: FiCheckSquare,
  },
  {
    name: "Versions",
    href: "/packs-version/versions",
    icon: FiCopy,
  },
  {
    name: "Supplementary Packs",
    href: "/packs-version/supplementary-packs",
    icon: FiPlusSquare,
  },
  {
    name: "Recalled",
    href: "/packs-version/recalled",
    icon: FiXOctagon,
  },
  {
    name: "Pre-staging",
    href: "/packs-version/pre-staging",
    icon: FiServer,
  },
];

// ─── FR DOC · Document Security ───────────────────────────────────────────────

/**
 * Ordered as the control reads: what a label is, what it permits, and then each
 * enforcement point in turn. The last two are Release 2 — they appear now so the
 * control is visible before it is switched on.
 */
export const documentSecurityNavigation: NavItem[] = [
  {
    section: "Document security",
    name: "Security Overview",
    href: "/document-security/overview",
    icon: FiGrid,
  },
  {
    name: "Classification Scheme",
    href: "/document-security/classification-scheme",
    icon: FiTag,
  },
  {
    name: "Handling Rules",
    href: "/document-security/handling-rules",
    icon: FiRules,
  },
  {
    name: "Reclassification",
    href: "/document-security/reclassification",
    icon: FiRefreshCw,
  },
  {
    name: "Watermarking",
    href: "/document-security/watermarking",
    icon: FiDroplet,
  },
  {
    name: "Access Expiry",
    href: "/document-security/access-expiry",
    icon: FiExpiry,
  },
  {
    name: "Revocations",
    href: "/document-security/revocations",
    icon: FiXOctagon,
  },
  {
    name: "Endpoint Controls",
    href: "/document-security/endpoint-controls",
    icon: FiHardDrive,
  },
  {
    name: "Offline Access",
    href: "/document-security/offline-access",
    icon: FiWifiOff,
  },
  {
    name: "Import and Export",
    href: "/document-security/import-export",
    icon: FiTransfer,
  },
  {
    name: "Encryption and Keys",
    href: "/document-security/encryption-keys",
    icon: FiCpu,
  },
];

// ─── FR REV · Reading Room ────────────────────────────────────────────────────

/**
 * One member's reading room. Everything here is scoped to the person signed in:
 * FR-REV-03 puts their notes beyond even an administrator's reach, so this app
 * has no register view and no "all readers" screen — there is nowhere in it to
 * look at somebody else's reading.
 *
 * The requirements list no overview screen; this one adds it, because the room
 * needs a place that says what is waiting before the reader opens anything.
 */
export const readingRoomNavigation: NavItem[] = [
  {
    section: "Reading room",
    name: "Overview",
    href: "/review-and-annotation/overview",
    icon: FiGrid,
  },
  {
    name: "To Read",
    href: "/review-and-annotation/to-read",
    icon: FiInbox,
  },
  {
    name: "Current Pack",
    href: "/review-and-annotation/current-pack",
    icon: FiBookOpen,
  },
  {
    name: "My Packs",
    href: "/review-and-annotation/my-packs",
    icon: FiFolder,
  },
  {
    name: "My Notes",
    href: "/review-and-annotation/my-notes",
    icon: FiBook,
  },
  {
    name: "My Comments",
    href: "/review-and-annotation/my-comments",
    icon: FiMessageSquare,
  },
  {
    name: "Flagged Items",
    href: "/review-and-annotation/flagged-items",
    icon: FiFlag,
  },
  {
    name: "Acknowledgements",
    href: "/review-and-annotation/acknowledgements",
    icon: FiCheckSquare,
  },
  {
    name: "Superseded",
    href: "/review-and-annotation/superseded",
    icon: FiArchive,
  },
];

// ─── FR PRS · Rooms and Devices ───────────────────────────────────────────────

/**
 * The administrative half of FR PRS: the rooms, the devices in them and the
 * policy they run under. Presenting itself — host control, the presenter view,
 * whiteboarding — happens in the room during a sitting; what lives here is the
 * configuration that governs it and the record of what each session did.
 *
 * Administrators only. Nothing on these screens shows Cabinet content.
 */
export const roomsNavigation: NavItem[] = [
  {
    section: "Rooms and devices",
    name: "Room Overview",
    href: "/room-presentation/overview",
    icon: FiGrid,
  },
  {
    name: "Rooms",
    href: "/room-presentation/rooms",
    icon: FiHome,
  },
  {
    name: "Asset Register",
    href: "/room-presentation/asset-register",
    icon: FiTablet,
  },
  {
    name: "Security Baseline",
    href: "/room-presentation/security-baseline",
    icon: FiBaseline,
  },
  {
    name: "Application Allowlist",
    href: "/room-presentation/application-allowlist",
    icon: FiApps,
  },
  {
    name: "Peripheral Policy",
    href: "/room-presentation/peripheral-policy",
    icon: FiActivity,
  },
  {
    name: "Camera and Microphone Policy",
    href: "/room-presentation/camera-microphone-policy",
    icon: FiCamera,
  },
  {
    name: "Session Records",
    href: "/room-presentation/session-records",
    icon: FiPlayCircle,
  },
  {
    name: "Endpoint Logs",
    href: "/room-presentation/endpoint-logs",
    icon: FiLogs,
  },
];

// ─── FR VID · Video Conferencing ──────────────────────────────────────────────

/**
 * Two rules run through every screen here. A link is never enough to join —
 * FR-VID-02 checks each join against a named, meeting-specific authorisation.
 * And being in a session grants no document permission at all: what a
 * participant can read is decided by their entitlements, nowhere else.
 */
export const videoNavigation: NavItem[] = [
  {
    section: "Video conferencing",
    name: "Video Overview",
    href: "/video-conferencing/overview",
    icon: FiGrid,
  },
  {
    name: "Sessions",
    href: "/video-conferencing/sessions",
    icon: FiVideo,
  },
  {
    name: "Session Records",
    href: "/video-conferencing/session-records",
    icon: FiLogs,
  },
  {
    name: "Join Authorisation",
    href: "/video-conferencing/join-authorisation",
    icon: FiUserPlus,
  },
  {
    name: "External Participants",
    href: "/video-conferencing/external-participants",
    icon: FiExternal,
  },
  {
    name: "Recording Policy",
    href: "/video-conferencing/recording-policy",
    icon: FiRecord,
  },
  {
    name: "Recordings",
    href: "/video-conferencing/recordings",
    icon: FiFilm,
  },
  {
    name: "Room Media",
    href: "/video-conferencing/room-media",
    icon: FiSpeaker,
  },
  {
    name: "Network and Quality",
    href: "/video-conferencing/network-quality",
    icon: FiWifi,
  },
  {
    name: "Breakout Rooms",
    href: "/video-conferencing/breakout-rooms",
    icon: FiColumns,
  },
];

// ─── Console · everything not yet split into its own app ──────────────────────

export const consoleNavigation: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: FiGrid },

  {
    section: "Cabinet business",
    name: "Meetings & agenda",
    href: "/meetings-agenda/overview",
    icon: FiCalendar,
  },
  { name: "Cabinet papers", href: "/dashboard/documents", icon: FiFileText },
  {
    name: "Decisions & actions",
    href: "/dashboard/decisions",
    icon: FiCheckSquare,
  },

  {
    section: "Sessions",
    name: "Video sessions",
    href: "/dashboard/video",
    icon: FiVideo,
  },

  {
    section: "Governance",
    name: "Audit log",
    href: "/dashboard/audit",
    icon: FiList,
  },
  { name: "Users & roles", href: "/dashboard/users", icon: FiUsers },
];

/**
 * Apps that own their sidebar. Add an entry as each functional area lands;
 * anything unmatched falls back to the console list.
 */
/**
 * FR-DEC has two audiences and they do not share a screen. The Secretariat owns
 * the decision record; a ministry owns the work that comes out of it. Putting
 * both on one list would put the correction and finalisation controls in front
 * of people who have no business with them, so the app carries two.
 */
export const decisionsNavigation: NavItem[] = [
  {
    section: "Decisions",
    name: "Decisions Overview",
    href: "/decisions-actions/decisions/overview",
    icon: FiGrid,
  },
  {
    name: "Record Decisions",
    href: "/decisions-actions/decisions/record",
    icon: FiEdit3,
  },
  {
    name: "Drafts and Review",
    href: "/decisions-actions/decisions/drafts",
    icon: FiClipboard,
  },
  {
    name: "Finalised Decisions",
    href: "/decisions-actions/decisions/finalised",
    icon: FiFinalised,
  },
  {
    name: "Corrections",
    href: "/decisions-actions/decisions/corrections",
    icon: FiCorrection,
  },
  {
    name: "Actions",
    href: "/decisions-actions/decisions/actions",
    icon: FiCheckSquare,
  },
  {
    name: "Escalations",
    href: "/decisions-actions/decisions/escalations",
    icon: FiEscalate,
  },
  {
    name: "Closure Verification",
    href: "/decisions-actions/decisions/closure-verification",
    icon: FiThumbsUp,
  },
  {
    name: "Minutes and Extracts",
    href: "/decisions-actions/decisions/minutes",
    icon: FiMinutes,
  },
  {
    name: "Decision Chains",
    href: "/decisions-actions/decisions/chains",
    icon: FiChain,
  },
];

export const actionsNavigation: NavItem[] = [
  {
    section: "Actions",
    name: "My Actions",
    href: "/decisions-actions/actions/my-actions",
    icon: FiMyActions,
  },
  {
    name: "Ministry Actions",
    href: "/decisions-actions/actions/ministry-actions",
    icon: FiBriefcase,
  },
  {
    name: "Due Soon",
    href: "/decisions-actions/actions/due-soon",
    icon: FiSunrise,
  },
  {
    name: "Overdue",
    href: "/decisions-actions/actions/overdue",
    icon: FiAlertTriangle,
  },
  {
    name: "Submitted for Closure",
    href: "/decisions-actions/actions/submitted",
    icon: FiSend,
  },
  {
    name: "Closed",
    href: "/decisions-actions/actions/closed",
    icon: FiClosed,
  },
];

/**
 * FR-SCH. The archive is a destination rather than a search box bolted to every
 * screen: Search is the general question, and the three record types are the
 * ways people actually arrive at it.
 */
export const archiveNavigation: NavItem[] = [
  {
    section: "Archive",
    name: "Archive Overview",
    href: "/search-retrieval/overview",
    icon: FiGrid,
  },
  {
    name: "Search",
    href: "/search-retrieval/search",
    icon: FiSearch,
  },
  {
    name: "Papers",
    href: "/search-retrieval/papers",
    icon: FiArchivePapers,
  },
  {
    name: "Decisions",
    href: "/search-retrieval/decisions",
    icon: FiArchiveDecisions,
  },
  {
    name: "Actions",
    href: "/search-retrieval/actions",
    icon: FiArchiveActions,
  },
  {
    name: "Saved Searches",
    href: "/search-retrieval/saved-searches",
    icon: FiSaved,
  },
];

/**
 * FR-NOT. The proposal's sidebar is Secretariat and admin only, and that is the
 * first section here. The second exists because two requirements are not
 * administrative: FR-NOT-09 gives every user an in-platform centre and
 * FR-NOT-08 gives them their own preferences, and neither belongs on a screen
 * that also configures escalation points.
 */
export const notificationsNavigation: NavItem[] = [
  {
    section: "Notifications",
    name: "Notification Overview",
    href: "/notifications/overview",
    icon: FiGrid,
  },
  {
    name: "Delivery Log",
    href: "/notifications/delivery-log",
    icon: FiDeliveryLog,
  },
  {
    name: "Failed Deliveries",
    href: "/notifications/failed-deliveries",
    icon: FiAlertOctagon,
  },
  {
    name: "Templates",
    href: "/notifications/templates",
    icon: FiMail,
  },
  {
    name: "Triggers and Rules",
    href: "/notifications/triggers",
    icon: FiZap,
  },
  {
    name: "Escalation Points",
    href: "/notifications/escalation-points",
    icon: FiTrendingUp,
  },
  {
    section: "Mine",
    name: "Notification Centre",
    href: "/notifications/centre",
    icon: FiBell,
  },
  {
    name: "Preferences",
    href: "/notifications/preferences",
    icon: FiPrefs,
  },
];

/** FR-AUD. Oversight reads; it does not write. Nothing on this list leads to a
 *  screen that can change a Cabinet record or an audit event. */
export const oversightNavigation: NavItem[] = [
  {
    section: "Audit and oversight",
    name: "Audit Overview",
    href: "/audit-oversight/overview",
    icon: FiGrid,
  },
  {
    name: "Event Log",
    href: "/audit-oversight/event-log",
    icon: FiList,
  },
  {
    name: "Document History",
    href: "/audit-oversight/document-history",
    icon: FiDocHistory,
  },
  {
    name: "User Activity",
    href: "/audit-oversight/user-activity",
    icon: FiUserActivity,
  },
  {
    name: "Access Review",
    href: "/audit-oversight/access-review",
    icon: FiAccessReview,
  },
  {
    name: "Reports",
    href: "/audit-oversight/reports",
    icon: FiBarChart2,
  },
  {
    name: "Alerts",
    href: "/audit-oversight/alerts",
    icon: FiAnomalies,
  },
  {
    name: "Integrity Verification",
    href: "/audit-oversight/integrity",
    icon: FiIntegrity,
  },
  {
    name: "Export",
    href: "/audit-oversight/export",
    icon: FiDownload,
  },
  {
    name: "Retention",
    href: "/audit-oversight/retention",
    icon: FiRetention,
  },
];

/** FR-ADM. Platform configuration. Who may *use* the platform is configured in
 *  Identity and Access — this list configures what the roles there mean. */
export const administrationNavigation: NavItem[] = [
  {
    section: "Administration",
    name: "Admin Overview",
    href: "/administration/overview",
    icon: FiGrid,
  },
  {
    name: "Configuration",
    href: "/administration/configuration",
    icon: FiConfig,
  },
  {
    name: "Change Approvals",
    href: "/administration/change-approvals",
    icon: FiApprovals,
  },
  {
    name: "Change History",
    href: "/administration/change-history",
    icon: FiHistory,
  },
  {
    name: "Platform Health",
    href: "/administration/platform-health",
    icon: FiHealth,
  },
  {
    name: "Maintenance Windows",
    href: "/administration/maintenance",
    icon: FiTool,
  },
  {
    name: "Devices",
    href: "/administration/devices",
    icon: FiDevices,
  },
  {
    name: "Environments",
    href: "/administration/environments",
    icon: FiEnvironments,
  },
  {
    name: "Bulk Onboarding",
    href: "/administration/bulk-onboarding",
    icon: FiOnboarding,
  },
  {
    name: "Admin Sessions",
    href: "/administration/admin-sessions",
    icon: FiSessions,
  },
];

/**
 * FR-DAT has two audiences. Records governance is the Secretariat's work — what
 * is kept, for how long, and who may destroy it. Continuity is the
 * administrator's — backups, replication and getting the platform back. The
 * proposal separates them, and so does this.
 */
export const governanceNavigation: NavItem[] = [
  {
    section: "Data governance",
    name: "Governance Overview",
    href: "/data-continuity/governance/overview",
    icon: FiGrid,
  },
  {
    name: "Retention Classes",
    href: "/data-continuity/governance/retention-classes",
    icon: FiClasses,
  },
  {
    name: "Records Under Retention",
    href: "/data-continuity/governance/records",
    icon: FiRecords,
  },
  {
    name: "Legal Holds",
    href: "/data-continuity/governance/legal-holds",
    icon: FiHolds,
  },
  {
    name: "Archival Transfer",
    href: "/data-continuity/governance/archival-transfer",
    icon: FiTransferOut,
  },
  {
    name: "Deletion Approvals",
    href: "/data-continuity/governance/deletion-approvals",
    icon: FiTrash2,
  },
  {
    name: "Personal Information",
    href: "/data-continuity/governance/personal-information",
    icon: FiPersonal,
  },
];

export const continuityNavigation: NavItem[] = [
  {
    section: "Continuity",
    name: "Backups",
    href: "/data-continuity/continuity/backups",
    icon: FiBackups,
  },
  {
    name: "Restore Tests",
    href: "/data-continuity/continuity/restore-tests",
    icon: FiRestore,
  },
  {
    name: "Replication",
    href: "/data-continuity/continuity/replication",
    icon: FiReplication,
  },
  {
    name: "Disaster Recovery",
    href: "/data-continuity/continuity/disaster-recovery",
    icon: FiLifeBuoy,
  },
  {
    name: "Failover Tests",
    href: "/data-continuity/continuity/failover-tests",
    icon: FiZapOff,
  },
  {
    name: "Key Custodianship",
    href: "/data-continuity/continuity/key-custodianship",
    icon: FiCustody,
  },
  {
    name: "Data Residency",
    href: "/data-continuity/continuity/data-residency",
    icon: FiResidency,
  },
];

export const APP_SIDEBARS: AppNavigation[] = [
  {
    app: "Meetings and Agenda",
    match: ["/meetings-agenda", "/dashboard/meetings-agenda"],
    items: meetingsNavigation,
  },
  {
    app: "Identity and Access",
    match: ["/identity-access"],
    items: identityNavigation,
  },
  {
    app: "Submission and Clearance — papers",
    match: ["/submission-clearance/papers"],
    items: papersNavigation,
  },
  {
    app: "Submission and Clearance — clearance",
    match: ["/submission-clearance/clearance"],
    items: clearanceNavigation,
  },
  {
    app: "Packs and Versions",
    match: ["/packs-version"],
    items: packsNavigation,
  },
  {
    app: "Document Security",
    match: ["/document-security"],
    items: documentSecurityNavigation,
  },
  {
    app: "Review and Annotation",
    match: ["/review-and-annotation"],
    items: readingRoomNavigation,
  },
  {
    app: "Room Presentation",
    match: ["/room-presentation"],
    items: roomsNavigation,
  },
  {
    app: "Video Conferencing",
    match: ["/video-conferencing"],
    items: videoNavigation,
  },
  {
    app: "Decisions and Actions — Secretariat",
    match: ["/decisions-actions/decisions"],
    items: decisionsNavigation,
  },
  {
    app: "Decisions and Actions — ministries",
    match: ["/decisions-actions/actions"],
    items: actionsNavigation,
  },
  {
    app: "Search and Retrieval",
    match: ["/search-retrieval"],
    items: archiveNavigation,
  },
  {
    app: "Notifications",
    match: ["/notifications"],
    items: notificationsNavigation,
  },
  {
    app: "Audit and Oversight",
    match: ["/audit-oversight"],
    items: oversightNavigation,
  },
  {
    app: "Administration",
    match: ["/administration"],
    items: administrationNavigation,
  },
  {
    app: "Data and Continuity — governance",
    match: ["/data-continuity/governance"],
    items: governanceNavigation,
  },
  {
    app: "Data and Continuity — continuity",
    match: ["/data-continuity/continuity"],
    items: continuityNavigation,
  },
];

/** The sidebar belonging to the app that owns `pathname`. */
export function navigationFor(pathname: string): NavItem[] {
  const app = APP_SIDEBARS.find((entry) =>
    entry.match.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ),
  );
  return app?.items ?? consoleNavigation;
}

/** Sits in the card above the profile, below the main list. */
export const settingsNavigation: NavSubItem[] = [
  { name: "All apps", href: "/welcome", icon: FiGrid },
];
