import { createSlice, createSelector, type PayloadAction } from "@reduxjs/toolkit";
import { seedAuditLog } from "@/data/ecabinet";
import { OPERATOR, PAGE_SIZE, TIME_SOURCE } from "@/core/app-constants";
import type { AuditEvent } from "@/models/response/base-response";
import type { AuditQueryRequest } from "@/models/request/audit-request";
import type { RootState } from "@/core/store";

interface AuditState {
  entries: AuditEvent[];
  query: AuditQueryRequest;
}

const initialState: AuditState = {
  entries: seedAuditLog,
  query: { severity: "all", page: 1, pageSize: PAGE_SIZE },
};

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    /**
     * Append to the protected log. The timestamp comes from `prepare` so the
     * reducer stays pure; the sequential ID is derived from state, which keeps
     * the AUD-0001 numbering the register has always used.
     */
    logged: {
      reducer(state, action: PayloadAction<Omit<AuditEvent, "id">>) {
        state.entries.unshift({
          ...action.payload,
          id: `AUD-${String(state.entries.length + 1).padStart(4, "0")}`,
        });
      },
      prepare(event: Omit<AuditEvent, "id" | "timestamp">) {
        // FR-AUD-02 — the four fields a call site is not asked to supply are
        // filled here rather than left blank, so an event cannot be written
        // without a device, an outcome or a named clock.
        return {
          payload: {
            device: OPERATOR.device,
            outcome: "Success" as const,
            timeSource: TIME_SOURCE,
            ...event,
            timestamp: new Date().toISOString(),
          },
        };
      },
    },
    queryChanged(state, action: PayloadAction<Partial<AuditQueryRequest>>) {
      // Any change to the filter returns to the first page.
      state.query = { ...state.query, page: 1, ...action.payload };
    },
    pageChanged(state, action: PayloadAction<number>) {
      state.query.page = action.payload;
    },
  },
});

export const { logged, queryChanged, pageChanged } = auditSlice.actions;
export default auditSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectAuditEntries = (s: RootState) => s.audit.entries;
export const selectAuditQuery = (s: RootState) => s.audit.query;

export const selectFilteredAudit = createSelector(
  [selectAuditEntries, selectAuditQuery],
  (entries, query) =>
    query.severity === "all"
      ? entries
      : entries.filter((e) => e.severity === query.severity),
);

export const selectCriticalCount = createSelector(
  [selectAuditEntries],
  (entries) => entries.filter((e) => e.severity === "critical").length,
);
