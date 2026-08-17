import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  BASELINE_CONTROLS,
  SCREEN_LOCK_LIMIT_MINUTES,
  seedAllowlist,
  seedAssets,
  seedAvPolicies,
  seedBaselines,
  seedEndpointEvents,
  seedPeripheralPolicies,
  seedRooms,
  seedSessions,
} from "@/data/rooms";
import type {
  AllowlistEntry,
  AvPolicy,
  BaselineState,
  EndpointEvent,
  PeripheralPolicy,
  Room,
  RoomAsset,
  RoomSession,
} from "@/models/response/base-response";
import type { RootState } from "@/core/store";

interface RoomsState {
  rooms: Room[];
  assets: RoomAsset[];
  baselines: BaselineState[];
  allowlist: AllowlistEntry[];
  peripheral: PeripheralPolicy[];
  av: AvPolicy[];
  sessions: RoomSession[];
  events: EndpointEvent[];
}

const initialState: RoomsState = {
  rooms: seedRooms,
  assets: seedAssets,
  baselines: seedBaselines,
  allowlist: seedAllowlist,
  peripheral: seedPeripheralPolicies,
  av: seedAvPolicies,
  sessions: seedSessions,
  events: seedEndpointEvents,
};

const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    /** FR-PRS-11 — acknowledging an event is a decision, so it carries a name. */
    eventAcknowledged(
      state,
      action: PayloadAction<{ eventId: string; by: string; at: string }>,
    ) {
      const event = state.events.find((e) => e.id === action.payload.eventId);
      if (!event) return;
      event.acknowledgedAt = action.payload.at;
      event.acknowledgedBy = action.payload.by;
    },

    /** FR-PRS-08 — a failed clear-down is re-run, and the result recorded. */
    clearDownRecorded(
      state,
      action: PayloadAction<{
        sessionId: string;
        outcome: RoomSession["clearDown"];
        at: string;
        note?: string;
      }>,
    ) {
      const session = state.sessions.find((s) => s.id === action.payload.sessionId);
      if (!session) return;
      session.clearDown = action.payload.outcome;
      session.clearDownAt = action.payload.at;
      session.clearDownNote = action.payload.note;
      if (!session.endedAt) session.endedAt = action.payload.at;
    },

    /** FR-PRS-09 */
    allowlistChanged(
      state,
      action: PayloadAction<{ entryId: string; nextState: AllowlistEntry["state"] }>,
    ) {
      const entry = state.allowlist.find((a) => a.id === action.payload.entryId);
      if (entry) entry.state = action.payload.nextState;
    },

    /** FR-PRS-12 — a device rechecked against the baseline. */
    baselineChecked(
      state,
      action: PayloadAction<{ assetId: string; patch: Partial<BaselineState>; at: string }>,
    ) {
      const baseline = state.baselines.find((b) => b.assetId === action.payload.assetId);
      if (!baseline) return;
      Object.assign(baseline, action.payload.patch);
      baseline.lastChecked = action.payload.at;
    },

    assetStatusChanged(
      state,
      action: PayloadAction<{ assetId: string; status: RoomAsset["status"] }>,
    ) {
      const asset = state.assets.find((a) => a.id === action.payload.assetId);
      if (asset) asset.status = action.payload.status;
    },
  },
});

export const {
  eventAcknowledged,
  clearDownRecorded,
  allowlistChanged,
  baselineChecked,
  assetStatusChanged,
} = roomsSlice.actions;

export default roomsSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectRooms = (s: RootState) => s.rooms.rooms;
export const selectAssets = (s: RootState) => s.rooms.assets;
export const selectBaselines = (s: RootState) => s.rooms.baselines;
export const selectAllowlist = (s: RootState) => s.rooms.allowlist;
export const selectPeripheralPolicies = (s: RootState) => s.rooms.peripheral;
export const selectAvPolicies = (s: RootState) => s.rooms.av;
export const selectRoomSessions = (s: RootState) => s.rooms.sessions;
export const selectEndpointEvents = (s: RootState) => s.rooms.events;

export const selectOnlineAssets = createSelector([selectAssets], (assets) =>
  assets.filter((a) => a.status === "Online"),
);

/** FR-PRS-08 — a session still running, or one whose clear-down has not passed. */
export const selectLiveSessions = createSelector([selectRoomSessions], (sessions) =>
  sessions.filter((s) => !s.endedAt),
);

export const selectFailedClearDowns = createSelector([selectRoomSessions], (sessions) =>
  sessions.filter((s) => s.clearDown === "Failed"),
);

export const selectUnacknowledgedEvents = createSelector(
  [selectEndpointEvents],
  (events) =>
    events
      .filter((e) => !e.acknowledgedAt && e.severity !== "info")
      .sort((a, b) => b.at.localeCompare(a.at)),
);

/** FR-PRS-12 — which controls a device fails, computed rather than stored. */
export function baselineFailures(baseline: BaselineState): string[] {
  const failures: string[] = [];
  if (!baseline.diskEncryption) failures.push("Disk encryption");
  if (!baseline.localFirewall) failures.push("Local firewall");
  if (!baseline.antiMalware) failures.push("Anti-malware");
  if (baseline.updatePolicy !== "Current") failures.push("Update policy");
  if (baseline.screenLockMinutes > SCREEN_LOCK_LIMIT_MINUTES) failures.push("Screen lock");
  if (!baseline.localAdminRestricted) failures.push("Local administrator restricted");
  return failures;
}

/** Devices failing at least one baseline control. */
export const selectOutOfPolicy = createSelector([selectBaselines], (baselines) =>
  baselines.filter((b) => baselineFailures(b).length > 0),
);

/** Per-control compliance, in the order the baseline is written. */
export const selectBaselineCompliance = createSelector(
  [selectBaselines],
  (baselines) =>
    BASELINE_CONTROLS.map((control) => {
      const failing = baselines.filter((b) =>
        baselineFailures(b).includes(control.label),
      ).length;
      return {
        control: control.label,
        detail: control.detail,
        compliant: baselines.length - failing,
        failing,
      };
    }),
);
