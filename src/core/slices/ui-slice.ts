import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/core/store";

export type Theme = "light" | "dark";

/**
 * Console section is the URL now, not store state — see `src/common/nav.ts`.
 * What is left here is the chrome that has no address of its own.
 */
interface UiState {
  theme: Theme;
}

const initialState: UiState = { theme: "light" };

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    /** Sync from the DOM on mount — the no-flash script in layout.tsx runs first. */
    themeHydrated(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    themeToggled(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
    /** Chosen outright rather than flipped — see the settings screen. */
    themeSet(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
  },
});

export const { themeHydrated, themeToggled, themeSet } = uiSlice.actions;
export default uiSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectTheme = (s: RootState) => s.ui.theme;
