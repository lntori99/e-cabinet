/**
 * Jitsi Meet configuration for FR-VID.
 *
 * A placeholder while the real service is stood up. Two things about it are
 * temporary and both matter:
 *
 *   1. The domain defaults to the public `meet.jit.si`. FR-VID-01 and FR-DAT-06
 *      require conferencing to run on Malawi-controlled infrastructure, and the
 *      public server is neither Malawian nor Government-controlled. Nothing
 *      real may be discussed on it. `JITSI_IS_PLACEHOLDER` is true whenever the
 *      domain has not been overridden, and the console says so on screen rather
 *      than leaving somebody to find out.
 *
 *   2. There is no JWT. On a self-hosted deployment the room is entered with a
 *      token minted per participant, which is what makes FR-VID-02 ("a link is
 *      not a key") true. Without one, anybody who knows the room name can join,
 *      so the name is derived rather than readable — see `roomNameFor`.
 *
 * Point `NEXT_PUBLIC_JITSI_DOMAIN` at the Lilongwe deployment and add token
 * minting, and both notes stop applying.
 */
import type { VideoSession } from "@/models/response/base-response";

/** The public demo server. Replaced by the self-hosted domain. */
const PUBLIC_DEMO_DOMAIN = "meet.jit.si";

export const JITSI_DOMAIN =
  process.env.NEXT_PUBLIC_JITSI_DOMAIN?.trim() || PUBLIC_DEMO_DOMAIN;

/** True while conferencing is still pointed at somebody else's server. */
export const JITSI_IS_PLACEHOLDER = JITSI_DOMAIN === PUBLIC_DEMO_DOMAIN;

/**
 * Salts the room name so it is not guessable from the session reference alone.
 * On the public server a guessable name is an open door; a deployment sets its
 * own value and rooms from one environment cannot collide with another's.
 */
const ROOM_SALT = process.env.NEXT_PUBLIC_JITSI_ROOM_SALT?.trim() || "ecab-mw-dev";

/**
 * A room name both ends can derive without being told it, and nobody can guess
 * from the session ID. Deterministic on purpose — the host and the participants
 * compute the same name from the same session.
 *
 * This is obfuscation, not authentication. It is what stands in for a token
 * until tokens exist, and it is not a substitute for one.
 */
export function roomNameFor(session: Pick<VideoSession, "id" | "meetingId">): string {
  const seed = `${ROOM_SALT}:${session.meetingId}:${session.id}`;

  // FNV-1a, 32-bit. Not a security hash — it only has to spread the input.
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return `ecab-${session.id.toLowerCase().replace(/[^a-z0-9]/g, "")}-${hash.toString(36)}`;
}

/**
 * Overrides for the Jitsi config. Each line is one of the FR-VID rules, so the
 * requirement and the setting sit next to each other and a change to either is
 * visible against the other.
 */
export function configFor(session: VideoSession) {
  return {
    // FR-VID-06 — nobody enters unadmitted. The prejoin screen is the door and
    // the lobby is the host's decision.
    prejoinPageEnabled: true,
    enableLobbyChat: false,

    // FR-VID-11 — recording is off unless the approved path has been followed.
    // The switch is the session's, not the participant's.
    fileRecordingsEnabled: session.recordingEnabled,
    liveStreamingEnabled: false,
    localRecording: { enabled: false, disallowRemoteVideoRecording: true },

    // FR-VID-13 — no participant may take a recording away.
    fileRecordingsServiceEnabled: false,
    dropbox: { appKey: null },

    // Nothing about a Cabinet sitting is sent to a third party for any reason.
    disableThirdPartyRequests: true,
    analytics: { disabled: true, rtcstatsEnabled: false },

    // A Cabinet sitting is not a place to be invited into from outside.
    disableInviteFunctions: true,
    doNotStoreRoom: true,

    // The platform decides what a participant is called. FR-VID-16 keeps one
    // attendance list, and it cannot be one list if people rename themselves.
    readOnlyName: true,

    // Keep the toolbar to what the requirements actually describe.
    toolbarButtons: [
      "microphone",
      "camera",
      "desktop",
      "tileview",
      "participants-pane",
      "raisehand",
      "settings",
      "hangup",
    ],
  };
}

export const INTERFACE_CONFIG = {
  SHOW_JITSI_WATERMARK: false,
  SHOW_WATERMARK_FOR_GUESTS: false,
  SHOW_BRAND_WATERMARK: false,
  SHOW_POWERED_BY: false,
  DEFAULT_BACKGROUND: "#062317",
  DISABLE_VIDEO_BACKGROUND: false,
  MOBILE_APP_PROMO: false,
  HIDE_DEEP_LINKING_LOGO: true,
  DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
} as const;
