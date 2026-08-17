import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { seedPacks } from "@/data/packs";
import type {
  Pack,
  PackAcknowledgement,
  PackOverride,
  PreStagingTarget,
} from "@/models/response/base-response";
import type { RootState } from "@/core/store";

interface PacksState {
  items: Pack[];
}

const initialState: PacksState = { items: seedPacks };

const find = (state: PacksState, id: string) => state.items.find((p) => p.id === id);

const packsSlice = createSlice({
  name: "packs",
  initialState,
  reducers: {
    /** FR-PCK-04 — the cut-off closes the pack. Nothing inside it moves after this. */
    frozen(state, action: PayloadAction<{ packId: string; by: string; at: string }>) {
      const pack = find(state, action.payload.packId);
      if (!pack || pack.state !== "In assembly") return;
      pack.state = "Frozen";
      pack.frozenAt = action.payload.at;
      pack.frozenBy = action.payload.by;
    },

    /** FR-PCK-09 — release to the meeting's authorised participants only. */
    released(
      state,
      action: PayloadAction<{
        packId: string;
        by: string;
        at: string;
        acknowledgements: PackAcknowledgement[];
      }>,
    ) {
      const pack = find(state, action.payload.packId);
      if (!pack || pack.state !== "Frozen") return;
      pack.state = "Released";
      pack.releasedAt = action.payload.at;
      pack.releasedBy = action.payload.by;
      pack.acknowledgements = action.payload.acknowledgements;
    },

    /** FR-PCK-17 — the override is recorded before the release, never after. */
    overrideRecorded(
      state,
      action: PayloadAction<{ packId: string; override: PackOverride }>,
    ) {
      const pack = find(state, action.payload.packId);
      if (pack) pack.override = action.payload.override;
    },

    /**
     * FR-PCK-05 / 06 — there is no edit path. A change to a frozen pack creates
     * a replacement version, carrying the authorising officer and the reason,
     * and marks the version it replaces as superseded (FR-PCK-07).
     */
    replaced(
      state,
      action: PayloadAction<{
        packId: string;
        authorisedBy: string;
        reason: string;
        at: string;
      }>,
    ) {
      const pack = find(state, action.payload.packId);
      if (!pack) return;

      const previous = pack.versions.find((v) => v.versionId === pack.currentVersionId);
      const version = pack.versions.length + 1;
      const versionId = `${pack.id}-v${version}`;

      if (previous) {
        previous.supersededAt = action.payload.at;
        previous.supersededByVersionId = versionId;
      }

      pack.versions.push({
        version,
        versionId,
        createdAt: action.payload.at,
        authorisedBy: action.payload.authorisedBy,
        reason: action.payload.reason,
      });
      pack.currentVersionId = versionId;
      // Participants keep the version they were served until they take the new
      // one — which is exactly what FR-PCK-08 has to be able to show.
    },

    /** FR-PCK-08 — a participant moves to the replacement. */
    acknowledgementUpdated(
      state,
      action: PayloadAction<{
        packId: string;
        participantId: string;
        versionId?: string;
        receivedAt?: string;
        readAt?: string;
      }>,
    ) {
      const pack = find(state, action.payload.packId);
      const ack = pack?.acknowledgements.find(
        (a) => a.participantId === action.payload.participantId,
      );
      if (!ack) return;
      if (action.payload.versionId) ack.versionId = action.payload.versionId;
      if (action.payload.receivedAt) ack.receivedAt = action.payload.receivedAt;
      if (action.payload.readAt) ack.readAt = action.payload.readAt;
    },

    /** FR-PCK-18 — recall revokes access at once and keeps the reason. */
    recalled(
      state,
      action: PayloadAction<{
        packId: string;
        by: string;
        reason: string;
        at: string;
      }>,
    ) {
      const pack = find(state, action.payload.packId);
      if (!pack) return;
      pack.state = "Recalled";
      pack.recalledAt = action.payload.at;
      pack.recalledBy = action.payload.by;
      pack.recallReason = action.payload.reason;
    },

    /** FR-PCK-15 */
    stagingUpdated(
      state,
      action: PayloadAction<{
        packId: string;
        targetId: string;
        status: PreStagingTarget["status"];
        at: string;
      }>,
    ) {
      const pack = find(state, action.payload.packId);
      const target = pack?.preStaging.find((t) => t.id === action.payload.targetId);
      if (!target) return;
      target.status = action.payload.status;
      target.stagedAt = action.payload.status === "Staged" ? action.payload.at : undefined;
      target.note = action.payload.status === "Staged" ? undefined : target.note;
    },
  },
});

export const {
  frozen,
  released,
  overrideRecorded,
  replaced,
  acknowledgementUpdated,
  recalled,
  stagingUpdated,
} = packsSlice.actions;

export default packsSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

export const selectPacks = (s: RootState) => s.packs.items;

export const selectPacksByState = (state: Pack["state"]) =>
  createSelector([selectPacks], (packs) => packs.filter((p) => p.state === state));

export const selectPrimaryPacks = createSelector([selectPacks], (packs) =>
  packs.filter((p) => p.kind === "Primary"),
);

export const selectSupplementaryPacks = createSelector([selectPacks], (packs) =>
  packs.filter((p) => p.kind !== "Primary"),
);

export const selectReleasedPacks = createSelector([selectPacks], (packs) =>
  packs.filter((p) => p.state === "Released"),
);

/** FR-PCK-08 — released packs where someone is still on an older version. */
export interface VersionGap {
  pack: Pack;
  holders: PackAcknowledgement[];
}

export const selectVersionGaps = createSelector([selectPacks], (packs) => {
  const gaps: VersionGap[] = [];
  for (const pack of packs) {
    if (pack.state !== "Released") continue;
    const holders = pack.acknowledgements.filter(
      (a) => a.versionId !== pack.currentVersionId,
    );
    if (holders.length > 0) gaps.push({ pack, holders });
  }
  return gaps;
});

/** FR-PCK-10 — who has not acknowledged a released pack. */
export const selectAcknowledgementGaps = createSelector([selectPacks], (packs) =>
  packs
    .filter((p) => p.state === "Released")
    .flatMap((pack) =>
      pack.acknowledgements
        .filter((a) => !a.readAt)
        .map((ack) => ({ pack, ack })),
    ),
);

export const selectPreStaging = createSelector([selectPacks], (packs) =>
  packs.flatMap((pack) => pack.preStaging.map((target) => ({ pack, target }))),
);
