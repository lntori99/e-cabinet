"use client";

import { FiKey, FiLink2, FiShield, FiSlash, FiCheck } from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectAuthorisations, selectVideoSessions } from "@/core/slices/video-slice";
import { decideAuthorisation } from "@/core/thunks-video";
import { AUTHORISATION_TONE, MODE_COLOR } from "../../components/videoStatus";

export default function AuthorisationBoard() {
  const dispatch = useAppDispatch();
  const authorisations = useAppSelector(selectAuthorisations);
  const sessions = useAppSelector(selectVideoSessions);

  const withSession = sessions
    .map((session) => ({
      session,
      list: authorisations.filter((a) => a.sessionId === session.id),
    }))
    .filter((group) => group.list.length > 0);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
            <FiLink2 size={16} className="text-neutral-400" aria-hidden="true" />
            A link is not a key
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-VID-02 — the join checks a named Government-approved account against
            this meeting&apos;s list. A forwarded invitation reaches the waiting
            room and goes no further.
          </p>
        </article>

        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
            <FiKey size={16} className="text-neutral-400" aria-hidden="true" />
            Factors for privileged and remote
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-VID-03 — anyone joining from outside the room, and anyone holding a
            privileged role, presents a second factor first.
          </p>
        </article>

        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
            <FiShield size={16} className="text-neutral-400" aria-hidden="true" />
            A seat is not an entitlement
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-VID-04 — participation confers no document permission. What anyone in
            the session can open is decided by their entitlements, and joining
            changes nothing about them.
          </p>
        </article>
      </section>

      {withSession.map(({ session, list }) => (
        <section key={session.id} className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
                {session.meetingTitle}
              </h2>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {session.id} · {session.meetingId}
              </p>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {list.filter((a) => a.state === "Authorised").length} authorised of{" "}
              {list.length}
            </p>
          </div>

          <Table>
            <thead>
              <tr>
                <Th>Participant</Th>
                <Th>Joining</Th>
                <Th>Second factor</Th>
                <Th>State</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((authorisation) => (
                <tr
                  key={authorisation.id}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  <Td>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {authorisation.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {authorisation.role}
                    </span>
                    {authorisation.scopeNote && (
                      <span className="mt-1 block text-xs text-neutral-600 dark:text-neutral-300">
                        {authorisation.scopeNote}
                      </span>
                    )}
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: MODE_COLOR[authorisation.mode] }}
                        aria-hidden="true"
                      />
                      {authorisation.mode}
                    </span>
                  </Td>
                  <Td>
                    {authorisation.mfaRequired ? (
                      <span
                        className="inline-flex items-center gap-1.5 whitespace-nowrap"
                        style={{ color: "var(--viz-good)" }}
                      >
                        <FiKey size={12} aria-hidden="true" />
                        {authorisation.mfaMethod ?? "Required"}
                      </span>
                    ) : (
                      <span className="text-neutral-500 dark:text-neutral-400">
                        In the room — not required
                      </span>
                    )}
                  </Td>
                  <Td>
                    <StatusBadge tone={AUTHORISATION_TONE[authorisation.state]}>
                      {authorisation.state}
                    </StatusBadge>
                    {authorisation.approvedBy && (
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        {authorisation.approvedBy}
                      </span>
                    )}
                  </Td>
                  <Td align="right">
                    {authorisation.state === "Authorised" ? (
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(decideAuthorisation(authorisation, "Revoked"))
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                      >
                        <FiSlash size={14} aria-hidden="true" />
                        Revoke
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(decideAuthorisation(authorisation, "Authorised"))
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-state-600 px-3 py-1.5 text-sm font-medium text-state-700 transition hover:bg-state-600 hover:text-white dark:text-state-400"
                      >
                        <FiCheck size={14} aria-hidden="true" />
                        Authorise
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      ))}
    </div>
  );
}
