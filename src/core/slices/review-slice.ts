import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  seedAnnotations,
  seedComments,
  seedFlags,
  seedReadingList,
} from "@/data/review";
import type {
  Annotation,
  FormalComment,
  ReadingItem,
  ReviewFlag,
} from "@/models/response/base-response";
import type { RootState } from "@/core/store";

interface ReviewState {
  reading: ReadingItem[];
  annotations: Annotation[];
  comments: FormalComment[];
  flags: ReviewFlag[];
  /** The paper currently open in the reading view. */
  openDocumentId: string;
}

const initialState: ReviewState = {
  reading: seedReadingList,
  annotations: seedAnnotations,
  comments: seedComments,
  flags: seedFlags,
  openDocumentId: seedReadingList[1]?.documentId ?? "",
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    /** FR-REV-07 — recorded with its timestamp, and not undoable. */
    acknowledged(
      state,
      action: PayloadAction<{ documentId: string; at: string }>,
    ) {
      const item = state.reading.find(
        (r) => r.documentId === action.payload.documentId,
      );
      if (!item || item.acknowledgedAt) return;
      item.acknowledgedAt = action.payload.at;
      // Acknowledging a paper you have not opened is possible but odd; record
      // that it was read to the end so the two numbers do not contradict.
      item.pagesRead = item.pages;
    },

    /** FR-REV-01 / 02 — reading position, kept so a reader can resume. */
    pageRead(
      state,
      action: PayloadAction<{ documentId: string; page: number }>,
    ) {
      const item = state.reading.find(
        (r) => r.documentId === action.payload.documentId,
      );
      if (!item) return;
      item.pagesRead = Math.max(item.pagesRead, action.payload.page);
    },

    opened(state, action: PayloadAction<string>) {
      state.openDocumentId = action.payload;
    },

    /** FR-REV-03 / 05 — private, and bound to the version annotated. */
    annotationAdded(state, action: PayloadAction<Annotation>) {
      state.annotations.unshift(action.payload);
    },
    annotationRemoved(state, action: PayloadAction<string>) {
      state.annotations = state.annotations.filter((a) => a.id !== action.payload);
    },

    /** FR-REV-04 */
    commentRaised(state, action: PayloadAction<FormalComment>) {
      state.comments.unshift(action.payload);
    },
    commentClosed(state, action: PayloadAction<string>) {
      const comment = state.comments.find((c) => c.id === action.payload);
      if (comment) comment.status = "Closed";
    },

    /** FR-REV-08 */
    flagRaised(state, action: PayloadAction<ReviewFlag>) {
      state.flags.unshift(action.payload);
    },
    flagWithdrawn(state, action: PayloadAction<string>) {
      state.flags = state.flags.filter((f) => f.id !== action.payload);
    },
  },
});

export const {
  acknowledged,
  pageRead,
  opened,
  annotationAdded,
  annotationRemoved,
  commentRaised,
  commentClosed,
  flagRaised,
  flagWithdrawn,
} = reviewSlice.actions;

export default reviewSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectReading = (s: RootState) => s.review.reading;
export const selectAnnotations = (s: RootState) => s.review.annotations;
export const selectComments = (s: RootState) => s.review.comments;
export const selectFlags = (s: RootState) => s.review.flags;
export const selectOpenDocumentId = (s: RootState) => s.review.openDocumentId;

/** FR-REV-07 — released to this reader and not yet acknowledged, soonest first. */
export const selectToRead = createSelector([selectReading], (items) =>
  [...items]
    .filter((item) => !item.acknowledgedAt)
    .sort((a, b) => a.meetingDate.localeCompare(b.meetingDate)),
);

export const selectAcknowledged = createSelector([selectReading], (items) =>
  items.filter((item) => item.acknowledgedAt),
);

/** Every pack the reader can reach, newest sitting first. */
export interface ReaderPack {
  packId: string;
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  items: ReadingItem[];
}

export const selectReaderPacks = createSelector([selectReading], (items) => {
  const packs: ReaderPack[] = [];
  for (const item of items) {
    const pack = packs.find((p) => p.packId === item.packId);
    if (pack) pack.items.push(item);
    else
      packs.push({
        packId: item.packId,
        meetingId: item.meetingId,
        meetingTitle: item.meetingTitle,
        meetingDate: item.meetingDate,
        items: [item],
      });
  }
  return packs.sort((a, b) => b.meetingDate.localeCompare(a.meetingDate));
});

/** The pack for the next sitting — what "Current Pack" opens. */
export const selectCurrentPack = createSelector([selectReaderPacks], (packs) => {
  const upcoming = [...packs].sort((a, b) =>
    a.meetingDate.localeCompare(b.meetingDate),
  );
  return upcoming.find((p) => p.items.some((i) => !i.acknowledgedAt)) ?? packs[0] ?? null;
});

/** FR-REV-06 — papers this reader annotated whose version has been replaced. */
export interface SupersededReading {
  item: ReadingItem;
  annotations: Annotation[];
}

export const selectSuperseded = createSelector(
  [selectReading, selectAnnotations],
  (items, annotations) =>
    items
      .filter((item) => item.supersededByVersionId)
      .map((item) => ({
        item,
        annotations: annotations.filter((a) => a.versionId === item.versionId),
      })),
);

export const selectOpenFlags = createSelector([selectFlags], (flags) =>
  flags.filter((f) => f.status !== "Resolved"),
);

export const selectOpenComments = createSelector([selectComments], (comments) =>
  comments.filter((c) => c.status !== "Closed"),
);
