import { createSlice, createSelector, type PayloadAction } from "@reduxjs/toolkit";
import { seedActions, seedDecisions } from "@/data/ecabinet";
import type { ActionItem, ActionStatus, Decision } from "@/models/response/base-response";
import type { RootState } from "@/core/store";

/** Statuses the tracker cycles through when a badge is clicked. */
export const ACTION_CYCLE: ActionStatus[] = ["Not started", "In progress", "Completed"];

interface DecisionsState {
  decisions: Decision[];
  actions: ActionItem[];
}

const initialState: DecisionsState = {
  decisions: seedDecisions,
  actions: seedActions,
};

const decisionsSlice = createSlice({
  name: "decisions",
  initialState,
  reducers: {
    recorded(state, action: PayloadAction<Decision>) {
      state.decisions.unshift(action.payload);
    },
    actionStatusChanged(
      state,
      action: PayloadAction<{ actionId: string; status: ActionStatus }>,
    ) {
      const item = state.actions.find((a) => a.id === action.payload.actionId);
      if (item) item.status = action.payload.status;
    },
  },
});

export const { recorded, actionStatusChanged } = decisionsSlice.actions;
export default decisionsSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectDecisions = (s: RootState) => s.decisions.decisions;
export const selectActions = (s: RootState) => s.decisions.actions;

export const selectOverdueActions = createSelector([selectActions], (actions) =>
  actions.filter((a) => a.status === "Overdue"),
);

export const selectActionsByStatus = createSelector([selectActions], (actions) =>
  (["Completed", "In progress", "Not started", "Overdue"] as ActionStatus[]).map(
    (label) => ({ label, count: actions.filter((a) => a.status === label).length }),
  ),
);

/** Overdue is a derived state, so re-entering the cycle starts from the top. */
export function nextActionStatus(current: ActionStatus): ActionStatus {
  const from = current === "Overdue" ? "Not started" : current;
  return ACTION_CYCLE[(ACTION_CYCLE.indexOf(from) + 1) % ACTION_CYCLE.length];
}
