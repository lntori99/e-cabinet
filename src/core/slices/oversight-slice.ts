/**
 * FR-AUD — audit, reporting and oversight.
 *
 * The slice deliberately has no reducer that touches an audit event. FR-AUD-03
 * requires the log to be append-only with no interface at any privilege level
 * to modify or delete an event, and the honest way to build that is to expose
 * no such action — not to hide a button. What oversight owns is everything
 * *around* the log: alerts, reviews, verification runs and exports.
 */
import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  classifyAction,
  seedAlerts,
  seedAuditHistory,
  seedEntitlements,
  seedExports,
  seedIntegrityRuns,
  seedReplication,
  seedReports,
  seedRetention,
  type AuditedAction,
} from "@/data/audit";
import { selectAuditEntries } from "@/core/slices/audit-slice";
import type {
  AnomalyAlert,
  AuditEvent,
  EntitlementLine,
  ExportRecord,
  IntegrityRun,
} from "@/models/response/base-response";
import type { RootState } from "@/core/store";

interface OversightState {
  alerts: AnomalyAlert[];
  entitlements: EntitlementLine[];
  runs: IntegrityRun[];
  exports: ExportRecord[];
}

const initialState: OversightState = {
  alerts: seedAlerts,
  entitlements: seedEntitlements,
  runs: seedIntegrityRuns,
  exports: seedExports,
};

const slice = createSlice({
  name: "oversight",
  initialState,
  reducers: {
    /** FR-AUD-15 — an alert is dispositioned, never deleted. */
    alertReviewed(
      state,
      action: PayloadAction<{
        id: string;
        state: AnomalyAlert["state"];
        by: string;
        at: string;
        disposition: string;
      }>,
    ) {
      const alert = state.alerts.find((a) => a.id === action.payload.id);
      if (!alert) return;
      alert.state = action.payload.state;
      alert.reviewedBy = action.payload.by;
      alert.reviewedAt = action.payload.at;
      alert.disposition = action.payload.disposition;
    },

    /** FR-AUD-12 */
    entitlementDecided(
      state,
      action: PayloadAction<{
        id: string;
        decision: EntitlementLine["decision"];
        by: string;
        note?: string;
      }>,
    ) {
      const line = state.entitlements.find((e) => e.id === action.payload.id);
      if (!line) return;
      line.decision = action.payload.decision;
      line.reviewedBy = action.payload.by;
      if (action.payload.note !== undefined) line.note = action.payload.note;
    },

    /** FR-AUD-04 */
    integrityRunRecorded(state, action: PayloadAction<IntegrityRun>) {
      state.runs.unshift(action.payload);
    },

    /** FR-AUD-14 */
    exportRecorded(state, action: PayloadAction<ExportRecord>) {
      state.exports.unshift(action.payload);
    },
  },
});

export const {
  alertReviewed,
  entitlementDecided,
  exportRecorded,
  integrityRunRecorded,
} = slice.actions;

export default slice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectAlerts = (s: RootState) => s.oversight.alerts;
export const selectEntitlements = (s: RootState) => s.oversight.entitlements;
export const selectIntegrityRuns = (s: RootState) => s.oversight.runs;
export const selectExports = (s: RootState) => s.oversight.exports;
export const selectReplication = () => seedReplication;
export const selectReports = () => seedReports;
export const selectRetention = () => seedRetention;

/**
 * The whole log: what the platform has written this session, from every app,
 * together with the history that predates it. An audit console reading only its
 * own fixtures would not be auditing anything.
 */
export const selectAuditLog = createSelector([selectAuditEntries], (live) =>
  [...live, ...seedAuditHistory].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  ),
);

/** FR-AUD-01 — the log grouped into the eight kinds the requirement names. */
export const selectEventsByKind = createSelector([selectAuditLog], (events) => {
  const counts = new Map<AuditedAction, number>();
  for (const event of events) {
    const kind = classifyAction(event.action);
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  return counts;
});

export const selectOpenAlerts = createSelector([selectAlerts], (alerts) =>
  alerts.filter((a) => a.state === "Open" || a.state === "Under review"),
);

export const selectUnreviewedEntitlements = createSelector(
  [selectEntitlements],
  (lines) => lines.filter((l) => l.decision === "Not reviewed"),
);

/** Every event touching one named document, across versions. FR-AUD-10. */
export const selectDocumentHistory = (documentId: string) =>
  createSelector([selectAuditLog], (events) =>
    events.filter((e) => e.target.toUpperCase().includes(documentId.toUpperCase())),
  );

/** Every event by one named actor. FR-AUD-11. */
export const selectUserActivity = (actor: string) =>
  createSelector([selectAuditLog], (events) =>
    events.filter((e) => e.actor === actor),
  );

/** The distinct documents the log knows about, for the history picker. */
export const selectAuditedDocuments = createSelector([selectAuditLog], (events) => {
  const ids = new Set<string>();
  for (const event of events) {
    const match = event.target.match(/\b(DOC|PCK|DEC|ACT|MTG)-[0-9-]+/i);
    if (match) ids.add(match[0].toUpperCase());
  }
  return [...ids].sort();
});

export const selectAuditedActors = createSelector([selectAuditLog], (events) =>
  [...new Set(events.map((e) => e.actor))].sort(),
);

export type { AuditEvent };
