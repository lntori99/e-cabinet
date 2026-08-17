import { createSlice, createSelector, type PayloadAction } from "@reduxjs/toolkit";
import { seedDocuments } from "@/data/ecabinet";
import type { CabinetDocument, DocumentStatus } from "@/models/response/base-response";
import type { SearchDocumentsRequest } from "@/models/request/document-request";
import type { RootState } from "@/core/store";

/** The clearance workflow, in order. Papers advance one step at a time. */
export const DOC_FLOW: DocumentStatus[] = [
  "Submitted",
  "Policy Review",
  "Legal Clearance",
  "Approved",
  "Circulated",
];

interface DocumentsState {
  items: CabinetDocument[];
  search: SearchDocumentsRequest;
  /** Paper open in the detail modal. */
  selectedId: string | null;
}

const initialState: DocumentsState = {
  items: seedDocuments,
  search: { query: "" },
  selectedId: null,
};

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    advanced(
      state,
      action: PayloadAction<{ documentId: string; toStatus: DocumentStatus }>,
    ) {
      const doc = state.items.find((d) => d.id === action.payload.documentId);
      if (doc) doc.status = action.payload.toStatus;
    },
    searchChanged(state, action: PayloadAction<SearchDocumentsRequest>) {
      state.search = action.payload;
    },
    selected(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
  },
});

export const { advanced, searchChanged, selected } = documentsSlice.actions;
export default documentsSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectDocuments = (s: RootState) => s.documents.items;
export const selectDocumentSearch = (s: RootState) => s.documents.search;

export const selectSelectedDocument = createSelector(
  [selectDocuments, (s: RootState) => s.documents.selectedId],
  (documents, id) => documents.find((d) => d.id === id) ?? null,
);

export const selectFilteredDocuments = createSelector(
  [selectDocuments, selectDocumentSearch],
  (documents, search) => {
    const q = search.query?.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.ministry.toLowerCase().includes(q),
    );
  },
);

export const selectPendingClearance = createSelector([selectDocuments], (documents) =>
  documents.filter(
    (d) => d.status === "Policy Review" || d.status === "Legal Clearance",
  ),
);

/** The next step in the workflow, or null if the paper is at the end of it. */
export function nextStatus(status: DocumentStatus): DocumentStatus | null {
  const idx = DOC_FLOW.indexOf(status);
  if (idx < 0 || idx === DOC_FLOW.length - 1) return null;
  return DOC_FLOW[idx + 1];
}
