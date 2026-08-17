"use client";

import { useState } from "react";
import {
  FiAlertTriangle,
  FiClock,
  FiKey,
  FiSearch,
  FiSlash,
  FiSmartphone,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";
import { LuUserSearch } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { controlCls } from "@/common/field";
import { DetailRow } from "@/common/table";
import { distance, hoursUntil, stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectDeactivations,
  selectSessions,
  selectTokens,
} from "@/core/slices/identity-slice";
import { selectUsers } from "@/core/slices/users-slice";
import { deactivateAccount, setAccountStatus } from "@/core/thunks-identity";
import { ROLE_GROUPS, mfaPolicy, rolePermissions } from "@/data/identityAccess";
import type {
  AccessSession,
  CabinetUser,
  DeactivationRequest,
  Fido2Token,
} from "@/models/response/base-response";
import { SESSION_TONE, USER_STATUS_TONE } from "../../components/iamStatus";

const STATUS_FILTERS = ["All", "Active", "Suspended", "Deactivated"] as const;

export default function UserDirectory({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const sessions = useAppSelector(selectSessions);
  const tokens = useAppSelector(selectTokens);
  const deactivations = useAppSelector(selectDeactivations);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [role, setRole] = useState("All");
  const [selectedId, setSelectedId] = useState(users[0]?.id ?? "");

  const needle = query.trim().toLowerCase();
  const visible = users.filter((user) => {
    if (status !== "All" && user.status !== status) return false;
    if (role !== "All" && user.role !== role) return false;
    if (!needle) return true;
    return [user.name, user.id, user.ministry, user.role].some((field) =>
      field.toLowerCase().includes(needle),
    );
  });

  const selected = users.find((u) => u.id === selectedId) ?? null;
  const pending = selected
    ? deactivations.find(
        (d) => d.userId === selected.id && d.status === "Awaiting action",
      )
    : undefined;

  function deactivate(user: CabinetUser) {
    dispatch(
      deactivateAccount({
        userId: user.id,
        name: user.name,
        requestId: pending?.id,
        reason: pending?.reason,
      }),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <FiSearch
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
            size={15}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search the directory"
            placeholder="Search by name, reference or ministry"
            className={`${controlCls} pl-9`}
          />
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          aria-label="Filter by role group"
          className={`${controlCls} sm:w-64`}
        >
          <option value="All">All role groups</option>
          {ROLE_GROUPS.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatus(filter)}
              aria-pressed={status === filter}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                status === filter
                  ? "border-state-600 bg-state-600 text-white"
                  : "border-neutral-300 text-neutral-600 hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            {visible.length} of {users.length} accounts
          </p>

          <ul className="space-y-2">
            {visible.map((user) => {
              const active = user.id === selectedId;
              const queued = deactivations.some(
                (d) => d.userId === user.id && d.status === "Awaiting action",
              );
              return (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(user.id)}
                    aria-current={active ? "true" : undefined}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      active
                        ? "border-state-500 bg-state-50 dark:border-state-700 dark:bg-state-900/20"
                        : "border-neutral-200 bg-white hover:border-state-300 dark:border-neutral-800 dark:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {user.id}
                      </span>
                      <StatusBadge tone={USER_STATUS_TONE[user.status]}>
                        {user.status}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">
                      {user.name}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {user.role} · {user.ministry}
                    </p>
                    {queued && (
                      <p
                        className="mt-1.5 inline-flex items-center gap-1.5 text-[11px]"
                        style={{ color: "var(--viz-critical)" }}
                      >
                        <FiClock size={11} aria-hidden="true" /> Deactivation raised
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {visible.length === 0 && (
            <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              No account matches this filter.
            </p>
          )}
        </div>

        <div className="min-w-0">
          {!selected ? (
            <EmptyState
              icon={LuUserSearch}
              title="No account selected"
              description="Choose a person from the directory to see what they hold and what closing their account would cut."
            />
          ) : (
            <UserDetail
              user={selected}
              now={now}
              pending={pending}
              sessions={sessions.filter((s) => s.userId === selected.id)}
              tokens={tokens.filter((t) => t.holderId === selected.id)}
              onDeactivate={() => deactivate(selected)}
              onSuspend={() =>
                dispatch(
                  setAccountStatus({
                    userId: selected.id,
                    name: selected.name,
                    status: "Suspended",
                  }),
                )
              }
              onRestore={() =>
                dispatch(
                  setAccountStatus({
                    userId: selected.id,
                    name: selected.name,
                    status: "Active",
                  }),
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function UserDetail({
  user,
  now,
  pending,
  sessions,
  tokens,
  onDeactivate,
  onSuspend,
  onRestore,
}: {
  user: CabinetUser;
  now: string;
  pending?: DeactivationRequest;
  sessions: AccessSession[];
  tokens: Fido2Token[];
  onDeactivate: () => void;
  onSuspend: () => void;
  onRestore: () => void;
}) {
  const permissions = rolePermissions(user.role);
  const policy = mfaPolicy(user.role);
  const live = sessions.filter((s) => s.status !== "Revoked");
  const overdue = pending ? hoursUntil(pending.dueBy, now) < 0 : false;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {user.id} · {user.role}
          </p>
          <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {user.name}
          </h2>
        </div>
        <StatusBadge tone={USER_STATUS_TONE[user.status]}>{user.status}</StatusBadge>
      </header>

      {pending && (
        <p
          className="mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{
            borderColor: overdue ? "var(--viz-critical)" : "var(--viz-warning)",
            color: overdue ? "var(--viz-critical)" : "inherit",
          }}
        >
          <FiAlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            <span className="font-medium">
              {pending.reason} — deactivation raised by {pending.raisedBy}.
            </span>{" "}
            <span className="text-neutral-600 dark:text-neutral-300">
              Due {stamp(pending.dueBy)} ({distance(hoursUntil(pending.dueBy, now))}).
              FR-IAM-13 allows one working hour.
            </span>
          </span>
        </p>
      )}

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div className="space-y-0.5">
          <DetailRow label="Ministry" value={user.ministry} />
          <DetailRow label="Second factor" value={user.mfa} />
          <DetailRow
            label="Policy for this role"
            value={`${policy.factors.join(" or ")} · ${policy.enforcement}`}
          />
          <DetailRow label="Issued device" value={user.device} />
          <DetailRow label="Last seen" value={stamp(user.lastSeen)} />
          <DetailRow
            label="Classification ceiling"
            value={permissions.classificationCeiling}
          />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              Live sessions
            </h3>
            {live.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                No open session.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {live.map((session) => (
                  <li
                    key={session.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 text-neutral-700 dark:text-neutral-300">
                      {session.device}
                      <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                        {session.location} · {session.ip}
                      </span>
                    </span>
                    <StatusBadge tone={SESSION_TONE[session.status]}>
                      {session.status}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              Registered tokens
            </h3>
            {tokens.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                No FIDO2 token registered.
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {tokens.map((token) => (
                  <li
                    key={token.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="inline-flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                      <FiKey size={13} className="text-neutral-400" aria-hidden="true" />
                      {token.serial}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {token.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        {user.status !== "Deactivated" ? (
          <>
            <button
              type="button"
              onClick={onDeactivate}
              className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-4 py-2 text-sm font-semibold text-seal-500 transition hover:bg-seal-500 hover:text-white"
            >
              <FiUserX size={15} aria-hidden="true" />
              Deactivate now
            </button>
            {user.status === "Active" && (
              <button
                type="button"
                onClick={onSuspend}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                <FiSlash size={15} aria-hidden="true" />
                Suspend
              </button>
            )}
            {user.status === "Suspended" && (
              <button
                type="button"
                onClick={onRestore}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                <FiUserCheck size={15} aria-hidden="true" />
                Restore access
              </button>
            )}
          </>
        ) : (
          <p className="inline-flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <FiSmartphone size={15} aria-hidden="true" />
            The account is closed. Sessions, tokens and pending entitlements were
            revoked with it.
          </p>
        )}
      </div>

      <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
        Deactivating cuts every active session and cached token immediately
        (FR-IAM-14), and writes the change to the audit log.
      </p>
    </div>
  );
}
