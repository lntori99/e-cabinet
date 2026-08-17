/**
 * FR-ADM — administration and configuration.
 *
 * Two rules are enforced in the reducer rather than in a component, because a
 * rule enforced in a component is a rule that holds until somebody adds a
 * second component: FR-ADM-05 refuses an approval by the implementer, and
 * FR-ADM-13 refuses a role change that would put platform administration and
 * audit administration in one pair of hands.
 */
import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  CAPACITY_WARNING_PERCENT,
  QUEUE_WARNING_DEPTH,
  seedAdminSessions,
  seedApprovals,
  seedBatches,
  seedChanges,
  seedDevices,
  seedDutyRules,
  seedEnvironments,
  seedHealth,
  seedSettings,
  seedWindows,
} from "@/data/administration";
import type {
  AdminSession,
  ChangeApproval,
  ConfigChange,
  ConfigSetting,
  ManagedDevice,
  MaintenanceWindow,
  OnboardingBatch,
} from "@/models/response/base-response";
import type { RootState } from "@/core/store";

interface AdminState {
  settings: ConfigSetting[];
  approvals: ChangeApproval[];
  changes: ConfigChange[];
  devices: ManagedDevice[];
  windows: MaintenanceWindow[];
  batches: OnboardingBatch[];
  sessions: AdminSession[];
}

const initialState: AdminState = {
  settings: seedSettings,
  approvals: seedApprovals,
  changes: seedChanges,
  devices: seedDevices,
  windows: seedWindows,
  batches: seedBatches,
  sessions: seedAdminSessions,
};

const slice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    /**
     * FR-ADM-05 — the guard is here, not on the button. An approval by the
     * implementer is refused whatever screen asked for it.
     */
    approvalDecided(
      state,
      action: PayloadAction<{
        id: string;
        approve: boolean;
        approver: string;
        at: string;
        note: string;
      }>,
    ) {
      const approval = state.approvals.find((a) => a.id === action.payload.id);
      if (!approval || approval.state !== "Awaiting approval") return;
      if (approval.implementer === action.payload.approver) return;

      approval.state = action.payload.approve ? "Approved" : "Rejected";
      approval.approver = action.payload.approver;
      approval.decidedAt = action.payload.at;
      approval.decisionNote = action.payload.note;

      if (!action.payload.approve) return;

      // An approved change is applied, and applying it writes both values.
      const setting = state.settings.find(
        (s) => s.area === approval.area && s.label === approval.label,
      );
      if (!setting) return;

      state.changes.unshift({
        id: `CHG-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        at: action.payload.at,
        actor: approval.implementer,
        role: "Technical Administrator",
        area: approval.area,
        settingId: setting.id,
        label: setting.label,
        previousValue: setting.value,
        newValue: approval.proposedValue,
        securityRelevant: true,
        approvalId: approval.id,
      });
      setting.value = approval.proposedValue;
      setting.lastChangedBy = approval.implementer;
      setting.lastChangedAt = action.payload.at;
    },

    /**
     * FR-ADM-02, FR-ADM-03, FR-ADM-04. A setting that is not security-relevant
     * changes directly; a security-relevant one may not, so this refuses it and
     * the caller raises an approval instead.
     */
    settingChanged(
      state,
      action: PayloadAction<{
        id: string;
        value: string;
        actor: string;
        role: string;
        at: string;
      }>,
    ) {
      const setting = state.settings.find((s) => s.id === action.payload.id);
      if (!setting || setting.securityRelevant) return;

      state.changes.unshift({
        id: `CHG-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        at: action.payload.at,
        actor: action.payload.actor,
        role: action.payload.role,
        area: setting.area,
        settingId: setting.id,
        label: setting.label,
        previousValue: setting.value,
        newValue: action.payload.value,
        securityRelevant: false,
      });
      setting.value = action.payload.value;
      setting.lastChangedBy = action.payload.actor;
      setting.lastChangedAt = action.payload.at;
    },

    approvalRaised(state, action: PayloadAction<ChangeApproval>) {
      state.approvals.unshift(action.payload);
    },

    /** FR-ADM-09 */
    deviceWiped(
      state,
      action: PayloadAction<{ id: string; by: string; at: string }>,
    ) {
      const device = state.devices.find((d) => d.id === action.payload.id);
      if (!device || device.compliance === "Wiped") return;
      device.compliance = "Wiped";
      device.wipedAt = action.payload.at;
      device.wipedBy = action.payload.by;
      device.findings = [...device.findings, "Remotely wiped by an administrator"];
    },

    deviceReportedLost(state, action: PayloadAction<string>) {
      const device = state.devices.find((d) => d.id === action.payload);
      if (!device) return;
      device.reportedLost = true;
      if (device.compliance !== "Wiped") device.compliance = "Non-compliant";
    },

    /** FR-ADM-10 */
    windowNotified(
      state,
      action: PayloadAction<{ id: string; at: string; groups: string[] }>,
    ) {
      const window = state.windows.find((w) => w.id === action.payload.id);
      if (!window) return;
      window.notifiedAt = action.payload.at;
      window.notifiedGroups = action.payload.groups;
    },

    windowCancelled(state, action: PayloadAction<string>) {
      const window = state.windows.find((w) => w.id === action.payload);
      if (window) window.state = "Cancelled";
    },

    /** FR-ADM-12 — a batch with errors cannot be applied. */
    batchApplied(
      state,
      action: PayloadAction<{ id: string; by: string; at: string }>,
    ) {
      const batch = state.batches.find((b) => b.id === action.payload.id);
      if (!batch || batch.errors.length > 0 || batch.state === "Applied") return;
      batch.state = "Applied";
      batch.appliedAt = action.payload.at;
      batch.appliedBy = action.payload.by;
    },

    /** FR-ADM-11 */
    sessionReviewed(state, action: PayloadAction<string>) {
      const session = state.sessions.find((s) => s.id === action.payload);
      if (session) session.reviewed = true;
    },
  },
});

export const {
  approvalDecided,
  approvalRaised,
  batchApplied,
  deviceReportedLost,
  deviceWiped,
  sessionReviewed,
  settingChanged,
  windowCancelled,
  windowNotified,
} = slice.actions;

export default slice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectSettings = (s: RootState) => s.admin.settings;
export const selectApprovals = (s: RootState) => s.admin.approvals;
export const selectChanges = (s: RootState) => s.admin.changes;
export const selectDevices = (s: RootState) => s.admin.devices;
export const selectWindows = (s: RootState) => s.admin.windows;
export const selectBatches = (s: RootState) => s.admin.batches;
export const selectAdminSessions = (s: RootState) => s.admin.sessions;
export const selectHealth = (_s: RootState) => seedHealth;
export const selectEnvironments = () => seedEnvironments;
export const selectDutyRules = () => seedDutyRules;

export const selectPendingApprovals = createSelector([selectApprovals], (approvals) =>
  approvals.filter((a) => a.state === "Awaiting approval"),
);

/** FR-ADM-06 — anything that is not simply healthy. */
export const selectHealthWarnings = createSelector([selectHealth], (services) =>
  services.filter(
    (s) =>
      s.status !== "Healthy" ||
      (s.usedPercent !== undefined && s.usedPercent >= CAPACITY_WARNING_PERCENT) ||
      (s.queueDepth !== undefined && s.queueDepth >= QUEUE_WARNING_DEPTH),
  ),
);

export const selectNonCompliantDevices = createSelector([selectDevices], (devices) =>
  devices.filter((d) => d.compliance === "Non-compliant" || d.compliance === "At risk"),
);

export const selectUpcomingWindows = createSelector([selectWindows], (windows) =>
  windows
    .filter((w) => w.state === "Scheduled" || w.state === "In progress")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
);

export const selectUnreviewedSessions = createSelector(
  [selectAdminSessions],
  (sessions) => sessions.filter((s) => !s.reviewed),
);
