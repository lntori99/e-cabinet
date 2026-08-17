/**
 * Pack assembly, freeze, release and version control — FR-PCK-01 … FR-PCK-18.
 *
 * These are the operations that decide whether two people in the same room are
 * reading the same document, so every one of them writes to the audit log as it
 * changes state. Timestamps and version identifiers are produced here, keeping
 * the reducers pure.
 */
import { OPERATOR } from "@/core/app-constants";
import type { AppThunk } from "@/core/store";
import { logged } from "@/core/slices/audit-slice";
import { packFrozen } from "@/core/slices/meetings-slice";
import {
  acknowledgementUpdated,
  frozen,
  overrideRecorded,
  recalled,
  released,
  replaced,
  stagingUpdated,
} from "@/core/slices/packs-slice";
import type {
  Pack,
  PackAcknowledgement,
  PreStagingTarget,
} from "@/models/response/base-response";

const actor = { actor: OPERATOR.name, role: OPERATOR.role, ip: OPERATOR.ip };
const by = `${OPERATOR.name} (${OPERATOR.shortRole})`;
const now = () => new Date().toISOString().slice(0, 16);

/** FR-PCK-04 — freezing also moves the sitting's own status, in one action. */
export const freezePack =
  (pack: Pack): AppThunk =>
  (dispatch) => {
    const at = now();
    dispatch(frozen({ packId: pack.id, by, at }));
    dispatch(packFrozen({ meetingId: pack.meetingId, frozenBy: by, at, by }));
    dispatch(
      logged({
        ...actor,
        action: `Pack frozen at ${pack.items.length} items — no further change without a replacement version`,
        target: `${pack.id} (${pack.currentVersionId})`,
        severity: "warning",
      }),
    );
  };

/** FR-PCK-09 / 11 — released to the meeting's authorised participants only. */
export const releasePack =
  (pack: Pack, participants: { id: string; name: string; ministry: string }[]): AppThunk =>
  (dispatch) => {
    const at = now();
    const acknowledgements: PackAcknowledgement[] = participants.map((p) => ({
      participantId: p.id,
      name: p.name,
      ministry: p.ministry,
      versionId: pack.currentVersionId,
    }));

    dispatch(released({ packId: pack.id, by, at, acknowledgements }));
    dispatch(
      logged({
        ...actor,
        action: `Pack released to ${participants.length} authorised participants${
          pack.partialReleases.length > 0
            ? `; ${pack.partialReleases.length} partial copies omit a closed item`
            : ""
        }`,
        target: `${pack.id} (${pack.currentVersionId})`,
        severity: "info",
      }),
    );
  };

/** FR-PCK-17 — a failed readiness check may only be passed on the record. */
export const recordOverride =
  (request: {
    packId: string;
    reference: string;
    reason: string;
    failuresAccepted: string[];
  }): AppThunk =>
  (dispatch) => {
    dispatch(
      overrideRecorded({
        packId: request.packId,
        override: {
          by,
          reference: request.reference,
          reason: request.reason,
          at: now(),
          failuresAccepted: request.failuresAccepted,
        },
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Readiness override recorded on ${request.reference} — ${request.failuresAccepted.length} failed check(s) accepted`,
        target: request.packId,
        severity: "critical",
      }),
    );
  };

/** FR-PCK-05 / 06 / 07 */
export const replacePack =
  (request: { packId: string; reason: string; authorisedBy: string }): AppThunk =>
  (dispatch) => {
    dispatch(
      replaced({
        packId: request.packId,
        authorisedBy: request.authorisedBy,
        reason: request.reason,
        at: now(),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Replacement version created, authorised by ${request.authorisedBy} — ${request.reason}`,
        target: request.packId,
        severity: "warning",
      }),
    );
  };

/** FR-PCK-08 — moving a participant onto the current version. */
export const notifyHolder =
  (request: {
    packId: string;
    participantId: string;
    name: string;
    versionId: string;
  }): AppThunk =>
  (dispatch) => {
    const at = now();
    dispatch(
      acknowledgementUpdated({
        packId: request.packId,
        participantId: request.participantId,
        versionId: request.versionId,
        receivedAt: at,
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Replacement version served to a holder of a superseded pack`,
        target: `${request.packId} — ${request.name}`,
        severity: "warning",
      }),
    );
  };

/** FR-PCK-18 */
export const recallPack =
  (request: { packId: string; reason: string; holders: number }): AppThunk =>
  (dispatch) => {
    dispatch(
      recalled({ packId: request.packId, by, reason: request.reason, at: now() }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Pack recalled — access revoked for ${request.holders} participants. ${request.reason}`,
        target: request.packId,
        severity: "critical",
      }),
    );
  };

/** FR-PCK-15 */
export const updateStaging =
  (request: {
    packId: string;
    targetId: string;
    location: string;
    status: PreStagingTarget["status"];
  }): AppThunk =>
  (dispatch) => {
    dispatch(
      stagingUpdated({
        packId: request.packId,
        targetId: request.targetId,
        status: request.status,
        at: now(),
      }),
    );
    dispatch(
      logged({
        ...actor,
        action: `Pre-staging ${request.status.toLowerCase()} — ${request.location}`,
        target: request.packId,
        severity: request.status === "Failed" ? "warning" : "info",
      }),
    );
  };
