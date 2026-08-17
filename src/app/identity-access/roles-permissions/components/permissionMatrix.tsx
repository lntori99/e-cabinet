"use client";

import { FiEyeOff, FiLock, FiServer, FiShield } from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { classificationTone } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectUsers } from "@/core/slices/users-slice";
import {
  AUTHORISATION_FACTORS,
  IAM_CAPABILITIES,
  ROLE_PERMISSIONS,
} from "@/data/identityAccess";
import { LEVEL_CELL, LEVEL_RANK } from "../../components/iamStatus";

export default function PermissionMatrix() {
  const users = useAppSelector(selectUsers);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h2 className="font-bold">Permission sets</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            What each role group may do in each functional area. The wash carries
            the level — None through Full is an order, so it reads as one scale
            rather than five separate colours.
          </p>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Role group</Th>
              {IAM_CAPABILITIES.map((capability) => (
                <Th key={capability}>{capability}</Th>
              ))}
              <Th align="right">Accounts</Th>
            </tr>
          </thead>
          <tbody>
            {ROLE_PERMISSIONS.map((set) => {
              const held = users.filter((u) => u.role === set.role).length;
              return (
                <tr key={set.role}>
                  <Td>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {set.role}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {set.summary}
                    </span>
                    <span
                      className={`stamp mt-1.5 ${classificationTone(set.classificationCeiling)}`}
                    >
                      <FiShield size={10} />
                      {set.classificationCeiling}
                    </span>
                  </Td>

                  {IAM_CAPABILITIES.map((capability) => {
                    const level = set.levels[capability];
                    return (
                      <Td key={capability} className={LEVEL_CELL[level]}>
                        <span
                          className={
                            LEVEL_RANK[level] === 0
                              ? ""
                              : "font-medium text-neutral-900 dark:text-neutral-100"
                          }
                        >
                          {level}
                        </span>
                      </Td>
                    );
                  })}

                  <Td align="right">
                    <span className="font-mono">{held}</span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {(["None", "Read", "Contribute", "Manage", "Full"] as const).map((level) => (
            <li
              key={level}
              className="inline-flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300"
            >
              <span
                className={`h-3 w-5 shrink-0 rounded-[2px] border border-neutral-200 dark:border-neutral-700 ${LEVEL_CELL[level]}`}
                aria-hidden="true"
              />
              {level}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
            <FiServer size={16} className="text-neutral-400" aria-hidden="true" />
            Evaluated on every request
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-IAM-08 — authorisation is decided server-side, per request, as a
            function of all five factors together. A permission set alone never
            grants access.
          </p>

          <ol className="mt-4 space-y-3">
            {AUTHORISATION_FACTORS.map((factor, index) => (
              <li key={factor.factor} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-state-600/10 font-mono text-[10px] font-semibold text-state-700 dark:bg-state-900/40 dark:text-state-400">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {factor.factor}
                  </span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {factor.detail}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </article>

        <div className="space-y-4">
          <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
              <FiEyeOff size={16} className="text-neutral-400" aria-hidden="true" />
              Unauthorised material is not merely hidden
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              FR-IAM-09 — material a user is not entitled to is not listed,
              counted, searchable or inferable. A user cannot learn that a paper
              exists from a result count, a gap in numbering, or an empty state.
            </p>
          </article>

          <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
              <FiLock size={16} className="text-neutral-400" aria-hidden="true" />
              Administrators hold no default read access
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              FR-IAM-10 — technical administrators run the platform without
              reading what is on it. Reaching document content takes a documented,
              time-boxed break-glass grant.
            </p>
            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
              {ROLE_PERMISSIONS.filter((r) => r.privileged).length} role groups are
              privileged and are reached only through a separate administrative
              account.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
