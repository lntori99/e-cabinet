"use client";

import { useState } from "react";
import {
  FiBellOff,
  FiCheckCircle,
  FiFilm,
  FiServer,
  FiUnlock,
  FiXCircle,
} from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { distance, hoursUntil, stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectBreakGlass } from "@/core/slices/identity-slice";
import { declineBreakGlass, revokeBreakGlass } from "@/core/thunks-identity";
import { seedAdminAccounts, seedBastionSessions } from "@/data/identityAccess";
import type { BreakGlassGrant } from "@/models/response/base-response";
import { GRANT_TONE } from "../../components/iamStatus";
import BreakGlassModal from "./breakGlassModal";

function GrantCard({
  grant,
  now,
  onApprove,
  onDecline,
  onRevoke,
}: {
  grant: BreakGlassGrant;
  now: string;
  onApprove: () => void;
  onDecline: () => void;
  onRevoke: () => void;
}) {
  const pending = grant.status === "Pending approval";
  const active = grant.status === "Active";
  const left = grant.expiresAt ? hoursUntil(grant.expiresAt, now) : 0;

  return (
    <article
      className="rounded-lg border bg-white p-5 dark:bg-neutral-900"
      style={{
        borderColor: active
          ? "var(--viz-critical)"
          : pending
            ? "var(--viz-warning)"
            : undefined,
      }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {grant.id} · {grant.adminAccount}
          </p>
          <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
            {grant.requestedBy}
          </h3>
        </div>
        <StatusBadge tone={GRANT_TONE[grant.status]}>{grant.status}</StatusBadge>
      </header>

      <p className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
        {grant.reason}
      </p>

      <div className="mt-3 space-y-0.5">
        <DetailRow label="Scope" value={grant.scope} />
        <DetailRow label="Requested" value={stamp(grant.requestedAt)} />
        {grant.approvedBy && (
          <DetailRow
            label="Client approval"
            value={`${grant.approvedBy}${grant.approvalReference ? ` · ${grant.approvalReference}` : ""}`}
          />
        )}
        {grant.grantedAt && <DetailRow label="Granted" value={stamp(grant.grantedAt)} />}
        {grant.expiresAt && (
          <DetailRow
            label={active ? "Expires" : "Expired"}
            value={`${stamp(grant.expiresAt)} · ${distance(left)}`}
          />
        )}
        <DetailRow
          label="Security owner"
          value={
            grant.securityOwnerAlerted ? (
              <span
                className="inline-flex items-center gap-1.5"
                style={{ color: "var(--viz-good)" }}
              >
                <FiCheckCircle size={12} aria-hidden="true" /> Alerted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                <FiBellOff size={12} aria-hidden="true" /> Alerted on grant
              </span>
            )
          }
        />
      </div>

      {(pending || active) && (
        <div className="mt-4 flex flex-wrap gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          {pending && (
            <>
              <button
                type="button"
                onClick={onApprove}
                className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700"
              >
                <FiUnlock size={15} aria-hidden="true" />
                Grant access
              </button>
              <button
                type="button"
                onClick={onDecline}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                <FiXCircle size={15} aria-hidden="true" />
                Decline
              </button>
            </>
          )}
          {active && (
            <button
              type="button"
              onClick={onRevoke}
              className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-4 py-2 text-sm font-semibold text-seal-500 transition hover:bg-seal-500 hover:text-white"
            >
              <FiXCircle size={15} aria-hidden="true" />
              Revoke before expiry
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default function PrivilegedBoard({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const grants = useAppSelector(selectBreakGlass);
  const [approving, setApproving] = useState<BreakGlassGrant | null>(null);

  const open = grants.filter(
    (g) => g.status === "Pending approval" || g.status === "Active",
  );
  const closed = grants.filter(
    (g) => g.status !== "Pending approval" && g.status !== "Active",
  );

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Break-glass</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {open.length} open · {closed.length} closed
          </p>
        </div>

        {open.length === 0 ? (
          <p className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
            <FiCheckCircle
              size={15}
              style={{ color: "var(--viz-good)" }}
              aria-hidden="true"
            />
            No administrator currently holds access to document content.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {open.map((grant) => (
              <GrantCard
                key={grant.id}
                grant={grant}
                now={now}
                onApprove={() => setApproving(grant)}
                onDecline={() =>
                  dispatch(declineBreakGlass(grant.id, grant.adminAccount))
                }
                onRevoke={() => dispatch(revokeBreakGlass(grant.id, grant.adminAccount))}
              />
            ))}
          </div>
        )}

        {closed.length > 0 && (
          <details className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            <summary className="cursor-pointer text-sm font-medium text-neutral-600 marker:text-neutral-400 hover:text-state-700 dark:text-neutral-300 dark:hover:text-state-400">
              Closed grants ({closed.length})
            </summary>
            <div className="mt-4">
              <Table>
                <thead>
                  <tr>
                    <Th>Grant</Th>
                    <Th>Account</Th>
                    <Th>Scope</Th>
                    <Th>Approval</Th>
                    <Th>Outcome</Th>
                  </tr>
                </thead>
                <tbody>
                  {closed.map((grant) => (
                    <tr key={grant.id}>
                      <Td>
                        <span className="font-mono">{grant.id}</span>
                        <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                          {stamp(grant.requestedAt)}
                        </span>
                      </Td>
                      <Td>{grant.adminAccount}</Td>
                      <Td>{grant.scope}</Td>
                      <Td>{grant.approvalReference ?? "—"}</Td>
                      <Td>
                        <StatusBadge tone={GRANT_TONE[grant.status]}>
                          {grant.status}
                        </StatusBadge>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </details>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <div>
            <h2 className="font-bold">Administrative accounts</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              FR-IAM-12 — privileged work is done from a separate account, reached
              through the bastion with multi-factor authentication. Nobody
              administers the platform from their own identity.
            </p>
          </div>

          <Table>
            <thead>
              <tr>
                <Th>Account</Th>
                <Th>Person</Th>
                <Th>Scope</Th>
                <Th>Last used</Th>
              </tr>
            </thead>
            <tbody>
              {seedAdminAccounts.map((account) => (
                <tr key={account.id}>
                  <Td>
                    <span className="inline-flex items-center gap-2 font-mono">
                      <FiServer size={13} className="text-neutral-400" aria-hidden="true" />
                      {account.account}
                    </span>
                    {account.bastionOnly && (
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        Bastion only
                      </span>
                    )}
                  </Td>
                  <Td>{account.person}</Td>
                  <Td>{account.scope}</Td>
                  <Td>
                    <span className="font-mono">{stamp(account.lastUsed)}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="space-y-3">
          <div>
            <h2 className="font-bold">Bastion session records</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Every privileged session is recorded in full and retained with the
              audit record.
            </p>
          </div>

          <Table>
            <thead>
              <tr>
                <Th>Session</Th>
                <Th>Host</Th>
                <Th align="right">Duration</Th>
                <Th>Recording</Th>
              </tr>
            </thead>
            <tbody>
              {seedBastionSessions.map((session) => (
                <tr key={session.id}>
                  <Td>
                    <span className="font-mono">{session.id}</span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {session.adminAccount} · {stamp(session.startedAt)}
                    </span>
                  </Td>
                  <Td>{session.host}</Td>
                  <Td align="right">
                    <span className="font-mono">{session.durationMinutes} min</span>
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-2">
                      <FiFilm size={13} className="text-neutral-400" aria-hidden="true" />
                      {session.recordingRef}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </section>

      {approving && (
        <BreakGlassModal grant={approving} onClose={() => setApproving(null)} />
      )}
    </div>
  );
}
