import type { Classification } from "@/core/app-constants";
import type { DocumentStatus } from "@/models/response/base-response";

/** GET /documents — search the Cabinet paper register. */
export interface SearchDocumentsRequest {
  /** Matches title, paper ID or ministry. */
  query?: string;
  status?: DocumentStatus;
  ministry?: string;
  classification?: Classification;
}

/** PATCH /documents/{documentId}/status — advance the clearance workflow one step. */
export interface AdvanceDocumentRequest {
  documentId: string;
  /** Sent so the server can reject the change if the paper moved underneath us. */
  fromStatus: DocumentStatus;
  toStatus: DocumentStatus;
}
