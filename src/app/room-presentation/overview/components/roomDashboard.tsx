"use client";

import Link from "next/link";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiMonitor,
  FiPlayCircle,
} from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { Kpi, StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  baselineFailures,
  selectAssets,
  selectBaselineCompliance,
  selectFailedClearDowns,
  selectLiveSessions,
  selectOutOfPolicy,
  selectRooms,
  selectUnacknowledgedEvents,
} from "@/core/slices/rooms-slice";
import { acknowledgeEvent } from "@/core/thunks-rooms";
import { seedEndpointDays } from "@/data/rooms";
import { ASSET_TONE, EVENT_COLOR, EVENT_TONE } from "../../components/roomStatus";
import BaselineChart from "./baselineChart";
import EndpointActivityChart from "./endpointActivityChart";

export default function RoomDashboard({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const rooms = useAppSelector(selectRooms);
  const assets = useAppSelector(selectAssets);
  const compliance = useAppSelector(selectBaselineCompliance);
  const outOfPolicy = useAppSelector(selectOutOfPolicy);
  const live = useAppSelector(selectLiveSessions);
  const failedClearDowns = useAppSelector(selectFailedClearDowns);
  const unacknowledged = useAppSelector(selectUnacknowledgedEvents);

  const online = assets.filter((a) => a.status === "Online").length;
  const offline = assets.filter((a) => a.status !== "Online");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Endpoints online"
          value={`${online}/${assets.length}`}
          hint={
            offline.length === 0
              ? `Across ${rooms.length} rooms`
              : `${offline.length} offline or in maintenance`
          }
          tone={offline.length === 0 ? "green" : "amber"}
        />
        <Kpi
          label="Sessions in progress"
          value={live.length}
          hint={
            live.length === 0
              ? "No room is presenting"
              : live.map((s) => s.meetingTitle).join(", ")
          }
        />
        <Kpi
          label="Devices out of policy"
          value={outOfPolicy.length}
          hint="Failing at least one baseline control"
          tone={outOfPolicy.length === 0 ? "green" : "red"}
        />
        <Kpi
          label="Unacknowledged errors"
          value={unacknowledged.length}
          hint={
            failedClearDowns.length > 0
              ? `${failedClearDowns.length} clear-down failure on the record`
              : "Every clear-down has passed"
          }
          tone={unacknowledged.length === 0 ? "green" : "amber"}
        />
      </div>

      {unacknowledged.length > 0 && (
        <section
          className="rounded-lg border bg-white dark:bg-neutral-900"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <h2
              className="flex items-center gap-2 font-bold"
              style={{ color: "var(--viz-critical)" }}
            >
              <FiAlertTriangle size={16} aria-hidden="true" />
              Waiting on an administrator
            </h2>
            <Link
              href="/room-presentation/endpoint-logs"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Endpoint logs →
            </Link>
          </header>

          <ul className="divide-y divide-neutral-100 px-5 dark:divide-neutral-800">
            {unacknowledged.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-start justify-between gap-3 py-3"
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <FiAlertTriangle
                      size={13}
                      style={{ color: EVENT_COLOR[event.severity] }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {event.kind}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {event.assetId} · {stamp(event.at)}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-neutral-600 dark:text-neutral-300">
                    {event.detail}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => dispatch(acknowledgeEvent(event))}
                  className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Acknowledge
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <BaselineChart rows={compliance} />
        <EndpointActivityChart days={seedEndpointDays} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">Devices out of policy</h2>
            <Link
              href="/room-presentation/security-baseline"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Security baseline →
            </Link>
          </div>

          {outOfPolicy.length === 0 ? (
            <p className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              <FiCheckCircle
                size={15}
                style={{ color: "var(--viz-good)" }}
                aria-hidden="true"
              />
              Every managed endpoint meets the baseline.
            </p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Device</Th>
                  <Th>Failing</Th>
                  <Th>Last checked</Th>
                </tr>
              </thead>
              <tbody>
                {outOfPolicy.map((baseline) => {
                  const asset = assets.find((a) => a.id === baseline.assetId);
                  const room = rooms.find((r) => r.id === asset?.roomId);
                  return (
                    <tr key={baseline.assetId}>
                      <Td>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {asset?.label ?? baseline.assetId}
                        </span>
                        <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                          {asset?.assetTag} · {room?.name}
                        </span>
                      </Td>
                      <Td>
                        <span style={{ color: "var(--viz-critical)" }}>
                          {baselineFailures(baseline).join(", ")}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-mono">{stamp(baseline.lastChecked)}</span>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">Rooms</h2>
            <Link
              href="/room-presentation/rooms"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Rooms →
            </Link>
          </div>

          <ul className="space-y-2">
            {rooms.map((room) => {
              const roomAssets = assets.filter((a) => a.roomId === room.id);
              const roomOffline = roomAssets.filter((a) => a.status !== "Online");
              const session = live.find((s) => s.roomId === room.id);

              return (
                <li
                  key={room.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <span className="min-w-0">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      <FiMonitor size={14} className="text-neutral-400" aria-hidden="true" />
                      {room.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {room.location} · {roomAssets.length} devices · seats {room.seats}
                    </span>
                    {session && (
                      <span
                        className="mt-1 inline-flex items-center gap-1.5 text-xs"
                        style={{ color: "var(--viz-good)" }}
                      >
                        <FiPlayCircle size={11} aria-hidden="true" />
                        Presenting — {session.meetingTitle}
                      </span>
                    )}
                  </span>
                  <StatusBadge
                    tone={roomOffline.length === 0 ? "green" : ASSET_TONE[roomOffline[0].status]}
                  >
                    {roomOffline.length === 0
                      ? "All online"
                      : `${roomOffline.length} not online`}
                  </StatusBadge>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Read at {stamp(now)}. Nothing on these screens shows Cabinet content — this
        is the estate the content runs on, and it is administered separately from
        the material itself.
      </p>
    </div>
  );
}
