"use client";

import { FiArrowUpCircle, FiMapPin, FiXCircle } from "react-icons/fi";
import { LuMonitorOff } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { Table, Td, Th } from "@/common/table";
import { distance, hoursUntil, stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectSessions } from "@/core/slices/identity-slice";
import { selectUsers } from "@/core/slices/users-slice";
import { revokeSession } from "@/core/thunks-identity";
import { SESSION_POLICIES } from "@/data/identityAccess";
import { SESSION_TONE, userById, userName } from "../../components/iamStatus";

export default function SessionBoard({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector(selectSessions);
  const users = useAppSelector(selectUsers);

  const live = sessions.filter((s) => s.status !== "Revoked");
  const revoked = sessions.filter((s) => s.status === "Revoked");
  const elevated = live.filter((s) => s.elevated);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            ["Live sessions", live.length, "Holding a token right now"],
            ["Elevated", elevated.length, "Raised for a privileged action"],
            ["Revoked today", revoked.length, "Cut by an administrator or on deactivation"],
          ] as const
        ).map(([label, value, hint]) => (
          <div
            key={label}
            className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {value}
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="font-bold">Live sessions</h2>

        {live.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              icon={LuMonitorOff}
              title="Nobody is signed in"
              description="No session on this deployment currently holds a token."
            />
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Where from</Th>
                <Th>Factor</Th>
                <Th>Expires</Th>
                <Th>State</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {live.map((session) => {
                const user = userById(users, session.userId);
                const left = hoursUntil(session.expiresAt, now);
                return (
                  <tr
                    key={session.id}
                    className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                  >
                    <Td>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {userName(users, session.userId)}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {session.id} · {user?.role ?? "Unknown role"}
                      </span>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5">
                        <FiMapPin size={12} className="text-neutral-400" aria-hidden="true" />
                        {session.location}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        {session.device} · {session.ip}
                      </span>
                    </Td>
                    <Td>
                      {session.mfaMethod}
                      {session.elevated && (
                        <span
                          className="mt-0.5 flex items-center gap-1.5 text-xs"
                          style={{ color: "var(--viz-warning)" }}
                        >
                          <FiArrowUpCircle size={11} aria-hidden="true" />
                          Elevated
                        </span>
                      )}
                    </Td>
                    <Td>
                      <span className="whitespace-nowrap">{distance(left)}</span>
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        Last seen {stamp(session.lastActivityAt)}
                      </span>
                    </Td>
                    <Td>
                      <StatusBadge tone={SESSION_TONE[session.status]}>
                        {session.status}
                      </StatusBadge>
                    </Td>
                    <Td align="right">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            revokeSession(session.id, userName(users, session.userId)),
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                      >
                        <FiXCircle size={14} aria-hidden="true" />
                        Revoke
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-bold">Timeout and concurrency policy</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-IAM-15 — configurable per role. Exceeding the concurrent limit ends
            the oldest session rather than refusing the new sign-in.
          </p>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Role group</Th>
              <Th align="right">Idle timeout</Th>
              <Th align="right">Concurrent sessions</Th>
              <Th>Re-authentication on elevation</Th>
            </tr>
          </thead>
          <tbody>
            {SESSION_POLICIES.map((policy) => (
              <tr key={policy.role}>
                <Td>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {policy.role}
                  </span>
                </Td>
                <Td align="right">
                  <span className="font-mono">{policy.timeoutMinutes} min</span>
                </Td>
                <Td align="right">
                  <span className="font-mono">{policy.concurrentSessions}</span>
                </Td>
                <Td>
                  {policy.reauthOnElevation ? (
                    <span style={{ color: "var(--viz-good)" }}>Required</span>
                  ) : (
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Not required
                    </span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      {revoked.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold">Revoked</h2>
          <Table>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Where from</Th>
                <Th>Started</Th>
                <Th>Last activity</Th>
              </tr>
            </thead>
            <tbody>
              {revoked.map((session) => (
                <tr key={session.id}>
                  <Td>
                    {userName(users, session.userId)}
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {session.id}
                    </span>
                  </Td>
                  <Td>
                    {session.location}
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {session.device} · {session.ip}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono">{stamp(session.startedAt)}</span>
                  </Td>
                  <Td>
                    <span className="font-mono">{stamp(session.lastActivityAt)}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      )}
    </div>
  );
}
