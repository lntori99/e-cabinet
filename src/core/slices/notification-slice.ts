/**
 * FR-NOT — notification, reminder and escalation.
 *
 * The slice holds what the notification service produces (the delivery log and
 * the in-platform centre) and what configures it (rules, templates, escalation
 * points, preferences). It holds no message content, because there is none: a
 * notification carries a template reference and a record reference, never the
 * material itself.
 */
import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  seedCentreItems,
  seedDeliveries,
  seedEscalationPoints,
  seedPreferences,
  seedRules,
  seedTemplates,
} from "@/data/notifications";
import type {
  CentreItem,
  DeliveryRecord,
  EscalationPoint,
  NotificationChannel,
  NotificationPreference,
  NotificationTemplate,
  NotificationTrigger,
  TriggerRule,
} from "@/models/response/base-response";
import type { RootState } from "@/core/store";

interface NotificationState {
  deliveries: DeliveryRecord[];
  templates: NotificationTemplate[];
  rules: TriggerRule[];
  escalationPoints: EscalationPoint[];
  preferences: NotificationPreference[];
  centre: CentreItem[];
}

const initialState: NotificationState = {
  deliveries: seedDeliveries,
  templates: seedTemplates,
  rules: seedRules,
  escalationPoints: seedEscalationPoints,
  preferences: seedPreferences,
  centre: seedCentreItems,
};

const slice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    /** FR-NOT-10 — a retry is a new attempt on the same record, not a new one. */
    deliveryRetried(
      state,
      action: PayloadAction<{ id: string; succeeded: boolean; at: string }>,
    ) {
      const record = state.deliveries.find((d) => d.id === action.payload.id);
      if (!record) return;
      record.attempts += 1;
      record.at = action.payload.at;
      if (action.payload.succeeded) {
        record.state = "Delivered";
        record.failureReason = undefined;
      }
    },

    /** FR-NOT-09 */
    centreItemRead(state, action: PayloadAction<string>) {
      const item = state.centre.find((c) => c.id === action.payload);
      if (item) item.read = true;
    },
    allCentreItemsRead(state) {
      for (const item of state.centre) item.read = true;
    },

    /**
     * FR-NOT-08 — a user may narrow their own channels, but never below what
     * policy requires. The guard is here rather than in the component so a
     * mandatory notification cannot be switched off down some other path.
     */
    preferenceToggled(
      state,
      action: PayloadAction<{
        trigger: NotificationTrigger;
        channel: NotificationChannel;
      }>,
    ) {
      const pref = state.preferences.find(
        (p) => p.trigger === action.payload.trigger,
      );
      if (!pref || pref.mandatory) return;
      pref.channels = pref.channels.includes(action.payload.channel)
        ? pref.channels.filter((c) => c !== action.payload.channel)
        : [...pref.channels, action.payload.channel];
    },

    /** FR-NOT-04, FR-NOT-05 */
    escalationPointChanged(
      state,
      action: PayloadAction<{ id: string; escalateTo: string; serviceTimeHours: number }>,
    ) {
      const point = state.escalationPoints.find((p) => p.id === action.payload.id);
      if (!point) return;
      point.escalateTo = action.payload.escalateTo;
      point.serviceTimeHours = action.payload.serviceTimeHours;
    },

    ruleLeadTimeChanged(
      state,
      action: PayloadAction<{ id: string; reminderLeadHours: number | null }>,
    ) {
      const rule = state.rules.find((r) => r.id === action.payload.id);
      if (rule) rule.reminderLeadHours = action.payload.reminderLeadHours;
    },
  },
});

export const {
  allCentreItemsRead,
  centreItemRead,
  deliveryRetried,
  escalationPointChanged,
  preferenceToggled,
  ruleLeadTimeChanged,
} = slice.actions;

export default slice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectDeliveries = (s: RootState) => s.notifications.deliveries;
export const selectTemplates = (s: RootState) => s.notifications.templates;
export const selectRules = (s: RootState) => s.notifications.rules;
export const selectEscalationPoints = (s: RootState) =>
  s.notifications.escalationPoints;
export const selectPreferences = (s: RootState) => s.notifications.preferences;
export const selectCentre = (s: RootState) => s.notifications.centre;

/** FR-NOT-10 — the ones the Secretariat has to do something about. */
export const selectFailedDeliveries = createSelector([selectDeliveries], (records) =>
  records.filter((r) => r.state === "Failed"),
);

export const selectPendingDeliveries = createSelector([selectDeliveries], (records) =>
  records.filter((r) => r.state === "Pending"),
);

export const selectOutstandingCentreItems = createSelector([selectCentre], (items) =>
  items.filter((i) => !i.read),
);

export const selectActionableCentreItems = createSelector([selectCentre], (items) =>
  items.filter((i) => i.actionable && !i.read),
);

/** The template a delivery was sent from, for the log's detail line. */
export const selectTemplateById = (id: string) =>
  createSelector([selectTemplates], (templates) => templates.find((t) => t.id === id));
