import {
  configureStore,
  type Action,
  type ThunkAction,
} from "@reduxjs/toolkit";
import meetings from "./slices/meetings-slice";
import documents from "./slices/documents-slice";
import decisions from "./slices/decisions-slice";
import users from "./slices/users-slice";
import identity from "./slices/identity-slice";
import submissions from "./slices/submissions-slice";
import packs from "./slices/packs-slice";
import preferences from "./slices/preferences-slice";
import docsec from "./slices/docsec-slice";
import review from "./slices/review-slice";
import rooms from "./slices/rooms-slice";
import video from "./slices/video-slice";
import decisionRecord from "./slices/decision-slice";
import search from "./slices/search-slice";
import notifications from "./slices/notification-slice";
import oversight from "./slices/oversight-slice";
import admin from "./slices/admin-slice";
import governance from "./slices/governance-slice";
import audit from "./slices/audit-slice";
import session from "./slices/session-slice";
import ui from "./slices/ui-slice";

/**
 * A factory rather than a module-level singleton: in the App Router a shared
 * store would leak state between requests and between users. `StoreProvider`
 * calls this once per client.
 *
 * State is seeded from `src/data/ecabinet.ts`. Swap the seeds for RTK Query
 * endpoints or async thunks when the backend is available.
 */
export const makeStore = () =>
  configureStore({
    reducer: {
      meetings,
      documents,
      decisions,
      users,
      identity,
      submissions,
      packs,
      preferences,
      docsec,
      review,
      rooms,
      video,
      decisionRecord,
      search,
      notifications,
      oversight,
      admin,
      governance,
      audit,
      session,
      ui,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action
>;
