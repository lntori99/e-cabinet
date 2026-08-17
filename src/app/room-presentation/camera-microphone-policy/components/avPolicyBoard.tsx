"use client";

import { FiCamera, FiEyeOff, FiMic, FiMicOff, FiPower, FiVideo } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectAssets, selectAvPolicies, selectRooms } from "@/core/slices/rooms-slice";
import { policyTone } from "../../components/roomStatus";

export default function AvPolicyBoard() {
  const policies = useAppSelector(selectAvPolicies);
  const rooms = useAppSelector(selectRooms);
  const assets = useAppSelector(selectAssets);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-3">
        {policies.map((policy) => {
          const room = rooms.find((r) => r.id === policy.roomId);
          const devices = assets.filter(
            (a) =>
              a.roomId === policy.roomId &&
              (a.kind === "Camera" || a.kind === "Microphone"),
          );

          return (
            <article
              key={policy.roomId}
              className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {policy.roomId}
                  </p>
                  <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                    {room?.name ?? policy.roomId}
                  </h2>
                </div>
                <StatusBadge tone={policyTone(policy.recording)}>
                  {policy.recording === "Blocked" ? "No recording" : "Recording permitted"}
                </StatusBadge>
              </header>

              <div className="space-y-4 px-5 py-4">
                <div className="space-y-0.5">
                  <DetailRow
                    label="Who may start a session"
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        <FiVideo size={12} className="text-neutral-400" aria-hidden="true" />
                        {policy.whoMayStart}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Microphones default to"
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        {policy.microphoneDefault === "Muted" ? (
                          <FiMicOff size={12} className="text-neutral-400" aria-hidden="true" />
                        ) : (
                          <FiMic size={12} className="text-neutral-400" aria-hidden="true" />
                        )}
                        {policy.microphoneDefault}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Cameras shut down"
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        <FiPower size={12} className="text-neutral-400" aria-hidden="true" />
                        {policy.cameraShutdown}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Privacy shutter"
                    value={
                      policy.privacyShutter
                        ? "Fitted — closes when the session ends"
                        : "Not fitted"
                    }
                  />
                </div>

                {policy.recordingApproval && (
                  <p className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                    Recording requires: {policy.recordingApproval}
                  </p>
                )}

                {policy.recording === "Blocked" && (
                  <p
                    className="flex items-start gap-2 text-xs"
                    style={{ color: "var(--viz-good)" }}
                  >
                    <FiEyeOff size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span className="text-neutral-600 dark:text-neutral-300">
                      Recording is refused in this room at the platform, not left to
                      the host to remember. The handling rules would block it for
                      TOP SECRET material in any case.
                    </span>
                  </p>
                )}

                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                    Devices under this policy
                  </h3>
                  <ul className="mt-2 space-y-1.5">
                    {devices.map((device) => (
                      <li
                        key={device.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-sm"
                      >
                        <span className="inline-flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                          {device.kind === "Camera" ? (
                            <FiCamera size={13} className="text-neutral-400" aria-hidden="true" />
                          ) : (
                            <FiMic size={13} className="text-neutral-400" aria-hidden="true" />
                          )}
                          {device.label}
                        </span>
                        <StatusBadge tone={device.status === "Online" ? "green" : "red"}>
                          {device.status}
                        </StatusBadge>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Shutdown behaviour is part of the policy rather than an operational habit:
        a camera left live after a sitting is a camera in a Cabinet Room with
        nobody watching it.
      </p>
    </div>
  );
}
