/**
 * FR-SCH — search and retrieval.
 *
 * The archive does not hold its own copy of the papers, decisions and actions.
 * It composes them from the apps that own them, adds the material that exists
 * only in the archive (the years before this console, the OCR results), and
 * applies the entitlement filter before anything is counted. What the slice
 * owns outright is the two things search itself produces: saved searches and
 * the query log.
 */
import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  PAPER_BODIES,
  VIEWER_ENTITLEMENTS,
  seedHistoricalActions,
  seedHistoricalDecisions,
  seedHistoricalPapers,
  seedIndexSegments,
  seedQueryLog,
  seedSavedSearches,
} from "@/data/archive";
import type {
  ArchiveRecord,
  QueryLogEntry,
  SavedSearch,
} from "@/models/response/base-response";
import { selectDocuments } from "@/core/slices/documents-slice";
import {
  selectActionRecords,
  selectDecisionRecords,
} from "@/core/slices/decision-slice";
import type { RootState } from "@/core/store";

interface SearchState {
  saved: SavedSearch[];
  log: QueryLogEntry[];
}

const initialState: SearchState = {
  saved: seedSavedSearches,
  log: seedQueryLog,
};

const slice = createSlice({
  name: "search",
  initialState,
  reducers: {
    /** FR-SCH-06 — newest first, because that is how the log is read. */
    queryLogged(state, action: PayloadAction<QueryLogEntry>) {
      state.log.unshift(action.payload);
    },
    /** FR-SCH-07 */
    searchSaved(state, action: PayloadAction<SavedSearch>) {
      state.saved.unshift(action.payload);
    },
    searchDeleted(state, action: PayloadAction<string>) {
      state.saved = state.saved.filter((s) => s.id !== action.payload);
    },
    searchRan(
      state,
      action: PayloadAction<{ id: string; at: string; resultCount: number }>,
    ) {
      const saved = state.saved.find((s) => s.id === action.payload.id);
      if (!saved) return;
      saved.lastRunAt = action.payload.at;
      saved.lastResultCount = action.payload.resultCount;
    },
  },
});

export const { queryLogged, searchDeleted, searchRan, searchSaved } = slice.actions;
export default slice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectSavedSearches = (s: RootState) => s.search.saved;
export const selectQueryLog = (s: RootState) => s.search.log;
export const selectIndexSegments = () => seedIndexSegments;

/**
 * The whole corpus, before entitlement. Nothing in the interface reads this —
 * it exists so the filter below has something to filter.
 */
const selectRawArchive = createSelector(
  [selectDocuments, selectDecisionRecords, selectActionRecords],
  (documents, decisions, actions): ArchiveRecord[] => {
    const papers: ArchiveRecord[] = documents.map((doc) => ({
      id: doc.id,
      kind: "Paper",
      title: doc.title,
      body: PAPER_BODIES[doc.id] ?? doc.title,
      ministry: doc.ministry,
      meetingId: doc.meetingId,
      date: doc.versions.at(-1)?.uploadedAt.slice(0, 10) ?? "",
      classification: doc.classification,
      status: doc.status,
      // A paper reaches Cabinet, the Secretariat and its own ministry. The
      // repository holds this as an ACL; here it is derived from the record.
      entitledTo: ["Cabinet Members", "Secretariat", `Ministry of ${doc.ministry}`],
      pages: doc.pages,
    }));

    const decided: ArchiveRecord[] = decisions
      .filter((d) => d.state === "Finalised")
      .map((d) => ({
        id: d.id,
        kind: "Decision",
        title: d.agendaItemTitle,
        body: d.text,
        ministry: d.ministries[0] ?? "Office of the President & Cabinet",
        meetingId: d.meetingId,
        meetingTitle: d.meetingTitle,
        date: d.meetingDate,
        classification: d.classification,
        status: `Finalised · ${d.outcome}`,
        entitledTo: ["Cabinet Members", "Secretariat", ...d.ministries],
      }));

    const done: ArchiveRecord[] = actions
      .filter((a) => a.state === "Closed")
      .map((a) => ({
        id: a.id,
        kind: "Action",
        title: a.description,
        body: `${a.instructions} ${a.evidence ? `Closed on evidence ${a.evidence.reference} — ${a.evidence.description}` : ""}`.trim(),
        ministry: a.ministry,
        meetingId: a.meetingId,
        date: a.closedAt?.slice(0, 10) ?? a.deadline,
        classification: "CONFIDENTIAL",
        status: "Closed",
        entitledTo: ["Cabinet Members", "Secretariat", a.ministry],
      }));

    return [
      ...papers,
      ...decided,
      ...done,
      ...seedHistoricalPapers,
      ...seedHistoricalDecisions,
      ...seedHistoricalActions,
    ].sort((a, b) => b.date.localeCompare(a.date));
  },
);

/**
 * FR-SCH-02 — the entitlement filter, and the only door into the archive. It
 * runs before counting, before faceting and before the by-year chart, so a
 * record the viewer may not see contributes nothing anywhere: not a title, not
 * a row, not a number, not a bar one pixel taller than it should be.
 */
export const selectArchive = createSelector([selectRawArchive], (records) =>
  records.filter((record) =>
    record.entitledTo.some((party) => VIEWER_ENTITLEMENTS.includes(party)),
  ),
);

export const selectArchiveKind = (kind: ArchiveRecord["kind"]) =>
  createSelector([selectArchive], (records) => records.filter((r) => r.kind === kind));

/** FR-SCH-09 — what came in as a scan rather than as text. */
export const selectScannedRecords = createSelector([selectArchive], (records) =>
  records.filter((r) => r.ocr),
);
