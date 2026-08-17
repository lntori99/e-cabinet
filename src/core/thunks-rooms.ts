/**
 * Meeting presentation and IMAGO room collaboration — FR-PRS-01 … FR-PRS-15.
 *
 * A room endpoint sits in a Cabinet Room with Cabinet material on it, so the
 * changes an administrator makes to one are logged with the same weight as
 * access decisions elsewhere: FR-PRS-11 requires sign-in, administrative change,
 * application access, software update and device error to reach the central log.
 */
import { OPERATOR } from "@/core/app-constants";
import type { AppThunk } from "@/core/store";
import { logged } from "@/core/slices/audit-slice";
import {
  allowlistChanged,
  assetStatusChanged,
  baselineChecked,
  clearDownRecorded,
  eventAcknowledged,
} from "@/core/slices/rooms-slice";
import type {
  AllowlistEntry,
  BaselineState,
  EndpointEvent,
  RoomAsset,
  RoomSession,
} from "@/models/response/base-response";

const actor = { actor: OPERATOR.name, role: OPERATOR.role, ip: OPERATOR.ip };
const by = `${OPERATOR.name} (${OPERATOR.shortRole})`;
const now = () => new Date().toISOString().slice(0, 16);

/** FR-PRS-11 */
export const acknowledgeEvent =
  (event: EndpointEvent): AppThunk =>
  (dispatch) => {
    dispatch(eventAcknowledged({ eventId: event.id, by, at: now() }));
    dispatch(
      logged({
        ...actor,
        action: `Endpoint event acknowledged — ${event.kind.toLowerCase()}`,
        target: `${event.assetId} — ${event.detail}`,
        severity: "info",
      }),
    );
  };

/** FR-PRS-08 — the clear-down re-run, and its outcome put on the record. */
export const recordClearDown =
  (session: RoomSession, outcome: RoomSession["clearDown"], note?: string): AppThunk =>
  (dispatch) => {
    dispatch(
      clearDownRecorded({ sessionId: session.id, outcome, at: now(), note }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Session clear-down ${outcome.toLowerCase()} — state, cache, credentials and annotations`,
        target: `${session.id} — ${session.meetingTitle}`,
        severity: outcome === "Confirmed" ? "info" : "critical",
      }),
    );
  };

/** FR-PRS-09 */
export const setAllowlistState =
  (entry: AllowlistEntry, nextState: AllowlistEntry["state"]): AppThunk =>
  (dispatch) => {
    dispatch(allowlistChanged({ entryId: entry.id, nextState }));
    dispatch(
      logged({
        ...actor,
        action: `Room application ${nextState.toLowerCase()} on every endpoint`,
        target: `${entry.name} — ${entry.publisher}`,
        severity: nextState === "Approved" ? "warning" : "info",
      }),
    );
  };

/** FR-PRS-12 — remediation, recorded against the device it was applied to. */
export const remediateBaseline =
  (request: {
    assetId: string;
    label: string;
    patch: Partial<BaselineState>;
    what: string;
  }): AppThunk =>
  (dispatch) => {
    dispatch(
      baselineChecked({ assetId: request.assetId, patch: request.patch, at: now() }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Baseline remediated — ${request.what}`,
        target: `${request.assetId} — ${request.label}`,
        severity: "warning",
      }),
    );
  };

export const setAssetStatus =
  (asset: RoomAsset, status: RoomAsset["status"]): AppThunk =>
  (dispatch) => {
    dispatch(assetStatusChanged({ assetId: asset.id, status }));
    dispatch(
      logged({
        ...actor,
        action: `Asset moved to ${status.toLowerCase()}`,
        target: `${asset.assetTag} — ${asset.label}`,
        severity: status === "Online" ? "info" : "warning",
      }),
    );
  };
