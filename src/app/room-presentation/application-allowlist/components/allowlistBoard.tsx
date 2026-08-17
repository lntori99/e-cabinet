"use client";

import { FiCheckCircle, FiSlash } from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectAllowlist } from "@/core/slices/rooms-slice";
import { setAllowlistState } from "@/core/thunks-rooms";
import { ALLOWLIST_TONE } from "../../components/roomStatus";

const CATEGORIES = ["e-Cabinet", "Presentation", "Conferencing", "System"] as const;

export default function AllowlistBoard() {
  const dispatch = useAppDispatch();
  const entries = useAppSelector(selectAllowlist);

  const approved = entries.filter((e) => e.state === "Approved");
  const blocked = entries.filter((e) => e.state === "Blocked");

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            <FiCheckCircle size={13} style={{ color: "var(--viz-good)" }} aria-hidden="true" />
            Approved
          </p>
          <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {approved.length}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Everything a room endpoint may launch
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            <FiSlash size={13} className="text-neutral-400" aria-hidden="true" />
            Explicitly blocked
          </p>
          <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {blocked.length}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Named so an attempt is a recorded refusal, not a silent gap
          </p>
        </div>
      </div>

      {CATEGORIES.map((category) => {
        const inCategory = entries.filter((e) => e.category === category);
        if (inCategory.length === 0) return null;

        return (
          <section key={category} className="space-y-3">
            <h2 className="font-bold">{category}</h2>
            <Table>
              <thead>
                <tr>
                  <Th>Application</Th>
                  <Th>Publisher</Th>
                  <Th>Note</Th>
                  <Th>State</Th>
                  <Th align="right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {inCategory.map((entry) => (
                  <tr
                    key={entry.id}
                    className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                  >
                    <Td>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {entry.name}
                      </span>
                    </Td>
                    <Td>{entry.publisher}</Td>
                    <Td>
                      {entry.note ?? (
                        <span className="text-neutral-500 dark:text-neutral-400">—</span>
                      )}
                    </Td>
                    <Td>
                      <StatusBadge tone={ALLOWLIST_TONE[entry.state]}>
                        {entry.state}
                      </StatusBadge>
                    </Td>
                    <Td align="right">
                      {entry.state === "Approved" ? (
                        <button
                          type="button"
                          onClick={() => dispatch(setAllowlistState(entry, "Blocked"))}
                          className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-seal-500 hover:text-seal-500 dark:border-neutral-700 dark:text-neutral-300"
                        >
                          <FiSlash size={14} aria-hidden="true" />
                          Block
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => dispatch(setAllowlistState(entry, "Approved"))}
                          className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                        >
                          <FiCheckCircle size={14} aria-hidden="true" />
                          Approve
                        </button>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </section>
        );
      })}

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Approving an application is the change that carries risk here, not blocking
        one — so it is the approval that is logged at warning severity, against the
        administrator who made it. FR-PRS-03 is the reason the office suite and the
        general browser stay blocked: presenting from a local file is exactly what
        the platform refuses to allow.
      </p>
    </div>
  );
}
