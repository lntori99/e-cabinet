"use client";

import { useState } from "react";
import { FiSearch, FiTool } from "react-icons/fi";
import { controlCls } from "@/common/field";
import { Table, Td, Th } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectAssets, selectRooms } from "@/core/slices/rooms-slice";
import { setAssetStatus } from "@/core/thunks-rooms";
import type { AssetKind } from "@/models/response/base-response";
import { ASSET_TONE } from "../../components/roomStatus";

const KINDS: (AssetKind | "All")[] = [
  "All",
  "OPS PC",
  "Screen",
  "Camera",
  "Microphone",
  "Stand",
  "Accessory",
];

export default function AssetRegister() {
  const dispatch = useAppDispatch();
  const assets = useAppSelector(selectAssets);
  const rooms = useAppSelector(selectRooms);

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("All");
  const [roomId, setRoomId] = useState("All");

  const needle = query.trim().toLowerCase();
  const visible = assets
    .filter((asset) => kind === "All" || asset.kind === kind)
    .filter((asset) => roomId === "All" || asset.roomId === roomId)
    .filter(
      (asset) =>
        !needle ||
        [asset.label, asset.assetTag, asset.serial, asset.model].some((field) =>
          field.toLowerCase().includes(needle),
        ),
    );

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
            aria-label="Search the asset register"
            placeholder="Search by label, asset tag, serial or model"
            className={`${controlCls} pl-9`}
          />
        </div>

        <select
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          aria-label="Filter by room"
          className={`${controlCls} sm:w-56`}
        >
          <option value="All">All rooms</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>

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

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          {visible.length} of {assets.length}
        </p>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Asset</Th>
            <Th>Room</Th>
            <Th>Identifiers</Th>
            <Th>Commissioned</Th>
            <Th>Status</Th>
            <Th align="right">Action</Th>
          </tr>
        </thead>
        <tbody>
          {visible.map((asset) => {
            const room = rooms.find((r) => r.id === asset.roomId);
            return (
              <tr
                key={asset.id}
                className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
              >
                <Td>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {asset.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {asset.kind} · {asset.model}
                    {asset.managed ? "" : " · not a managed endpoint"}
                  </span>
                </Td>
                <Td>{room?.name ?? asset.roomId}</Td>
                <Td>
                  <span className="font-mono">{asset.assetTag}</span>
                  <span className="mt-0.5 block font-mono text-xs text-neutral-500 dark:text-neutral-400">
                    serial {asset.serial}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono">{asset.commissionedAt}</span>
                  {asset.warrantyUntil && (
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      warranty to {asset.warrantyUntil}
                    </span>
                  )}
                </Td>
                <Td>
                  <StatusBadge tone={ASSET_TONE[asset.status]}>
                    {asset.status}
                  </StatusBadge>
                </Td>
                <Td align="right">
                  {asset.status === "Online" ? (
                    <button
                      type="button"
                      onClick={() => dispatch(setAssetStatus(asset, "In maintenance"))}
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
                    >
                      <FiTool size={14} aria-hidden="true" />
                      To maintenance
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => dispatch(setAssetStatus(asset, "Online"))}
                      className="inline-flex items-center gap-2 rounded-lg border border-state-600 px-3 py-1.5 text-sm font-medium text-state-700 transition hover:bg-state-600 hover:text-white dark:text-state-400"
                    >
                      Return to service
                    </button>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Returning a device to service does not clear a baseline failure or an
        outstanding error — those are dealt with on their own screens, and the
        register only records where the asset is and whether it is in use.
      </p>
    </div>
  );
}
