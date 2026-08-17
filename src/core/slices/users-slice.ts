import { createSlice, createSelector, type PayloadAction } from "@reduxjs/toolkit";
import { seedUsers } from "@/data/ecabinet";
import type { CabinetUser } from "@/models/response/base-response";
import type { RootState } from "@/core/store";

interface UsersState {
  items: CabinetUser[];
}

const initialState: UsersState = { items: seedUsers };

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    created(state, action: PayloadAction<CabinetUser>) {
      state.items.unshift(action.payload);
    },
    statusChanged(
      state,
      action: PayloadAction<{ userId: string; status: CabinetUser["status"] }>,
    ) {
      const user = state.items.find((u) => u.id === action.payload.userId);
      if (user) user.status = action.payload.status;
    },
  },
});

export const { created, statusChanged } = usersSlice.actions;
export default usersSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectUsers = (s: RootState) => s.users.items;

export const selectActiveUserCount = createSelector(
  [selectUsers],
  (users) => users.filter((u) => u.status === "Active").length,
);
