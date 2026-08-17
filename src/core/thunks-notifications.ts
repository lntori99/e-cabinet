/**
 * FR-NOT — notification, reminder and escalation.
 *
 * FR-NOT-10 requires delivery to be logged and failures surfaced. Everything
 * that changes a delivery record or a rule writes its audit entry in the same
 * dispatch, so the notification log and the audit log cannot drift apart.
 */
import { OPERATOR } from "@/core/app-constants";
import { logged } from "@/core/slices/audit-slice";
import {
  allCentreItemsRead,
  centreItemRead,
  deliveryRetried,
  escalationPointChanged,
  preferenceToggled,
  ruleLeadTimeChanged,
} from "@/core/slices/notification-slice";
import type {
  DeliveryRecord,
  EscalationPoint,
  NotificationChannel,
  NotificationTrigger,
  TriggerRule,
} from "@/models/response/base-response";
import type { AppThunk } from "@/core/store";

const actor = { actor: OPERATOR.name, role: OPERATOR.role, ip: OPERATOR.ip };
const now = () => new Date().toISOString().slice(0, 16);

/**
 * FR-NOT-10 — a retry against a channel that is still down fails again, and
 * the record says so. A retry that silently reported success would be worse
 * than no retry at all.
 */
export const retryDelivery =
  (record: DeliveryRecord): AppThunk =>
  (dispatch) => {
    // A number out of service does not come back because somebody pressed a
    // button; a full mailbox often does. The distinction is the whole point of
    // recording a reason rather than a flag.
    const succeeded = !record.failureReason?.toLowerCase().includes("out of service");

    dispatch(deliveryRetried({ id: record.id, succeeded, at: now() }));
    dispatch(
      logged({
        ...actor,
        action: succeeded ? "Notification redelivered" : "Notification retry failed",
        target: `${record.id} · ${record.recipient} · ${record.channel} · attempt ${record.attempts + 1}`,
        severity: succeeded ? "info" : "warning",
      }),
    );
  };

/** FR-NOT-09 */
export const markRead =
  (id: string): AppThunk =>
  (dispatch) => {
    dispatch(centreItemRead(id));
  };

export const markAllRead = (): AppThunk => (dispatch) => {
  dispatch(allCentreItemsRead());
};

/** FR-NOT-08 */
export const togglePreference =
  (trigger: NotificationTrigger, channel: NotificationChannel, mandatory: boolean): AppThunk =>
  (dispatch) => {
    if (mandatory) return;
    dispatch(preferenceToggled({ trigger, channel }));
    dispatch(
      logged({
        ...actor,
        action: "Notification preference changed",
        target: `${trigger} · ${channel}`,
        severity: "info",
      }),
    );
  };

/** FR-NOT-04, FR-NOT-05 */
export const updateEscalationPoint =
  (point: EscalationPoint, escalateTo: string, serviceTimeHours: number): AppThunk =>
  (dispatch) => {
    dispatch(
      escalationPointChanged({ id: point.id, escalateTo, serviceTimeHours }),
    );
    dispatch(
      logged({
        ...actor,
        action: "Escalation point changed",
        target: `${point.scope} · now ${escalateTo} after ${serviceTimeHours}h`,
        severity: "warning",
      }),
    );
  };

/** FR-NOT-03, FR-NOT-05 — the reminder lead time. */
export const updateLeadTime =
  (rule: TriggerRule, reminderLeadHours: number | null): AppThunk =>
  (dispatch) => {
    dispatch(ruleLeadTimeChanged({ id: rule.id, reminderLeadHours }));
    dispatch(
      logged({
        ...actor,
        action: "Reminder lead time changed",
        target: `${rule.trigger} · ${reminderLeadHours === null ? "no reminder" : `${reminderLeadHours}h before`}`,
        severity: "info",
      }),
    );
  };
