/**
 * FR-SCH — search and retrieval.
 *
 * FR-SCH-06 requires the query itself to reach the audit log, with the user and
 * the result count. That is done here rather than in the component so a query
 * cannot be run down one path that logs and another that does not.
 */
import { OPERATOR } from "@/core/app-constants";
import { logged } from "@/core/slices/audit-slice";
import {
  queryLogged,
  searchDeleted,
  searchRan,
  searchSaved,
} from "@/core/slices/search-slice";
import type { SearchFilters } from "@/models/response/base-response";
import type { AppThunk } from "@/core/store";
import { SEARCH_THRESHOLD_MS } from "@/data/archive";

const actor = { actor: OPERATOR.name, role: OPERATOR.role, ip: OPERATOR.ip };
const now = () => new Date().toISOString().slice(0, 16);
const rid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

/** FR-SCH-06, FR-SCH-08 */
export const logQuery =
  (
    query: string,
    filterSummary: string,
    resultCount: number,
    elapsedMs: number,
  ): AppThunk =>
  (dispatch) => {
    const at = now();
    dispatch(
      queryLogged({
        id: rid("QL"),
        at,
        actor: OPERATOR.name,
        role: OPERATOR.role,
        query,
        filterSummary,
        resultCount,
        elapsedMs,
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: "Archive search",
        target: `“${query || "(no term)"}” · ${filterSummary} · ${resultCount} results · ${elapsedMs} ms`,
        // A query that misses the threshold is worth finding in the log later.
        severity: elapsedMs > SEARCH_THRESHOLD_MS ? "warning" : "info",
      }),
    );
  };

/** FR-SCH-07 */
export const saveSearch =
  (
    name: string,
    query: string,
    filters: SearchFilters,
    resultCount: number,
  ): AppThunk =>
  (dispatch) => {
    const at = now();
    dispatch(
      searchSaved({
        id: rid("SS"),
        name,
        owner: OPERATOR.name,
        role: OPERATOR.role,
        query,
        filters,
        createdAt: at,
        lastRunAt: at,
        lastResultCount: resultCount,
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: "Saved search created",
        target: `${name} · ${query || "(no term)"}`,
        severity: "info",
      }),
    );
  };

export const removeSavedSearch =
  (id: string, name: string): AppThunk =>
  (dispatch) => {
    dispatch(searchDeleted(id));
    dispatch(
      logged({
        ...actor,
        action: "Saved search deleted",
        target: `${id} · ${name}`,
        severity: "info",
      }),
    );
  };

/** Re-running a saved view is a query like any other, so it logs like one. */
export const runSavedSearch =
  (
    id: string,
    name: string,
    query: string,
    filterSummary: string,
    resultCount: number,
    elapsedMs: number,
  ): AppThunk =>
  (dispatch) => {
    dispatch(searchRan({ id, at: now(), resultCount }));
    dispatch(logQuery(query, `${name} · ${filterSummary}`, resultCount, elapsedMs));
  };
