"use client";

import { FiArrowRight, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { LuUsers } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { Table, Td, Th } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectDelegations } from "@/core/slices/identity-slice";
import { selectUsers } from "@/core/slices/users-slice";
import { approveDelegation, revokeDelegation } from "@/core/thunks-identity";
import { DELEGATION_TONE, userName } from "../../components/iamStatus";

export default function DelegationBoard() {
  const dispatch = useAppDispatch();
  const delegations = useAppSelector(selectDelegations);
  const users = useAppSelector(selectUsers);

  const open = delegations.filter(
    (d) => d.status === "Active" || d.status === "Pending approval",
  );
  const closed = delegations.filter(
    (d) => d.status === "Expired" || d.status === "Revoked",
  );

  function summarise(id: string) {
    const delegation = delegations.find((d) => d.id === id);
    if (!delegation) return id;
    return `${userName(users, delegation.fromUserId)} → ${userName(users, delegation.toUserId)}`;
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Open delegations</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {open.length} in force or awaiting approval
          </p>
        </div>

        {open.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              icon={LuUsers}
              title="No access is delegated"
              description="No Cabinet member has lent their access. A delegation appears here from the moment it is requested, and again on both users' audit records."
            />
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Delegation</Th>
                <Th>Scope</Th>
                <Th>Period</Th>
                <Th align="right">Uses</Th>
                <Th>Status</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {open.map((delegation) => (
                <tr
                  key={delegation.id}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  <Td>
                    <span className="flex flex-wrap items-center gap-2 font-medium text-neutral-900 dark:text-neutral-100">
                      {userName(users, delegation.fromUserId)}
                      <FiArrowRight
                        size={13}
                        className="text-neutral-400"
                        aria-hidden="true"
                      />
                      {userName(users, delegation.toUserId)}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {delegation.id} · approved by {delegation.approvedBy}
                    </span>
                  </Td>
                  <Td>{delegation.scope}</Td>
                  <Td>
                    <span className="font-mono whitespace-nowrap">
                      {delegation.startsAt} → {delegation.endsAt}
                    </span>
                  </Td>
                  <Td align="right">
                    <span className="font-mono">{delegation.useCount}</span>
                  </Td>
                  <Td>
                    <StatusBadge tone={DELEGATION_TONE[delegation.status]}>
                      {delegation.status}
                    </StatusBadge>
                  </Td>
                  <Td align="right">
                    {delegation.status === "Pending approval" ? (
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            approveDelegation(delegation.id, summarise(delegation.id)),
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-state-600 px-3 py-1.5 text-sm font-medium text-state-700 transition hover:bg-state-600 hover:text-white dark:text-state-400"
                      >
                        <FiCheckCircle size={14} aria-hidden="true" />
                        Approve
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            revokeDelegation(delegation.id, summarise(delegation.id)),
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                      >
                        <FiXCircle size={14} aria-hidden="true" />
                        Revoke
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Closed</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {closed.length} expired or revoked
          </p>
        </div>

        {closed.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Nothing has lapsed yet.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Delegation</Th>
                <Th>Scope</Th>
                <Th>Period</Th>
                <Th align="right">Uses</Th>
                <Th>Outcome</Th>
              </tr>
            </thead>
            <tbody>
              {closed.map((delegation) => (
                <tr key={delegation.id}>
                  <Td>
                    <span className="flex flex-wrap items-center gap-2">
                      {userName(users, delegation.fromUserId)}
                      <FiArrowRight
                        size={13}
                        className="text-neutral-400"
                        aria-hidden="true"
                      />
                      {userName(users, delegation.toUserId)}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {delegation.id}
                    </span>
                  </Td>
                  <Td>{delegation.scope}</Td>
                  <Td>
                    <span className="font-mono whitespace-nowrap">
                      {delegation.startsAt} → {delegation.endsAt}
                    </span>
                  </Td>
                  <Td align="right">
                    <span className="font-mono">{delegation.useCount}</span>
                  </Td>
                  <Td>
                    <StatusBadge tone={DELEGATION_TONE[delegation.status]}>
                      {delegation.status}
                    </StatusBadge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}
