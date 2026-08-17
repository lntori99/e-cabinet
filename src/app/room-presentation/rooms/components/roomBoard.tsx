"use client";

import {
  FiCamera,
  FiCast,
  FiMic,
  FiMonitor,
  FiTv,
  FiUsers,
  FiVideo,
} from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  selectAssets,
  selectAvPolicies,
  selectLiveSessions,
  selectPeripheralPolicies,
  selectRooms,
} from "@/core/slices/rooms-slice";
import type { AssetKind } from "@/models/response/base-response";
import { ASSET_TONE, policyTone } from "../../components/roomStatus";

const KIND_ICON: Record<AssetKind, typeof FiMonitor> = {
  "OPS PC": FiMonitor,
  Screen: FiTv,
  Camera: FiCamera,
  Microphone: FiMic,
  Stand: FiUsers,
  Accessory: FiUsers,
};

export default function RoomBoard() {
  const rooms = useAppSelector(selectRooms);
  const assets = useAppSelector(selectAssets);
  const peripheral = useAppSelector(selectPeripheralPolicies);
  const av = useAppSelector(selectAvPolicies);
  const live = useAppSelector(selectLiveSessions);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {rooms.map((room) => {
        const roomAssets = assets.filter((a) => a.roomId === room.id);
        const peripherals = peripheral.find((p) => p.roomId === room.id);
        const avPolicy = av.find((p) => p.roomId === room.id);
        const session = live.find((s) => s.roomId === room.id);

        return (
          <article
            key={room.id}
            className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {room.id} · {room.kind}
                </p>
                <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                  {room.name}
                </h2>
                <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                  {room.location} · seats {room.seats}
                </p>
              </div>
              {session ? (
                <StatusBadge tone="green">Presenting</StatusBadge>
              ) : (
                <StatusBadge tone="neutral">Idle</StatusBadge>
              )}
            </header>

            <div className="space-y-5 px-5 py-4">
              <div className="space-y-0.5">
                <DetailRow
                  label="When nothing is presenting"
                  value={room.idleDisplay}
                />
                <DetailRow
                  label="Wireless casting"
                  value={
                    <StatusBadge tone={policyTone(room.wirelessCasting)}>
                      {room.wirelessCasting}
                    </StatusBadge>
                  }
                />
                <DetailRow
                  label="Recording"
                  value={
                    <StatusBadge tone={policyTone(room.recording)}>
                      {room.recording}
                    </StatusBadge>
                  }
                />
                <DetailRow label="Whiteboarding" value={room.whiteboarding} />
                <DetailRow
                  label="Guest traffic"
                  value={room.guestTrafficIsolated ? "Isolated from Cabinet data" : "Not isolated"}
                />
              </div>

              {session && (
                <p
                  className="flex items-start gap-2 rounded-lg border p-3 text-sm"
                  style={{ borderColor: "var(--viz-good)" }}
                >
                  <FiVideo
                    size={15}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--viz-good)" }}
                    aria-hidden="true"
                  />
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {session.meetingTitle} — hosted by {session.host} since{" "}
                    {stamp(session.startedAt)}. Presentation is under the host&apos;s
                    control; the room follows.
                  </span>
                </p>
              )}

              <div>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                  Attached devices
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {roomAssets.map((asset) => {
                    const Icon = KIND_ICON[asset.kind];
                    return (
                      <li
                        key={asset.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-sm"
                      >
                        <span className="inline-flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                          <Icon size={13} className="text-neutral-400" aria-hidden="true" />
                          {asset.label}
                          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                            {asset.assetTag}
                          </span>
                        </span>
                        <StatusBadge tone={ASSET_TONE[asset.status]}>
                          {asset.status}
                        </StatusBadge>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {peripherals && avPolicy && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                      Peripherals
                    </h3>
                    <ul className="mt-2 space-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                      <li className="inline-flex items-center gap-1.5">
                        <FiCast size={11} className="text-neutral-400" aria-hidden="true" />
                        USB {peripherals.usbMassStorage.toLowerCase()}
                      </li>
                      <li>Wi-Fi — {peripherals.wifi.toLowerCase()}</li>
                      <li>Bluetooth — {peripherals.bluetooth.toLowerCase()}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                      Camera and microphone
                    </h3>
                    <ul className="mt-2 space-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                      <li>{avPolicy.whoMayStart}</li>
                      <li>Microphones default {avPolicy.microphoneDefault.toLowerCase()}</li>
                      <li>Cameras shut down {avPolicy.cameraShutdown.toLowerCase()}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
