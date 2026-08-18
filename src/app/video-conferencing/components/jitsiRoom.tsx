"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  FiAlertTriangle,
  FiLogIn,
  FiMonitor,
  FiVideo,
  FiVideoOff,
  FiX,
} from "react-icons/fi";
import { StatusBadge } from "@/common/ui";
import { OPERATOR } from "@/core/app-constants";
import {
  INTERFACE_CONFIG,
  JITSI_DOMAIN,
  JITSI_IS_PLACEHOLDER,
  configFor,
  roomNameFor,
} from "@/data/jitsi";
import type { VideoSession } from "@/models/response/base-response";

/**
 * Client-only. The SDK numbers its container from a module-level counter, so a
 * server pass and a client pass produce different DOM ids and React reports a
 * hydration mismatch. Loading it with `ssr: false` means there is no server
 * pass to disagree with, whatever a caller does with this component.
 */
const JitsiMeeting = dynamic(
  () => import("@jitsi/react-sdk").then((mod) => mod.JitsiMeeting),
  { ssr: false, loading: () => <RoomSpinner /> },
);

/**
 * The room itself, for a session that is running.
 *
 * The iframe is mounted only after somebody asks for it. That is not a
 * performance decision: until the domain is the Lilongwe one, mounting it makes
 * a request to a server outside Government control, and that should happen
 * because an officer chose it rather than because a page rendered.
 */
export default function JitsiRoom({ session }: { session: VideoSession }) {
  const [joined, setJoined] = useState(false);
  const [closed, setClosed] = useState(false);

  const live = session.state === "In progress" || session.state === "Waiting room open";
  const room = roomNameFor(session);

  if (!live) {
    return (
      <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <p className="inline-flex items-start gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <FiVideoOff size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {session.state === "Scheduled"
            ? "The room opens when the host starts the session."
            : `This session has ${session.state.toLowerCase()}. The room is closed.`}
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800">
      {JITSI_IS_PLACEHOLDER && (
        <p
          className="flex items-start gap-2 border-b px-5 py-3 text-sm"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <FiAlertTriangle
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-critical)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              Placeholder service — nothing real may be said on this call.
            </span>{" "}
            Conferencing is pointed at the public <code>{JITSI_DOMAIN}</code>{" "}
            server, which is neither Malawian nor Government-controlled, and there
            is no token on the join. FR-VID-01 and FR-DAT-06 are not met until
            this is the Lilongwe deployment.
          </span>
        </p>
      )}

      {!joined ? (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
              <FiVideo size={15} className="text-neutral-400" aria-hidden="true" />
              {closed ? "You have left the room" : "The room is open"}
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {session.roomId} · joining as {OPERATOR.name} ({OPERATOR.shortRole})
              {session.recordingEnabled
                ? " · recording is on and every participant is told"
                : " · not recording"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setClosed(false);
              setJoined(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-state-800"
          >
            <FiLogIn size={15} aria-hidden="true" />
            {closed ? "Rejoin the room" : "Join the room"}
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <p className="inline-flex items-center gap-2 text-sm">
              <FiMonitor size={15} className="text-neutral-400" aria-hidden="true" />
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {session.meetingTitle}
              </span>
              <StatusBadge tone={session.recordingEnabled ? "red" : "neutral"}>
                {session.recordingEnabled ? "Recording" : "Not recording"}
              </StatusBadge>
            </p>
            <button
              type="button"
              onClick={() => setJoined(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-seal-500 hover:text-seal-500 dark:border-neutral-700 dark:text-neutral-300"
            >
              <FiX size={14} aria-hidden="true" />
              Close the room
            </button>
          </div>

          <div className="h-[32rem] w-full overflow-hidden bg-state-950">
            <JitsiMeeting
              domain={JITSI_DOMAIN}
              roomName={room}
              configOverwrite={configFor(session)}
              interfaceConfigOverwrite={INTERFACE_CONFIG}
              userInfo={{
                displayName: `${OPERATOR.name} (${OPERATOR.shortRole})`,
                email: OPERATOR.email,
              }}
              onReadyToClose={() => {
                setJoined(false);
                setClosed(true);
              }}
              getIFrameRef={(node) => {
                node.style.height = "100%";
                node.style.width = "100%";
              }}
              spinner={RoomSpinner}
            />
          </div>
        </>
      )}
    </div>
  );
}

/** Shown while the external iframe loads, so the panel is never blank. */
function RoomSpinner() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-state-950">
      <p className="inline-flex items-center gap-2 text-sm text-state-200">
        <FiVideo size={15} aria-hidden="true" />
        Connecting to the room…
      </p>
    </div>
  );
}
