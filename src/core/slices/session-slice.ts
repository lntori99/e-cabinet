import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/core/store";
import type {
  UpdateParticipantRequest,
  UpdateSessionRequest,
} from "@/models/request/session-request";

export interface Participant {
  name: string;
  site: string;
  muted: boolean;
  video: boolean;
}

interface SessionState {
  locked: boolean;
  presentingPack: boolean;
  participants: Participant[];
}

const initialState: SessionState = {
  locked: true,
  presentingPack: true,
  participants: [
    { name: "Cabinet Room CR-01 (IMAGO)", site: "Capital Hill, Lilongwe", muted: false, video: true },
    { name: "Hon. Minister of Finance", site: "MoF Briefing Room", muted: true, video: true },
    { name: "Hon. Minister of Health", site: "MoH Briefing Room", muted: true, video: true },
    { name: "State House Briefing Room", site: "Presidency", muted: true, video: false },
  ],
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    sessionUpdated(state, action: PayloadAction<UpdateSessionRequest>) {
      if (action.payload.locked !== undefined) state.locked = action.payload.locked;
      if (action.payload.presentingPack !== undefined) {
        state.presentingPack = action.payload.presentingPack;
      }
    },
    participantUpdated(state, action: PayloadAction<UpdateParticipantRequest>) {
      const p = state.participants.find((x) => x.name === action.payload.participant);
      if (!p) return;
      if (action.payload.muted !== undefined) p.muted = action.payload.muted;
      if (action.payload.video !== undefined) p.video = action.payload.video;
    },
    participantRemoved(state, action: PayloadAction<string>) {
      state.participants = state.participants.filter((p) => p.name !== action.payload);
    },
  },
});

export const { sessionUpdated, participantUpdated, participantRemoved } =
  sessionSlice.actions;
export default sessionSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectSession = (s: RootState) => s.session;
export const selectParticipants = (s: RootState) => s.session.participants;
