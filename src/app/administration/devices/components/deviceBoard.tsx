"use client";

import { useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiLock,
  FiSlash,
  FiSmartphone,
  FiTrash2,
  FiUnlock,
  FiXCircle,
} from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { filterCls } from "@/common/field";
import { DetailRow } from "@/common/table";
import { Kpi, StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectDevices } from "@/core/slices/admin-slice";
import { reportDeviceLost, wipeDevice } from "@/core/thunks-admin";
import type { DeviceCompliance, ManagedDevice } from "@/models/response/base-response";

const ALL = "All";

const TONE: Record<DeviceCompliance, "green" | "amber" | "red" | "neutral"> = {
  Compliant: "green",
  "At risk": "amber",
  "Non-compliant": "red",
  Wiped: "neutral",
};

const ICON: Record<DeviceCompliance, typeof FiCheckCircle> = {
  Compliant: FiCheckCircle,
  "At risk": FiAlertTriangle,
  "Non-compliant": FiXCircle,
  Wiped: FiSlash,
};

/**
 * FR-ADM-08 and FR-ADM-09 — inventory, enrolment, policy compliance and remote
 * wipe. A non-compliant device always says why: a red badge with no finding
 * behind it tells an administrator to do something without telling them what.
 */
export default function DeviceBoard() {
  const dispatch = useAppDispatch();
  const devices = useAppSelector(selectDevices);

  const [ministry, setMinistry] = useState(ALL);
  const [compliance, setCompliance] = useState(ALL);

  const ministries = useMemo(
    () => [ALL, ...new Set(devices.map((d) => d.ministry))].sort(),
    [devices],
  );

  const shown = devices.filter(
    (d) =>
      (ministry === ALL || d.ministry === ministry) &&
      (compliance === ALL || d.compliance === compliance),
  );

  const lost = devices.filter((d) => d.reportedLost && d.compliance !== "Wiped");
  const offPolicy = devices.filter(
    (d) => d.compliance === "Non-compliant" || d.compliance === "At risk",
  );
  const unencrypted = devices.filter((d) => !d.encrypted && d.compliance !== "Wiped");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Enrolled" value={devices.length} hint="Endpoints and room devices" />
        <Kpi
          label="Off policy"
          value={offPolicy.length}
          hint="At risk or non-compliant"
          tone={offPolicy.length > 0 ? "amber" : "green"}
        />
        <Kpi
          label="Reported lost"
          value={lost.length}
          hint={lost.length > 0 ? "Not yet wiped" : "None outstanding"}
          tone={lost.length > 0 ? "red" : "green"}
        />
        <Kpi
          label="Unencrypted"
          value={unencrypted.length}
          hint="Disk encryption off at the last check-in"
          tone={unencrypted.length > 0 ? "red" : "green"}
        />
      </div>

      {lost.length > 0 && (
        <p
          className="flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <FiAlertTriangle
            size={15}
            className="mt-0.5 shrink-0"
            style={{ color: "var(--viz-critical)" }}
            aria-hidden="true"
          />
          <span className="text-neutral-700 dark:text-neutral-300">
            {lost.length} device{lost.length === 1 ? " has" : "s have"} been
            reported lost and not yet wiped. A wipe takes effect at the device's
            next check-in, so the sooner it is issued the smaller the window.
          </span>
        </p>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <Filter label="Ministry">
          <select
            value={ministry}
            onChange={(e) => setMinistry(e.target.value)}
            aria-label="Filter by ministry"
            className={filterCls}
          >
            {ministries.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Filter>
        <Filter label="Compliance">
          <select
            value={compliance}
            onChange={(e) => setCompliance(e.target.value)}
            aria-label="Filter by compliance"
            className={filterCls}
          >
            {[ALL, "Compliant", "At risk", "Non-compliant", "Wiped"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Filter>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={FiSmartphone}
            title="No device matches"
            description="No enrolled device matches that combination of ministry and compliance."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onWipe={() => dispatch(wipeDevice(device))}
              onReportLost={() => dispatch(reportDeviceLost(device))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DeviceCard({
  device,
  onWipe,
  onReportLost,
}: {
  device: ManagedDevice;
  onWipe: () => void;
  onReportLost: () => void;
}) {
  const Icon = ICON[device.compliance];
  const wiped = device.compliance === "Wiped";

  return (
    <article
      className="rounded-lg border bg-white dark:bg-neutral-900"
      style={{
        borderColor:
          device.compliance === "Non-compliant"
            ? "var(--viz-critical)"
            : device.compliance === "At risk"
              ? "var(--viz-warning)"
              : "var(--viz-grid)",
      }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {device.id} · {device.kind}
          </p>
          <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
            {device.label} — {device.assignedTo}
          </h3>
          <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
            {device.ministry}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {device.reportedLost && !wiped && <StatusBadge tone="red">Lost</StatusBadge>}
          <span className="inline-flex items-center gap-1.5">
            <Icon
              size={14}
              style={{
                color:
                  device.compliance === "Compliant"
                    ? "var(--viz-good)"
                    : device.compliance === "At risk"
                      ? "var(--viz-warning)"
                      : device.compliance === "Non-compliant"
                        ? "var(--viz-critical)"
                        : "var(--viz-axis)",
              }}
              aria-hidden="true"
            />
            <StatusBadge tone={TONE[device.compliance]}>{device.compliance}</StatusBadge>
          </span>
        </div>
      </header>

      <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
        <div className="space-y-0.5">
          <DetailRow label="Enrolled" value={device.enrolledAt} />
          <DetailRow label="Last seen" value={device.lastSeenAt.replace("T", " ")} />
          <DetailRow label="Operating system" value={device.osVersion} />
        </div>
        <div className="space-y-0.5">
          <DetailRow
            label="Disk encryption"
            value={
              device.encrypted ? (
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{ color: "var(--viz-good)" }}
                >
                  <FiLock size={12} aria-hidden="true" />
                  On
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{ color: "var(--viz-critical)" }}
                >
                  <FiUnlock size={12} aria-hidden="true" />
                  Off
                </span>
              )
            }
          />
          {device.wipedAt && (
            <DetailRow
              label="Wiped"
              value={`${device.wipedAt.replace("T", " ")} by ${device.wipedBy}`}
            />
          )}
        </div>
      </div>

      {device.findings.length > 0 && (
        <div className="border-t border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Findings
          </p>
          <ul className="mt-2 space-y-1">
            {device.findings.map((finding) => (
              <li
                key={finding}
                className="inline-flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
              >
                <FiAlertTriangle
                  size={12}
                  className="mt-1 shrink-0"
                  style={{ color: "var(--viz-warning)" }}
                  aria-hidden="true"
                />
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!wiped && (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            A wipe cannot be undone and is written to the audit log as a critical
            event.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {!device.reportedLost && (
              <button
                type="button"
                onClick={onReportLost}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
              >
                <FiAlertTriangle size={14} aria-hidden="true" />
                Report lost
              </button>
            )}
            <button
              type="button"
              onClick={onWipe}
              className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
            >
              <FiTrash2 size={14} aria-hidden="true" />
              Wipe remotely
            </button>
          </div>
        </footer>
      )}
    </article>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  );
}
