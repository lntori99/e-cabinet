"use client";

import { useState } from "react";
import { FiCheck, FiSearch } from "react-icons/fi";
import { controlCls } from "@/common/field";
import { Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectAssets,
  selectEndpointEvents,
  selectRooms,
} from "@/core/slices/rooms-slice";
import { acknowledgeEvent } from "@/core/thunks-rooms";
import type { EndpointEvent } from "@/models/response/base-response";
import { EVENT_COLOR, EVENT_TONE } from "../../components/roomStatus";

const KINDS: (EndpointEvent["kind"] | "All")[] = [
  "All",
  "Sign-in",
  "Administrative change",
  "Application access",
  "Software update",
  "Device error",
];

export default function EndpointLogBoard() {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectEndpointEvents);
  const assets = useAppSelector(selectAssets);
  const rooms = useAppSelector(selectRooms);

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("All");
  const [openOnly, setOpenOnly] = useState(false);

  const needle = query.trim().toLowerCase();
  const visible = [...events]
    .sort((a, b) => b.at.localeCompare(a.at))
    .filter((event) => kind === "All" || event.kind === kind)
    .filter((event) => !openOnly || (!event.acknowledgedAt && event.severity !== "info"))
    .filter(
      (event) =>
        !needle ||
        [event.detail, event.actor, event.assetId].some((field) =>
          field.toLowerCase().includes(needle),
        ),
    );

  const open = events.filter((e) => !e.acknowledgedAt && e.severity !== "info").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <FiSearch
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
            size={15}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search endpoint events"
            placeholder="Search by detail, actor or asset"
            className={`${controlCls} pl-9`}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setKind(option)}
              aria-pressed={kind === option}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                kind === option
                  ? "border-state-600 bg-state-600 text-white"
                  : "border-neutral-300 text-neutral-600 hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpenOnly((v) => !v)}
          aria-pressed={openOnly}
          className={`rounded-full border px-2.5 py-1 text-xs transition ${
            openOnly
              ? "border-seal-500 bg-seal-500 text-white"
              : "border-neutral-300 text-neutral-600 hover:border-seal-500 dark:border-neutral-700 dark:text-neutral-300"
          }`}
        >
          Unacknowledged ({open})
        </button>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>When</Th>
            <Th>Event</Th>
            <Th>Device</Th>
            <Th>Actor</Th>
            <Th align="right">Action</Th>
          </tr>
        </thead>
        <tbody>
          {visible.map((event) => {
            const asset = assets.find((a) => a.id === event.assetId);
            const room = rooms.find((r) => r.id === event.roomId);

            return (
              <tr
                key={event.id}
                className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
              >
                <Td>
                  <span className="font-mono whitespace-nowrap">{stamp(event.at)}</span>
                </Td>
                <Td>
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: EVENT_COLOR[event.severity] }}
                      aria-hidden="true"
                    />
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {event.kind}
                    </span>
                    <StatusBadge tone={EVENT_TONE[event.severity]}>
                      {event.severity}
                    </StatusBadge>
                  </span>
                  <span className="mt-1 block text-sm text-neutral-600 dark:text-neutral-300">
                    {event.detail}
                  </span>
                </Td>
                <Td>
                  {asset?.label ?? event.assetId}
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {asset?.assetTag} · {room?.name}
                  </span>
                </Td>
                <Td>{event.actor}</Td>
                <Td align="right">
                  {event.severity === "info" ? (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Informational
                    </span>
                  ) : event.acknowledgedAt ? (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {event.acknowledgedBy}
                      <span className="mt-0.5 block font-mono">
                        {stamp(event.acknowledgedAt)}
                      </span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => dispatch(acknowledgeEvent(event))}
                      className="inline-flex items-center gap-2 rounded-lg border border-state-600 px-3 py-1.5 text-sm font-medium text-state-700 transition hover:bg-state-600 hover:text-white dark:text-state-400"
                    >
                      <FiCheck size={14} aria-hidden="true" />
                      Acknowledge
                    </button>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {visible.length === 0 && (
        <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No event matches this filter.
        </p>
      )}

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Informational events are kept but need no action. Warnings and errors stay
        on the overview until an administrator acknowledges them by name — an
        unread error is not the same as one that has been looked at.
      </p>
    </div>
  );
}
