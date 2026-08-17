"use client";

import {
  FiAlertTriangle,
  FiCheckCircle,
  FiHardDrive,
  FiLock,
  FiSearch,
  FiWifiOff,
} from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectEndpoints } from "@/core/slices/docsec-slice";
import { recordVerification } from "@/core/thunks-docsec";
import {
  VERIFICATION_COLOR,
  VERIFICATION_TONE,
  endpointExceptions,
} from "../../components/docStatus";

/** The configuration every shared endpoint is held to. */
const REQUIREMENTS = [
  {
    id: "persistent",
    label: "No persistent local storage",
    detail: "FR-DOC-15 — nothing survives on the device between sessions",
    icon: FiHardDrive,
  },
  {
    id: "encrypted",
    label: "Session cache encrypted",
    detail: "FR-DOC-16 — and limited to the pack for the current session",
    icon: FiLock,
  },
  {
    id: "offline",
    label: "Offline access disabled",
    detail: "FR-DOC-19 — not available on a shared device under any configuration",
    icon: FiWifiOff,
  },
] as const;

export default function EndpointBoard() {
  const dispatch = useAppDispatch();
  const endpoints = useAppSelector(selectEndpoints);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-3">
        {REQUIREMENTS.map((requirement) => {
          const failing = endpoints.filter((endpoint) => {
            if (requirement.id === "persistent") return endpoint.persistentStorage;
            if (requirement.id === "encrypted") {
              return !endpoint.cacheEncrypted || endpoint.cacheScope !== "Current session only";
            }
            return endpoint.offlineEnabled;
          });

          return (
            <article
              key={requirement.id}
              className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                <requirement.icon size={16} className="text-neutral-400" aria-hidden="true" />
                {requirement.label}
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {requirement.detail}
              </p>
              <p
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium"
                style={{
                  color:
                    failing.length === 0 ? "var(--viz-good)" : "var(--viz-critical)",
                }}
              >
                {failing.length === 0 ? (
                  <FiCheckCircle size={15} aria-hidden="true" />
                ) : (
                  <FiAlertTriangle size={15} aria-hidden="true" />
                )}
                {failing.length === 0
                  ? `All ${endpoints.length} endpoints comply`
                  : `${failing.length} endpoint${failing.length === 1 ? "" : "s"} out of policy`}
              </p>
            </article>
          );
        })}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-bold">Endpoints</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-DOC-17 — cache clearing is verified by inspecting the device after a
            session. An endpoint that has not been inspected has not been cleared
            as far as this register is concerned.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {endpoints.map((endpoint) => {
            const exceptions = endpointExceptions(endpoint);

            return (
              <article
                key={endpoint.id}
                className="rounded-lg border bg-white dark:bg-neutral-900"
                style={{
                  borderColor:
                    endpoint.verification === "Remnant found" || exceptions.length > 0
                      ? "var(--viz-critical)"
                      : undefined,
                }}
              >
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {endpoint.id} · {endpoint.kind}
                    </p>
                    <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                      {endpoint.label}
                    </h3>
                  </div>
                  <StatusBadge tone={VERIFICATION_TONE[endpoint.verification]}>
                    {endpoint.verification}
                  </StatusBadge>
                </header>

                <div className="space-y-4 px-5 py-4">
                  <div className="space-y-0.5">
                    <DetailRow label="Location" value={endpoint.location} />
                    <DetailRow
                      label="Persistent storage"
                      value={endpoint.persistentStorage ? "Enabled" : "Disabled"}
                    />
                    <DetailRow
                      label="Session cache"
                      value={`${endpoint.cacheEncrypted ? "Encrypted" : "Not encrypted"} · ${endpoint.cacheScope}`}
                    />
                    <DetailRow
                      label="Offline access"
                      value={endpoint.offlineEnabled ? "Enabled" : "Disabled"}
                    />
                    <DetailRow
                      label="Last session"
                      value={endpoint.lastSessionPackId ?? "No session yet"}
                    />
                    <DetailRow
                      label="Last inspected"
                      value={
                        endpoint.lastVerifiedAt ? stamp(endpoint.lastVerifiedAt) : "Never"
                      }
                    />
                  </div>

                  {endpoint.note && (
                    <p className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                      {endpoint.note}
                    </p>
                  )}

                  {exceptions.map((issue) => (
                    <p
                      key={issue}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: VERIFICATION_COLOR["Remnant found"] }}
                    >
                      <FiAlertTriangle size={14} aria-hidden="true" />
                      {issue}
                    </p>
                  ))}

                  <div className="flex flex-wrap gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(recordVerification(endpoint, "Clean"))
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-state-600 px-3 py-1.5 text-sm font-medium text-state-700 transition hover:bg-state-600 hover:text-white dark:text-state-400"
                    >
                      <FiSearch size={14} aria-hidden="true" />
                      Record a clean inspection
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          recordVerification(
                            endpoint,
                            "Remnant found",
                            "Recoverable document data found after session end. Endpoint held out of service pending re-imaging.",
                          ),
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                    >
                      <FiAlertTriangle size={14} aria-hidden="true" />
                      Record a remnant
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
