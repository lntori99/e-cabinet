import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { OPERATOR } from "@/core/app-constants";
import type { RootState } from "@/core/store";

/**
 * The operator's own settings.
 *
 * Directory-owned identity — name, role, ministry — is deliberately not here:
 * FR-IAM-02 makes the Government directory the authority for it, so this slice
 * holds only what the person is entitled to change about their own console.
 */
export interface NotificationChannel {
  id: string;
  label: string;
  detail: string;
  email: boolean;
  inApp: boolean;
}

interface PreferencesState {
  contactNumber: string;
  preferredName: string;
  outOfOffice: boolean;
  notifications: NotificationChannel[];
  timezone: string;
  dateFormat: string;
  language: string;
  /** Saved locally so the console never claims to have reached a server. */
  savedAt: string | null;
}

const initialState: PreferencesState = {
  contactNumber: "+265 999 000 114",
  preferredName: OPERATOR.name,
  outOfOffice: false,
  notifications: [
    {
      id: "pack-released",
      label: "A pack is released to me",
      detail: "The meeting pack for a sitting I am named on has gone out",
      email: true,
      inApp: true,
    },
    {
      id: "pack-replaced",
      label: "A pack I hold is replaced",
      detail: "A replacement version supersedes one I have already received",
      email: true,
      inApp: true,
    },
    {
      id: "paper-returned",
      label: "A paper is returned for amendment",
      detail: "A clearance actor sends a submission back to its ministry",
      email: true,
      inApp: true,
    },
    {
      id: "clearance-due",
      label: "A clearance decision is due",
      detail: "An item in my queue is approaching its service time",
      email: false,
      inApp: true,
    },
    {
      id: "escalation",
      label: "Something escalates to me",
      detail: "A stage passes its service time and I am the escalation point",
      email: true,
      inApp: true,
    },
    {
      id: "break-glass",
      label: "Break-glass access is granted",
      detail: "An administrator is given time-boxed access to document content",
      email: true,
      inApp: true,
    },
    {
      id: "meeting-reminder",
      label: "A sitting is approaching",
      detail: "Twenty-four hours before a meeting I am named on",
      email: false,
      inApp: true,
    },
  ],
  timezone: "Africa/Blantyre (CAT, UTC+2)",
  dateFormat: "2026-08-14 (ISO)",
  language: "English (Malawi)",
  savedAt: null,
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    contactChanged(
      state,
      action: PayloadAction<{
        contactNumber?: string;
        preferredName?: string;
        outOfOffice?: boolean;
        at: string;
      }>,
    ) {
      const { contactNumber, preferredName, outOfOffice, at } = action.payload;
      if (contactNumber !== undefined) state.contactNumber = contactNumber;
      if (preferredName !== undefined) state.preferredName = preferredName;
      if (outOfOffice !== undefined) state.outOfOffice = outOfOffice;
      state.savedAt = at;
    },
    notificationToggled(
      state,
      action: PayloadAction<{
        id: string;
        channel: "email" | "inApp";
        value: boolean;
        at: string;
      }>,
    ) {
      const channel = state.notifications.find((n) => n.id === action.payload.id);
      if (!channel) return;
      channel[action.payload.channel] = action.payload.value;
      state.savedAt = action.payload.at;
    },
    regionalChanged(
      state,
      action: PayloadAction<{
        timezone?: string;
        dateFormat?: string;
        language?: string;
        at: string;
      }>,
    ) {
      const { timezone, dateFormat, language, at } = action.payload;
      if (timezone) state.timezone = timezone;
      if (dateFormat) state.dateFormat = dateFormat;
      if (language) state.language = language;
      state.savedAt = at;
    },
  },
});

export const { contactChanged, notificationToggled, regionalChanged } =
  preferencesSlice.actions;

export default preferencesSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectPreferences = (s: RootState) => s.preferences;
export const selectNotifications = (s: RootState) => s.preferences.notifications;
