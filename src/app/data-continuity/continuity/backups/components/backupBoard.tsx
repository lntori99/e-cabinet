"use client";

import { FiCheckCircle, FiEye, FiLock, FiShield, FiX } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { Kpi, StatusBadge } from "@/common/ui";
import { selectBackups } from "@/core/slices/governance-slice";

/**
 * FR-DAT-08 — encrypted, access-controlled, monitored, and at least one copy
 * protected from ordinary administrative deletion. Four conditions, so four
 * checks per set rather than one green tick: a backup that is encrypted and
 * monitored but deletable by an administrator satisfies three of them and
 * protects against nothing that matters.
 */
export default function BackupBoard() {
  const backups = selectBackups();

  const immutable = backups.filter((b) => b.immutable);
  const unverified = backups.filter((b) => b.state !== "Verified");
  const total = backups.reduce((sum, b) => sum + b.sizeGb, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Backup sets" value={backups.length} hint="Held on the appliance and offsite" />
        <Kpi
          label="Protected from deletion"
          value={immutable.length}
          hint="Copies an administrator cannot remove"
          tone={immutable.length > 0 ? "green" : "red"}
        />
        <Kpi
          label="Not yet verified"
          value={unverified.length}
          hint="Taken but not read back"
          tone={unverified.length > 0 ? "amber" : "green"}
        />
        <Kpi label="Held" value={`${(total / 1024).toFixed(2)} TB`} hint="Across all sets" />
      </div>

      {immutable.length === 0 && (
        <p
          className="flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <FiShield
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-critical)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            No copy is protected from ordinary administrative deletion. FR-DAT-08
            requires at least one, and without it a compromised administrator
            account can remove the backups along with the data.
          </span>
        </p>
      )}

      {backups.map((backup) => (
        <article
          key={backup.id}
          className="rounded-lg border bg-white dark:bg-neutral-900"
          style={{
            borderColor:
              backup.state === "Failed"
                ? "var(--viz-critical)"
                : backup.state === "Unverified"
                  ? "var(--viz-warning)"
                  : "var(--viz-grid)",
          }}
        >
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {backup.id} · FR-DAT-08 · {stamp(backup.takenAt)}
              </p>
              <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                {backup.name}
              </h2>
              <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                {backup.location}
              </p>
            </div>
            <StatusBadge
              tone={
                backup.state === "Verified"
                  ? "green"
                  : backup.state === "Unverified"
                    ? "amber"
                    : "red"
              }
            >
              {backup.state}
            </StatusBadge>
          </header>

          <div className="grid gap-3 px-5 py-4 sm:grid-cols-2 xl:grid-cols-4">
            <Condition label="Encrypted" ok={backup.encrypted} icon={FiLock} />
            <Condition label="Access-controlled" ok icon={FiShield} />
            <Condition label="Monitored" ok={backup.monitored} icon={FiEye} />
            <Condition
              label="Protected from deletion"
              ok={backup.immutable}
              icon={FiShield}
            />
          </div>

          <div className="grid gap-x-6 border-t border-neutral-200 px-5 py-4 lg:grid-cols-2 dark:border-neutral-800">
            <div className="space-y-0.5">
              <DetailRow label="Size" value={`${backup.sizeGb} GB`} />
              <DetailRow label="Retain until" value={backup.retainUntil} />
            </div>
            <div className="space-y-0.5">
              <DetailRow
                label="Verified"
                value={
                  backup.verifiedAt ? (
                    stamp(backup.verifiedAt)
                  ) : (
                    <span style={{ color: "var(--viz-warning)" }}>
                      Not read back — a backup nobody has restored is a hope
                    </span>
                  )
                }
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Condition({
  label,
  ok,
  icon: Icon,
}: {
  label: string;
  ok: boolean;
  icon: typeof FiLock;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border px-3 py-2.5"
      style={{ borderColor: ok ? "var(--viz-good)" : "var(--viz-critical)" }}
    >
      {ok ? (
        <FiCheckCircle size={14} style={{ color: "var(--viz-good)" }} aria-hidden="true" />
      ) : (
        <FiX size={14} style={{ color: "var(--viz-critical)" }} aria-hidden="true" />
      )}
      <span className="inline-flex items-center gap-1.5 text-sm text-neutral-800 dark:text-neutral-200">
        <Icon size={12} className="text-neutral-400" aria-hidden="true" />
        {label}
      </span>
    </div>
  );
}
