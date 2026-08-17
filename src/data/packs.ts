import type { Pack } from "@/models/response/base-response";

/**
 * FR PCK seed state.
 *
 * The failure this whole set exists to prevent is two participants in the same
 * sitting reading different versions of the same paper. The seed is therefore
 * built around that case: the 13th Sitting's pack was replaced after release,
 * and one participant is still holding the superseded version.
 */

/** FR-PCK-14 — the ceiling a released pack must open within (NFR-PER-02). */
export const OPEN_THRESHOLD_SECONDS = 3;

/** Where packs are pre-staged before a sitting (FR-PCK-15). */
export const STAGING_LOCATIONS = [
  { id: "LOC-CAB", location: "Cabinet Room, Capital Hill", kind: "Cabinet room" as const },
  { id: "LOC-CMB", location: "Committee Room B, Capital Hill", kind: "Committee room" as const },
  { id: "LOC-IMG", location: "IMAGO endpoint — Cabinet Room", kind: "IMAGO endpoint" as const },
  { id: "LOC-BTR", location: "Blantyre secure store", kind: "Secure store" as const },
];

export const seedPacks: Pack[] = [
  {
    id: "PCK-2026-014-A",
    meetingId: "MTG-2026-014",
    title: "14th Ordinary Cabinet Sitting — meeting pack",
    kind: "Primary",
    state: "Frozen",
    classification: "TOP SECRET — CABINET",
    freezeCutOff: "2026-08-15T12:00",
    frozenAt: "2026-08-13T16:42",
    frozenBy: "Larry (Secretariat)",
    currentVersionId: "PCK-2026-014-A-v1",
    items: [
      { agendaItemId: "AG-1", order: 1, section: "Preliminaries", title: "Confirmation of the 13th Sitting minutes", ministry: "Office of the President & Cabinet", papers: [{ id: "DOC-0330", title: "Minutes of the 13th Ordinary Sitting", classification: "SECRET", pages: 9, versionId: "DOC-0330-v1" }], closedSession: false, closedParticipantIds: [], clearanceComplete: true, unresolvedComments: 0 },
      { agendaItemId: "AG-2", order: 2, section: "Policy", title: "National Fibre Backbone Phase III Financing", ministry: "Finance & Economic Affairs", papers: [{ id: "DOC-0341", title: "Phase III financing options", classification: "TOP SECRET — CABINET", pages: 12, versionId: "DOC-0341-v2" }, { id: "DOC-0341-A", title: "Annex A — Cost model", classification: "SECRET", pages: 6, versionId: "DOC-0341-A-v2" }], closedSession: false, closedParticipantIds: [], clearanceComplete: false, unresolvedComments: 0 },
      { agendaItemId: "AG-3", order: 3, section: "Legislation", title: "Data Protection (Amendment) Bill, 2026", ministry: "Justice", papers: [{ id: "DOC-0344", title: "Draft Bill", classification: "SECRET", pages: 18, versionId: "DOC-0344-v1" }], closedSession: false, closedParticipantIds: [], clearanceComplete: false, unresolvedComments: 1 },
      { agendaItemId: "AG-4", order: 4, section: "Policy", title: "District Hospital Equipment Procurement", ministry: "Health", papers: [{ id: "DOC-0347", title: "Procurement plan", classification: "SECRET", pages: 10, versionId: "DOC-0347-v1" }], closedSession: false, closedParticipantIds: [], clearanceComplete: true, unresolvedComments: 0 },
      { agendaItemId: "AG-5", order: 5, section: "Reports", title: "Regional Diplomatic Positions — SADC Summit", ministry: "Foreign Affairs", papers: [], closedSession: true, closedParticipantIds: ["P-014-1", "P-014-3", "P-014-5", "P-014-6"], clearanceComplete: false, unresolvedComments: 0 },
      { agendaItemId: "AG-6", order: 6, section: "Any Other Business", title: "Teacher Deployment Framework Review", ministry: "Education", papers: [], closedSession: false, closedParticipantIds: [], clearanceComplete: false, unresolvedComments: 0 },
    ],
    versions: [
      { version: 1, versionId: "PCK-2026-014-A-v1", createdAt: "2026-08-13T16:42" },
    ],
    acknowledgements: [],
    preStaging: [
      { id: "LOC-CAB", location: "Cabinet Room, Capital Hill", kind: "Cabinet room", status: "Staged", stagedAt: "2026-08-14T06:10" },
      { id: "LOC-IMG", location: "IMAGO endpoint — Cabinet Room", kind: "IMAGO endpoint", status: "Staging", note: "72% transferred" },
      { id: "LOC-BTR", location: "Blantyre secure store", kind: "Secure store", status: "Failed", note: "Link to the DR site dropped at 04:12; retry queued" },
    ],
    partialReleases: [
      { participantId: "P-014-2", name: "Hon. Minister of Health", omittedItemTitles: ["Regional Diplomatic Positions — SADC Summit"] },
      { participantId: "P-014-4", name: "Hon. Minister of Education", omittedItemTitles: ["Regional Diplomatic Positions — SADC Summit"] },
      { participantId: "P-014-7", name: "Director of Budget", omittedItemTitles: ["Regional Diplomatic Positions — SADC Summit"] },
    ],
    originalMb: 48.2,
    optimisedMb: 12.6,
    openSeconds: 2.4,
  },

  {
    id: "PCK-2026-013-A",
    meetingId: "MTG-2026-013",
    title: "13th Ordinary Cabinet Sitting — meeting pack",
    kind: "Primary",
    state: "Released",
    classification: "TOP SECRET — CABINET",
    freezeCutOff: "2026-07-31T12:00",
    frozenAt: "2026-07-31T15:10",
    frozenBy: "Larry (Secretariat)",
    releasedAt: "2026-08-01T09:00",
    releasedBy: "Larry (Secretariat)",
    currentVersionId: "PCK-2026-013-A-v2",
    items: [
      { agendaItemId: "AG-9", order: 1, section: "Reports", title: "e-Cabinet Rollout Phase 4 Progress", ministry: "Information & Communications Technology", papers: [{ id: "DOC-0333", title: "Rollout progress", classification: "RESTRICTED", pages: 7, versionId: "DOC-0333-v1" }], closedSession: false, closedParticipantIds: [], clearanceComplete: true, unresolvedComments: 0 },
      { agendaItemId: "AG-10", order: 2, section: "Reports", title: "Blantyre DR Environment Commissioning", ministry: "Information & Communications Technology", papers: [{ id: "DOC-0335", title: "DR commissioning", classification: "SECRET", pages: 11, versionId: "DOC-0335-v2" }], closedSession: false, closedParticipantIds: [], clearanceComplete: true, unresolvedComments: 0 },
      { agendaItemId: "AG-11", order: 3, section: "Any Other Business", title: "Teacher Deployment Framework Review", ministry: "Education", papers: [], closedSession: false, closedParticipantIds: [], clearanceComplete: true, unresolvedComments: 0 },
    ],
    versions: [
      {
        version: 1,
        versionId: "PCK-2026-013-A-v1",
        createdAt: "2026-07-31T15:10",
        supersededAt: "2026-08-02T11:20",
        supersededByVersionId: "PCK-2026-013-A-v2",
      },
      {
        version: 2,
        versionId: "PCK-2026-013-A-v2",
        createdAt: "2026-08-02T11:20",
        authorisedBy: "Secretary to Cabinet",
        reason:
          "DOC-0335 annex cited section 41 of the Communications Act where section 42 was intended. The pack was replaced rather than corrected in place.",
      },
    ],
    acknowledgements: [
      { participantId: "P-013-1", name: "Hon. Minister of Finance", ministry: "Finance & Economic Affairs", receivedAt: "2026-08-02T11:24", readAt: "2026-08-02T14:05", versionId: "PCK-2026-013-A-v2" },
      { participantId: "P-013-2", name: "Chief Secretary", ministry: "Office of the President & Cabinet", receivedAt: "2026-08-01T09:04", readAt: "2026-08-01T09:40", versionId: "PCK-2026-013-A-v1" },
      { participantId: "P-013-3", name: "Hon. Minister of Health", ministry: "Health", receivedAt: "2026-08-02T11:24", readAt: "2026-08-03T07:12", versionId: "PCK-2026-013-A-v2" },
      { participantId: "P-013-4", name: "Hon. Minister of Justice", ministry: "Justice", receivedAt: "2026-08-02T11:25", versionId: "PCK-2026-013-A-v2" },
      { participantId: "P-013-5", name: "Secretary to Cabinet", ministry: "Office of the President & Cabinet", receivedAt: "2026-08-02T11:22", readAt: "2026-08-02T11:31", versionId: "PCK-2026-013-A-v2" },
      { participantId: "P-013-6", name: "Hon. Minister of Education", ministry: "Education", versionId: "PCK-2026-013-A-v2" },
    ],
    preStaging: [
      { id: "LOC-CAB", location: "Cabinet Room, Capital Hill", kind: "Cabinet room", status: "Staged", stagedAt: "2026-08-03T18:00" },
      { id: "LOC-IMG", location: "IMAGO endpoint — Cabinet Room", kind: "IMAGO endpoint", status: "Staged", stagedAt: "2026-08-03T18:04" },
    ],
    partialReleases: [],
    originalMb: 31.4,
    optimisedMb: 8.9,
    openSeconds: 1.8,
  },

  {
    id: "PCK-2026-013-S1",
    meetingId: "MTG-2026-013",
    title: "13th Ordinary Sitting — supplementary pack 1",
    kind: "Supplementary",
    primaryPackId: "PCK-2026-013-A",
    state: "Recalled",
    classification: "SECRET",
    freezeCutOff: "2026-08-03T09:00",
    frozenAt: "2026-08-03T09:10",
    frozenBy: "Larry (Secretariat)",
    releasedAt: "2026-08-03T09:30",
    releasedBy: "Larry (Secretariat)",
    recalledAt: "2026-08-03T12:15",
    recalledBy: "Larry (Secretariat)",
    recallReason:
      "The wrong annex was attached to the supplementary — an internal working draft of the DR commissioning report was circulated in place of the cleared version. Access was revoked within four minutes of the error being reported.",
    currentVersionId: "PCK-2026-013-S1-v1",
    items: [
      { agendaItemId: "AG-10", order: 1, section: "Reports", title: "Blantyre DR Environment Commissioning — supplementary annex", ministry: "Information & Communications Technology", papers: [{ id: "DOC-0335-B", title: "Annex B — Commissioning test results", classification: "SECRET", pages: 4, versionId: "DOC-0335-B-v1" }], closedSession: false, closedParticipantIds: [], clearanceComplete: true, unresolvedComments: 0 },
    ],
    versions: [{ version: 1, versionId: "PCK-2026-013-S1-v1", createdAt: "2026-08-03T09:10" }],
    acknowledgements: [
      { participantId: "P-013-1", name: "Hon. Minister of Finance", ministry: "Finance & Economic Affairs", receivedAt: "2026-08-03T09:33", versionId: "PCK-2026-013-S1-v1" },
      { participantId: "P-013-2", name: "Chief Secretary", ministry: "Office of the President & Cabinet", receivedAt: "2026-08-03T09:31", readAt: "2026-08-03T09:52", versionId: "PCK-2026-013-S1-v1" },
    ],
    preStaging: [],
    partialReleases: [],
    originalMb: 4.2,
    optimisedMb: 1.1,
    openSeconds: 0.9,
  },

  {
    id: "PCK-2026-013-S2",
    meetingId: "MTG-2026-013",
    title: "13th Ordinary Sitting — supplementary pack 2",
    kind: "Supplementary",
    primaryPackId: "PCK-2026-013-A",
    state: "Released",
    classification: "SECRET",
    freezeCutOff: "2026-08-03T13:00",
    frozenAt: "2026-08-03T13:05",
    frozenBy: "Larry (Secretariat)",
    releasedAt: "2026-08-03T13:20",
    releasedBy: "Larry (Secretariat)",
    currentVersionId: "PCK-2026-013-S2-v1",
    items: [
      { agendaItemId: "AG-10", order: 1, section: "Reports", title: "Blantyre DR Environment Commissioning — supplementary annex", ministry: "Information & Communications Technology", papers: [{ id: "DOC-0335-B", title: "Annex B — Commissioning test results (cleared)", classification: "SECRET", pages: 4, versionId: "DOC-0335-B-v2" }], closedSession: false, closedParticipantIds: [], clearanceComplete: true, unresolvedComments: 0 },
    ],
    versions: [{ version: 1, versionId: "PCK-2026-013-S2-v1", createdAt: "2026-08-03T13:05" }],
    acknowledgements: [
      { participantId: "P-013-1", name: "Hon. Minister of Finance", ministry: "Finance & Economic Affairs", receivedAt: "2026-08-03T13:22", readAt: "2026-08-03T15:10", versionId: "PCK-2026-013-S2-v1" },
      { participantId: "P-013-2", name: "Chief Secretary", ministry: "Office of the President & Cabinet", receivedAt: "2026-08-03T13:21", readAt: "2026-08-03T13:44", versionId: "PCK-2026-013-S2-v1" },
    ],
    preStaging: [],
    partialReleases: [],
    originalMb: 4.2,
    optimisedMb: 1.2,
    openSeconds: 0.9,
  },

  {
    id: "PCK-2026-015-A",
    meetingId: "MTG-2026-015",
    title: "Economic Affairs Committee — meeting pack",
    kind: "Primary",
    state: "In assembly",
    classification: "SECRET",
    freezeCutOff: "2026-08-19T12:00",
    currentVersionId: "PCK-2026-015-A-v1",
    items: [
      { agendaItemId: "AG-7", order: 1, section: "Reports", title: "Mid-Year Budget Performance Review", ministry: "Finance & Economic Affairs", papers: [{ id: "DOC-0352", title: "Mid-year review", classification: "SECRET", pages: 22, versionId: "DOC-0352-v1" }], closedSession: false, closedParticipantIds: [], clearanceComplete: false, unresolvedComments: 0 },
      { agendaItemId: "AG-8", order: 2, section: "Policy", title: "Agricultural Input Programme Costing", ministry: "Agriculture", papers: [], closedSession: false, closedParticipantIds: [], clearanceComplete: false, unresolvedComments: 0 },
    ],
    versions: [{ version: 1, versionId: "PCK-2026-015-A-v1", createdAt: "2026-08-13T10:00" }],
    acknowledgements: [],
    preStaging: [],
    partialReleases: [],
    originalMb: 18.6,
    optimisedMb: 0,
    openSeconds: 0,
  },

  {
    id: "PCK-2026-016-A",
    meetingId: "MTG-2026-016",
    title: "Presidency Security Briefing — meeting pack",
    kind: "Primary",
    state: "In assembly",
    classification: "TOP SECRET — CABINET",
    freezeCutOff: "2026-08-23T12:00",
    currentVersionId: "PCK-2026-016-A-v1",
    items: [],
    versions: [{ version: 1, versionId: "PCK-2026-016-A-v1", createdAt: "2026-08-08T14:30" }],
    acknowledgements: [],
    preStaging: [],
    partialReleases: [],
    originalMb: 0,
    optimisedMb: 0,
    openSeconds: 0,
  },
];
