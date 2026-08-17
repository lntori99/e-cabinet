"use client";

import { FiCamera, FiCpu, FiMic, FiMove, FiSpeaker } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectAssets, selectRooms } from "@/core/slices/rooms-slice";
import { seedRoomMedia } from "@/data/video";

export default function RoomMediaBoard() {
  const rooms = useAppSelector(selectRooms);
  const assets = useAppSelector(selectAssets);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-3">
        {seedRoomMedia.map((media) => {
          const room = rooms.find((r) => r.id === media.roomId);
          const devices = assets.filter(
            (a) =>
              a.roomId === media.roomId &&
              (a.kind === "Camera" || a.kind === "Microphone"),
          );
          const offline = devices.filter((d) => d.status !== "Online");

          return (
            <article
              key={media.roomId}
              className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {media.roomId}
                  </p>
                  <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                    {room?.name ?? media.roomId}
                  </h2>
                </div>
                <StatusBadge tone={offline.length === 0 ? "green" : "red"}>
                  {offline.length === 0 ? "Chain healthy" : `${offline.length} offline`}
                </StatusBadge>
              </header>

              <div className="space-y-4 px-5 py-4">
                <div className="space-y-0.5">
                  <DetailRow
                    label="Camera"
                    value={
                      <span className="inline-flex items-start gap-1.5">
                        <FiCamera size={12} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
                        {media.camera}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Microphones"
                    value={
                      <span className="inline-flex items-start gap-1.5">
                        <FiMic size={12} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
                        {media.microphones}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Processing"
                    value={
                      <span className="inline-flex items-start gap-1.5">
                        <FiCpu size={12} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
                        {media.dsp}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Speakers"
                    value={
                      <span className="inline-flex items-start gap-1.5">
                        <FiSpeaker size={12} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
                        {media.speakers}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Echo cancellation"
                    value={media.echoCancellation ? "On" : "Off"}
                  />
                  <DetailRow label="Last calibrated" value={media.lastCalibrated} />
                </div>

                {media.ptz && (
                  <div>
                    <h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                      <FiMove size={12} aria-hidden="true" />
                      Camera presets
                    </h3>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {media.presets.map((preset) => (
                        <li
                          key={preset}
                          className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {preset}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                    Devices
                  </h3>
                  <ul className="mt-2 space-y-1.5">
                    {devices.map((device) => (
                      <li
                        key={device.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-sm"
                      >
                        <span className="text-neutral-700 dark:text-neutral-300">
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
        The camera and microphone devices listed here are the same assets the room
        administration console holds — one register, read from two places, so a
        camera that goes offline is offline everywhere.
      </p>
    </div>
  );
}
