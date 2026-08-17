import type { AuditEvent } from "@/models/response/base-response";
import type { PaginatedRequest } from "./base-request";

export type AuditSeverityFilter = AuditEvent["severity"] | "all";

/** GET /audit — severity-filtered, paginated read of the immutable log. */
export interface AuditQueryRequest extends PaginatedRequest {
  severity: AuditSeverityFilter;
  actor?: string;
  target?: string;
  /** ISO datetime bounds, inclusive. */
  from?: string;
  to?: string;
}
