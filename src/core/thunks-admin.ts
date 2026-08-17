/**
 * FR-ADM — administration and configuration.
 *
 * FR-ADM-04 requires every configuration change in the audit log with the
 * previous value, the new value, the actor and the timestamp. Both values go
 * into the audit target here, so the log answers "what did it used to be"
 * without anyone having to find the change record first.
 */
import { OPERATOR } from "@/core/app-constants";
import { logged } from "@/core/slices/audit-slice";
import {
  approvalDecided,
  approvalRaised,
  batchApplied,
  deviceReportedLost,
  deviceWiped,
  sessionReviewed,
  settingChanged,
  windowCancelled,
  windowNotified,
} from "@/core/slices/admin-slice";
import type {
  AdminSession,
  ChangeApproval,
  ConfigSetting,
  ManagedDevice,
  MaintenanceWindow,
  OnboardingBatch,
} from "@/models/response/base-response";
import type { AppThunk } from "@/core/store";

const actor = { actor: OPERATOR.name, role: OPERATOR.role, ip: OPERATOR.ip };
const who = `${OPERATOR.name} (${OPERATOR.shortRole})`;
const now = () => new Date().toISOString().slice(0, 16);
const rid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

/** FR-ADM-02, FR-ADM-03, FR-ADM-04 — a change that needs no second approver. */
export const changeSetting =
  (setting: ConfigSetting, value: string): AppThunk =>
  (dispatch) => {
    if (setting.securityRelevant) return;
    dispatch(
      settingChanged({
        id: setting.id,
        value,
        actor: OPERATOR.name,
        role: OPERATOR.role,
        at: now(),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: "Configuration changed",
        target: `${setting.label} · was "${setting.value}" · now "${value}"`,
        severity: "info",
      }),
    );
  };

/** FR-ADM-05 — a security-relevant change is proposed, never applied directly. */
export const proposeChange =
  (setting: ConfigSetting, proposedValue: string, justification: string): AppThunk =>
  (dispatch) => {
    const approval: ChangeApproval = {
      id: rid("APR"),
      submittedAt: now(),
      implementer: who,
      area: setting.area,
      label: setting.label,
      previousValue: setting.value,
      proposedValue,
      justification,
      state: "Awaiting approval",
    };
    dispatch(approvalRaised(approval));
    dispatch(
      logged({
        ...actor,
        action: "Security-relevant change proposed",
        target: `${setting.label} · was "${setting.value}" · proposed "${proposedValue}"`,
        severity: "warning",
      }),
    );
  };

/**
 * FR-ADM-05 — the reducer refuses an approval by the implementer, so this only
 * has to say so in the log when it happens.
 */
export const decideApproval =
  (approval: ChangeApproval, approve: boolean, note: string): AppThunk =>
  (dispatch) => {
    if (approval.implementer === who) {
      dispatch(
        logged({
          ...actor,
          action: "Self-approval refused",
          target: `${approval.id} · ${approval.label} — the implementer may not approve their own change`,
          outcome: "Denied",
          severity: "warning",
        }),
      );
      return;
    }

    const at = now();
    dispatch(approvalDecided({ id: approval.id, approve, approver: who, at, note }));
    dispatch(
      logged({
        ...actor,
        action: approve
          ? "Security-relevant change approved and applied"
          : "Security-relevant change rejected",
        target: `${approval.id} · ${approval.label} · was "${approval.previousValue}" · ${
          approve ? `now "${approval.proposedValue}"` : "unchanged"
        }`,
        severity: "warning",
      }),
    );
  };

/** FR-ADM-09 */
export const wipeDevice =
  (device: ManagedDevice): AppThunk =>
  (dispatch) => {
    dispatch(deviceWiped({ id: device.id, by: who, at: now() }));
    dispatch(
      logged({
        ...actor,
        action: "Managed device remotely wiped",
        target: `${device.id} · ${device.assignedTo} · ${device.ministry}`,
        severity: "critical",
      }),
    );
  };

export const reportDeviceLost =
  (device: ManagedDevice): AppThunk =>
  (dispatch) => {
    dispatch(deviceReportedLost(device.id));
    dispatch(
      logged({
        ...actor,
        action: "Managed device reported lost",
        target: `${device.id} · ${device.assignedTo}`,
        severity: "critical",
      }),
    );
  };

/** FR-ADM-10 */
export const notifyWindow =
  (window: MaintenanceWindow, groups: string[]): AppThunk =>
  (dispatch) => {
    dispatch(windowNotified({ id: window.id, at: now(), groups }));
    dispatch(
      logged({
        ...actor,
        action: "Maintenance window notified",
        target: `${window.id} · ${window.title} · ${groups.join(", ")}`,
        severity: "info",
      }),
    );
  };

export const cancelWindow =
  (window: MaintenanceWindow, reason: string): AppThunk =>
  (dispatch) => {
    dispatch(windowCancelled(window.id));
    dispatch(
      logged({
        ...actor,
        action: "Maintenance window cancelled",
        target: `${window.id} · ${window.title} · ${reason}`,
        severity: "warning",
      }),
    );
  };

/** FR-ADM-12 */
export const applyBatch =
  (batch: OnboardingBatch): AppThunk =>
  (dispatch) => {
    if (batch.errors.length > 0) return;
    dispatch(batchApplied({ id: batch.id, by: who, at: now() }));
    dispatch(
      logged({
        ...actor,
        action: "Bulk onboarding applied",
        target: `${batch.id} · ${batch.ministry} · ${batch.rows} accounts · ${batch.rolesAssigned.join(", ")}`,
        severity: "warning",
      }),
    );
  };

/** FR-ADM-11 */
export const markSessionReviewed =
  (session: AdminSession): AppThunk =>
  (dispatch) => {
    dispatch(sessionReviewed(session.id));
    dispatch(
      logged({
        ...actor,
        action: "Administrative session recording reviewed",
        target: `${session.id} · ${session.actor} · ${session.purpose}`,
        severity: "info",
      }),
    );
  };
