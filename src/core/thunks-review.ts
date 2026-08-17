/**
 * Review, annotation and acknowledgement — FR-REV-01 … FR-REV-11.
 *
 * Note the asymmetry in what is logged. An acknowledgement, a formal comment
 * and a flag are acts with consequences for other people, so they are written
 * to the audit log. A private note is not: FR-REV-03 puts it beyond
 * administrative reach, and logging its existence would leak the very thing the
 * requirement protects.
 */
import { OPERATOR } from "@/core/app-constants";
import type { AppThunk } from "@/core/store";
import { logged } from "@/core/slices/audit-slice";
import {
  acknowledged,
  annotationAdded,
  annotationRemoved,
  commentClosed,
  commentRaised,
  flagRaised,
  flagWithdrawn,
} from "@/core/slices/review-slice";
import { READER } from "@/data/review";
import type {
  Annotation,
  AnnotationKind,
  ReadingItem,
  ReviewFlag,
} from "@/models/response/base-response";

const actor = { actor: READER.name, role: READER.role, ip: OPERATOR.ip };
const now = () => new Date().toISOString().slice(0, 16);
const rid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

/** FR-REV-07 */
export const acknowledgePaper =
  (item: ReadingItem): AppThunk =>
  (dispatch) => {
    const at = now();
    dispatch(acknowledged({ documentId: item.documentId, at }));
    dispatch(
      logged({
        ...actor,
        action: `Paper acknowledged as read (${item.versionId})`,
        target: `${item.documentId} — ${item.documentTitle}`,
        severity: "info",
      }),
    );
  };

/**
 * FR-REV-03 / 05 / 09 — private, encrypted at rest, bound to the version. No
 * audit entry: the note is not administratively visible, and a log line saying
 * one exists would defeat that.
 */
export const addAnnotation =
  (request: {
    item: ReadingItem;
    page: number;
    kind: AnnotationKind;
    body: string;
    anchorText?: string;
  }): AppThunk =>
  (dispatch) => {
    const annotation: Annotation = {
      id: rid("ANN"),
      readerId: READER.id,
      packId: request.item.packId,
      meetingId: request.item.meetingId,
      documentId: request.item.documentId,
      documentTitle: request.item.documentTitle,
      versionId: request.item.versionId,
      page: request.page,
      kind: request.kind,
      anchorText: request.anchorText,
      body: request.body,
      createdAt: now(),
    };
    dispatch(annotationAdded(annotation));
  };

export const removeAnnotation =
  (annotationId: string): AppThunk =>
  (dispatch) => {
    dispatch(annotationRemoved(annotationId));
  };

/** FR-REV-04 — visible to named recipients, so it is an act on the record. */
export const raiseComment =
  (request: {
    item: ReadingItem;
    body: string;
    recipients: string[];
    page?: number;
  }): AppThunk =>
  (dispatch) => {
    dispatch(
      commentRaised({
        id: rid("CMT"),
        readerId: READER.id,
        author: READER.name,
        packId: request.item.packId,
        meetingId: request.item.meetingId,
        documentId: request.item.documentId,
        documentTitle: request.item.documentTitle,
        page: request.page,
        body: request.body,
        recipients: request.recipients,
        at: now(),
        replies: [],
        status: "Open",
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Formal comment raised to ${request.recipients.join(", ")}`,
        target: `${request.item.documentId} — ${request.item.documentTitle}`,
        severity: "info",
      }),
    );
  };

export const closeComment =
  (commentId: string, title: string): AppThunk =>
  (dispatch) => {
    dispatch(commentClosed(commentId));
    dispatch(
      logged({
        ...actor,
        action: "Formal comment closed by its author",
        target: `${commentId} — ${title}`,
        severity: "info",
      }),
    );
  };

/** FR-REV-08 — surfaces on the Secretariat dashboard, so it is logged. */
export const raiseFlag =
  (request: {
    item: ReadingItem;
    kind: ReviewFlag["kind"];
    note: string;
  }): AppThunk =>
  (dispatch) => {
    dispatch(
      flagRaised({
        id: rid("FLG"),
        readerId: READER.id,
        raisedBy: READER.name,
        kind: request.kind,
        packId: request.item.packId,
        meetingId: request.item.meetingId,
        documentId: request.item.documentId,
        documentTitle: request.item.documentTitle,
        agendaItemTitle: request.item.agendaItemTitle,
        note: request.note,
        at: now(),
        status: "Open",
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Flagged as ${request.kind.toLowerCase()} — raised to the Secretariat`,
        target: `${request.item.documentId} — ${request.item.documentTitle}`,
        severity: "warning",
      }),
    );
  };

export const withdrawFlag =
  (flagId: string, title: string): AppThunk =>
  (dispatch) => {
    dispatch(flagWithdrawn(flagId));
    dispatch(
      logged({
        ...actor,
        action: "Flag withdrawn by the member who raised it",
        target: `${flagId} — ${title}`,
        severity: "info",
      }),
    );
  };
