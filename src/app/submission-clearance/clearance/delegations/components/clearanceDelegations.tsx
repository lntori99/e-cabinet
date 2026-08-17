"use client";

import { FiArrowRight, FiXCircle } from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectClearanceDelegations,
  selectSubmissions,
} from "@/core/slices/submissions-slice";
import { revokeClearanceDelegation } from "@/core/thunks-submissions";

const TONE = {
  Active: "blue",
  Expired: "neutral",
  Revoked: "neutral",
} as const;

export default function ClearanceDelegations() {
  const dispatch = useAppDispatch();
  const delegations = useAppSelector(selectClearanceDelegations);
  const submissions = useAppSelector(selectSubmissions);

  const active = delegations.filter((d) => d.status === "Active");
  const closed = delegations.filter((d) => d.status !== "Active");

  /** Decisions already taken by a delegate, which is what makes it auditable. */
  function decisionsUnder(delegate: string) {
    return submissions.reduce(
      (count, submission) =>
        count + submission.comments.filter((c) => c.by === delegate && c.decision).length,
      0,
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">In force</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {active.length} clearance role{active.length === 1 ? "" : "s"} delegated
          </p>
        </div>

        {active.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Every clearance role is being exercised by its own holder.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Stage</Th>
                <Th>Delegation</Th>
                <Th>Period</Th>
                <Th align="right">Decisions taken</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {active.map((delegation) => (
                <tr
                  key={delegation.id}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  <Td>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {delegation.stage}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {delegation.id} · {delegation.fromRole}
                    </span>
                  </Td>
                  <Td>
                    <span className="flex flex-wrap items-center gap-2">
                      {delegation.fromPerson}
                      <FiArrowRight
                        size={13}
                        className="text-neutral-400"
                        aria-hidden="true"
                      />
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {delegation.toPerson}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {delegation.reason} · approved by {delegation.approvedBy}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono whitespace-nowrap">
                      {delegation.startsAt} → {delegation.endsAt}
                    </span>
                  </Td>
                  <Td align="right">
                    <span className="font-mono">
                      {decisionsUnder(delegation.toPerson)}
                    </span>
                  </Td>
                  <Td align="right">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          revokeClearanceDelegation(
                            delegation.id,
                            `${delegation.stage}: ${delegation.fromPerson} → ${delegation.toPerson}`,
                          ),
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                    >
                      <FiXCircle size={14} aria-hidden="true" />
                      Revoke
                    </button>
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
                <Th>Stage</Th>
                <Th>Delegation</Th>
                <Th>Period</Th>
                <Th>Outcome</Th>
              </tr>
            </thead>
            <tbody>
              {closed.map((delegation) => (
                <tr key={delegation.id}>
                  <Td>
                    {delegation.stage}
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {delegation.id}
                    </span>
                  </Td>
                  <Td>
                    <span className="flex flex-wrap items-center gap-2">
                      {delegation.fromPerson}
                      <FiArrowRight
                        size={13}
                        className="text-neutral-400"
                        aria-hidden="true"
                      />
                      {delegation.toPerson}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono whitespace-nowrap">
                      {delegation.startsAt} → {delegation.endsAt}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge tone={TONE[delegation.status]}>
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
