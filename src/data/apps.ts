import {
  FiUsers,
  FiCalendar,
  FiUploadCloud,
  FiLayers,
  FiShield,
  FiEdit3,
  FiMonitor,
  FiVideo,
  FiCheckSquare,
  FiSearch,
  FiBell,
  FiList,
  FiSettings,
  FiDatabase,
} from "react-icons/fi";
import type { IconType } from "react-icons";

export interface CabinetApp {
  /** Functional requirement reference, e.g. "FR IAM". */
  code: string;
  /** Short name shown on the tile. */
  label: string;
  /** The full functional area this tile covers. */
  title: string;
  icon: IconType;
  /** Where the tile opens. Undefined means the module is not built yet. */
  href?: string;
}

/**
 * The e-Cabinet functional catalogue, in FR order. Tiles without an `href`
 * render as unavailable rather than linking to a route that does not exist —
 * give them one as each module lands.
 */
export const CABINET_APPS: CabinetApp[] = [
  {
    code: "FR IAM",
    label: "Identity and Access",
    title: "Identity, access and role management",
    icon: FiUsers,
    href: "/identity-access/overview",
  },
  {
    code: "FR MTG",
    label: "Meetings and Agenda",
    title: "Meeting creation and agenda management",
    icon: FiCalendar,
    href: "/meetings-agenda/overview",
  },
  {
    code: "FR SUB",
    label: "Submission and Clearance",
    title: "Submission and clearance workflow",
    icon: FiUploadCloud,
    // The tile lands on the app's own entry, which sends the viewer to the
    // papers or the clearance side according to their role.
    href: "/submission-clearance",
  },
  {
    code: "FR PCK",
    label: "Packs and Versions",
    title: "Pack assembly, freeze, release and version control",
    icon: FiLayers,
    href: "/packs-version/overview",
  },
  {
    code: "FR DOC",
    label: "Document Security",
    title: "Classification, security and handling controls",
    icon: FiShield,
    href: "/document-security/overview",
  },
  {
    code: "FR REV",
    label: "Review and Annotation",
    title: "Review, annotation and acknowledgement",
    icon: FiEdit3,
    href: "/review-and-annotation/overview",
  },
  {
    code: "FR PRS",
    label: "Room Presentation",
    title: "Meeting presentation and IMAGO room collaboration",
    icon: FiMonitor,
    href: "/room-presentation/overview",
  },
  {
    code: "FR VID",
    label: "Video Conferencing",
    title: "Secure video conferencing",
    icon: FiVideo,
    href: "/video-conferencing/overview",
  },
  {
    code: "FR DEC",
    label: "Decisions and Actions",
    title: "Decision capture and action tracking",
    icon: FiCheckSquare,
    href: "/decisions-actions",
  },
  {
    code: "FR SCH",
    label: "Search and Retrieval",
    title: "Search and retrieval",
    icon: FiSearch,
    href: "/search-retrieval/overview",
  },
  {
    code: "FR NOT",
    label: "Notifications",
    title: "Notification, reminder and escalation",
    icon: FiBell,
    href: "/notifications/overview",
  },
  {
    code: "FR AUD",
    label: "Audit and Oversight",
    title: "Audit, reporting and oversight",
    icon: FiList,
    href: "/audit-oversight/overview",
  },
  {
    code: "FR ADM",
    label: "Administration",
    title: "Administration and configuration",
    icon: FiSettings,
    href: "/administration/overview",
  },
  {
    code: "FR DAT",
    label: "Data and Continuity",
    title: "Data governance, retention, archival and continuity",
    icon: FiDatabase,
    href: "/data-continuity",
  },
];
