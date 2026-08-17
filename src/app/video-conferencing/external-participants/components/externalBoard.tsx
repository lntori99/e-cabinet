"use client";

import { FiCheck, FiClock, FiCrosshair, FiUserCheck, FiX } from "react-icons/fi";
import { LuUserRoundX } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { DetailRow } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectAuthorisations, selectVideoSessions } from "@/core/slices/video-slice";
import { decideAuthorisation } from "@/core/thunks-video";
import { AUTHORISATION_TONE } from "../../components/videoStatus";

/** The three tests an external join has to pass, in order. */
const TESTS = [
  {
    label: "Pre-approved",
    detail: "A named officer authorises the person before the invitation exists",
    icon: FiUserCheck,
  },
  {
    label: "Identity verified",
    detail: "Checked against the counterparty's own directory, not asserted by them",
    icon: FiCheck,
  },
  {
    label: "Scoped",
    detail: "Admitted for one meeting or one agenda item, and removed afterwards",
    icon: FiCrosshair,
  },
] as const;

export default function ExternalBoard() {
  const dispatch = useAppDispatch();
  const authorisations = useAppSelector(selectAuthorisations);
  const sessions = useAppSelector(selectVideoSessions);

  const externals = authorisations.filter((a) => a.mode === "External");
  const pending = externals.filter((a) => a.state === "Awaiting approval");
  const settled = externals.filter((a) => a.state !== "Awaiting approval");

  return (
    <div className="space-y-8">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-warning)" }}
      >
        <FiClock
          size={18}
          className="mt-0.5 shrink-0"
          style={{ color: "var(--viz-warning)" }}
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            Release 2 — the control is defined, not yet open
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            External participation is not enabled in this release. The register and
            the approval path exist so the control can be exercised before it is.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {TESTS.map((test, index) => (
          <article
            key={test.label}
            className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-state-600/10 font-mono text-[10px] font-semibold text-state-700 dark:bg-state-900/40 dark:text-state-400">
                {index + 1}
              </span>
              {test.label}
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {test.detail}
            </p>
          </article>
        ))}
      </section>

      {externals.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={LuUserRoundX}
            title="No external participation"
            description="Nobody outside Government has been proposed for a Cabinet session."
          />
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-bold">Awaiting approval</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {pending.length} request{pending.length === 1 ? "" : "s"}
              </p>
            </div>

            {pending.length === 0 ? (
              <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                Nothing is waiting on a decision.
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {pending.map((authorisation) => {
                  const session = sessions.find((s) => s.id === authorisation.sessionId);
                  return (
                    <article
                      key={authorisation.id}
                      className="rounded-lg border bg-white p-5 dark:bg-neutral-900"
                      style={{ borderColor: "var(--viz-warning)" }}
                    >
                      <header className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                            {authorisation.id} · {authorisation.meetingId}
                          </p>
                          <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                            {authorisation.name}
                          </h3>
                        </div>
                        <StatusBadge tone="amber">Awaiting approval</StatusBadge>
                      </header>

                      <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                        {authorisation.scopeNote ?? "No scope has been stated."}
                      </p>

                      <div className="mt-3 space-y-0.5">
                        <DetailRow label="Session" value={session?.meetingTitle ?? "—"} />
                        <DetailRow label="Role" value={authorisation.role} />
                        <DetailRow
                          label="Identity"
                          value={
                            authorisation.identityVerified
                              ? "Verified"
                              : "Not yet verified"
                          }
                        />
                        <DetailRow
                          label="Second factor"
                          value={authorisation.mfaRequired ? "Required" : "Not required"}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(decideAuthorisation(authorisation, "Authorised", true))
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700"
                        >
                          <FiCheck size={15} aria-hidden="true" />
                          Verify and authorise
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(decideAuthorisation(authorisation, "Declined"))
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
                        >
                          <FiX size={15} aria-hidden="true" />
                          Decline
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="font-bold">On the record</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {settled.map((authorisation) => {
                const session = sessions.find((s) => s.id === authorisation.sessionId);
                return (
                  <article
                    key={authorisation.id}
                    className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <header className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                          {authorisation.id} · {session?.meetingTitle}
                        </p>
                        <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                          {authorisation.name}
                        </h3>
                      </div>
                      <StatusBadge tone={AUTHORISATION_TONE[authorisation.state]}>
                        {authorisation.state}
                      </StatusBadge>
                    </header>

                    <div className="mt-3 space-y-0.5">
                      <DetailRow label="Approved by" value={authorisation.approvedBy ?? "—"} />
                      <DetailRow
                        label="Identity"
                        value={authorisation.identityVerified ? "Verified" : "Not verified"}
                      />
                      <DetailRow label="Scope" value={authorisation.scopeNote ?? "—"} />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
