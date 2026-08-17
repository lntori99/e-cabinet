"use client";

import {
  FiAlertTriangle,
  FiClock,
  FiRefreshCw,
  FiSmartphone,
  FiTrash2,
} from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { distance, hoursUntil, stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectOfflineGrants } from "@/core/slices/docsec-slice";
import { wipeOfflineCopy } from "@/core/thunks-docsec";
import { HANDLING_RULES } from "@/data/documentSecurity";
import type { OfflineGrant } from "@/models/response/base-response";

const TONE: Record<OfflineGrant["status"], "green" | "amber" | "red" | "neutral"> = {
  Active: "amber",
  "Awaiting sync": "amber",
  Expired: "neutral",
  Wiped: "red",
};

/** The five conditions FR-DOC-18 attaches to any offline copy. */
const CONDITIONS = [
  "Managed device with certificate-based trust",
  "Encrypted local storage",
  "Time-bound access token with a defined expiry",
  "Remote wipe capability",
  "Audit synchronisation on reconnection",
];

export default function OfflineBoard({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const grants = useAppSelector(selectOfflineGrants);

  const active = grants.filter((g) => g.status === "Active" || g.status === "Awaiting sync");
  const closed = grants.filter((g) => g.status === "Expired" || g.status === "Wiped");
  const permitted = HANDLING_RULES.filter((r) => r.offline !== "Blocked");

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
            Release 2 — the control is defined, not yet switched on
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            No new offline grant can be issued in this release. What is listed
            below is the pilot record, kept so the conditions and the wipe path can
            be exercised before the capability is opened.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
            Conditions on every offline copy
          </h2>
          <ol className="mt-3 space-y-2.5">
            {CONDITIONS.map((condition, index) => (
              <li key={condition} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-state-600/10 font-mono text-[10px] font-semibold text-state-700 dark:bg-state-900/40 dark:text-state-400">
                  {index + 1}
                </span>
                <span className="text-neutral-700 dark:text-neutral-300">{condition}</span>
              </li>
            ))}
          </ol>
          <p
            className="mt-4 flex items-start gap-2 text-xs"
            style={{ color: "var(--viz-critical)" }}
          >
            <FiAlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span className="text-neutral-600 dark:text-neutral-300">
              FR-DOC-19 — offline access is never enabled on a shared room device,
              under any configuration. The conditions above cannot make a shared
              device eligible.
            </span>
          </p>
        </article>

        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
            Where it could apply
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Classifications whose handling rule permits offline review at all.
          </p>
          <ul className="mt-3 space-y-2">
            {permitted.map((rule) => (
              <li
                key={rule.classification}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span className="text-neutral-700 dark:text-neutral-300">
                  {rule.classification}
                </span>
                <StatusBadge tone={rule.offline === "Permitted" ? "neutral" : "amber"}>
                  {rule.offline}
                </StatusBadge>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
            TOP SECRET and SECRET material never leaves the platform, whatever the
            device.
          </p>
        </article>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Offline copies</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {active.length} outstanding · {closed.length} closed
          </p>
        </div>

        {grants.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            No offline copy has been issued.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Holder</Th>
                <Th>Device</Th>
                <Th>Token</Th>
                <Th>Last sync</Th>
                <Th>Status</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {grants.map((grant) => {
                const left = hoursUntil(grant.expiresAt, now);
                return (
                  <tr
                    key={grant.id}
                    className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                  >
                    <Td>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {grant.userName}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {grant.id} · {grant.packId}
                      </span>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-2">
                        <FiSmartphone
                          size={13}
                          className="text-neutral-400"
                          aria-hidden="true"
                        />
                        {grant.deviceLabel}
                      </span>
                    </Td>
                    <Td>
                      <span className="whitespace-nowrap">
                        {left <= 0 ? "Expired" : distance(left)}
                      </span>
                      <span className="mt-0.5 block font-mono text-xs text-neutral-500 dark:text-neutral-400">
                        {stamp(grant.expiresAt)}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono">
                        {grant.lastSyncAt ? stamp(grant.lastSyncAt) : "—"}
                      </span>
                      {grant.wipeRequestedAt && (
                        <span
                          className="mt-0.5 block text-xs"
                          style={{ color: "var(--viz-critical)" }}
                        >
                          Wipe requested {stamp(grant.wipeRequestedAt)}
                        </span>
                      )}
                    </Td>
                    <Td>
                      <StatusBadge tone={TONE[grant.status]}>{grant.status}</StatusBadge>
                    </Td>
                    <Td align="right">
                      {grant.status === "Wiped" ? (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          Wiped
                        </span>
                      ) : grant.status === "Expired" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                          <FiRefreshCw size={11} aria-hidden="true" />
                          Token lapsed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              wipeOfflineCopy(grant.id, grant.userName, grant.deviceLabel),
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                        >
                          <FiTrash2 size={14} aria-hidden="true" />
                          Wipe remotely
                        </button>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          A wipe is queued immediately and applied the next time the device is
          reachable. The token expiry is the backstop: a device that never
          reconnects loses access when the token lapses, wipe or no wipe.
        </p>
      </section>
    </div>
  );
}
