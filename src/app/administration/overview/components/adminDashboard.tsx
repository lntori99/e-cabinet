"use client";

import Link from "next/link";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiUserX,
} from "react-icons/fi";
import { stamp } from "@/common/time";
import { Kpi, StatusBadge } from "@/common/ui";
import { OPERATOR } from "@/core/app-constants";
import { useAppSelector } from "@/core/hook";
import {
  selectDevices,
  selectDutyRules,
  selectHealth,
  selectHealthWarnings,
  selectNonCompliantDevices,
  selectPendingApprovals,
  selectUpcomingWindows,
} from "@/core/slices/admin-slice";
import CapacityChart from "./capacityChart";
import ComplianceChart from "./complianceChart";

export default function AdminDashboard() {
  const pending = useAppSelector(selectPendingApprovals);
  const warnings = useAppSelector(selectHealthWarnings);
  const offPolicy = useAppSelector(selectNonCompliantDevices);
  const upcoming = useAppSelector(selectUpcomingWindows);
  const devices = useAppSelector(selectDevices);
  const health = useAppSelector(selectHealth);
  const dutyRules = selectDutyRules();

  const down = health.filter((s) => s.status === "Down");
  const clashing = upcoming.filter((w) => w.clashesWith);
  const unnotified = upcoming.filter((w) => !w.notifiedAt);
  const breaches = dutyRules.filter((r) => r.breachedBy.length > 0);
  const mine = pending.filter((a) => a.implementer === `${OPERATOR.name} (${OPERATOR.shortRole})`);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Awaiting a second approver"
          value={pending.length}
          hint={
            mine.length > 0
              ? `${mine.length} of these you submitted and cannot approve`
              : "None submitted by you"
          }
          tone={pending.length > 0 ? "amber" : "green"}
        />
        <Kpi
          label="Health warnings"
          value={warnings.length}
          hint={
            down.length > 0
              ? `${down.length} service down — ${down.map((s) => s.name).join(", ")}`
              : "Degraded or near capacity"
          }
          tone={down.length > 0 ? "red" : warnings.length > 0 ? "amber" : "green"}
        />
        <Kpi
          label="Devices off policy"
          value={offPolicy.length}
          hint={`${devices.length} enrolled in total`}
          tone={
            offPolicy.some((d) => d.compliance === "Non-compliant")
              ? "red"
              : offPolicy.length > 0
                ? "amber"
                : "green"
          }
        />
        <Kpi
          label="Maintenance ahead"
          value={upcoming.length}
          hint={
            clashing.length > 0
              ? `${clashing.length} collides with a sitting`
              : unnotified.length > 0
                ? `${unnotified.length} not yet notified`
                : "All notified"
          }
          tone={clashing.length > 0 ? "red" : unnotified.length > 0 ? "amber" : "green"}
        />
      </div>

      {clashing.length > 0 && (
        <section
          className="rounded-lg border"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <span className="inline-flex items-center gap-2 font-bold">
              <FiAlertTriangle
                size={16}
                style={{ color: "var(--viz-critical)" }}
                aria-hidden="true"
              />
              A maintenance window collides with a sitting
            </span>
            <Link
              href="/administration/maintenance"
              className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
            >
              Maintenance <FiArrowRight size={13} aria-hidden="true" />
            </Link>
          </header>
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {clashing.map((window) => (
              <li key={window.id} className="px-5 py-3">
                <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {window.title}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                  {stamp(window.startsAt)} to {stamp(window.endsAt)} · affects{" "}
                  {window.affectedServices.join(", ")}
                </span>
                <span
                  className="mt-1 block text-xs"
                  style={{ color: "var(--viz-critical)" }}
                >
                  Clashes with {window.clashesWith}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pending.length > 0 && (
        <section
          className="rounded-lg border"
          style={{ borderColor: "var(--viz-warning)" }}
        >
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <span className="inline-flex items-center gap-2 font-bold">
              <FiShield
                size={16}
                style={{ color: "var(--viz-warning)" }}
                aria-hidden="true"
              />
              Security-relevant changes waiting on a second approver
            </span>
            <Link
              href="/administration/change-approvals"
              className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
            >
              Approvals <FiArrowRight size={13} aria-hidden="true" />
            </Link>
          </header>
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {pending.map((approval) => (
              <li
                key={approval.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {approval.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    “{approval.previousValue}” → “{approval.proposedValue}” · submitted
                    by {approval.implementer}
                  </span>
                </span>
                <StatusBadge tone="amber">{approval.area}</StatusBadge>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <CapacityChart services={health} />
        <ComplianceChart devices={devices} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <span className="inline-flex items-center gap-2 font-bold">
              <FiActivity size={15} className="text-neutral-400" aria-hidden="true" />
              What needs attention
            </span>
            <Link
              href="/administration/platform-health"
              className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
            >
              Platform health <FiArrowRight size={13} aria-hidden="true" />
            </Link>
          </header>
          {warnings.length === 0 ? (
            <p className="px-5 py-6 text-sm text-neutral-500 dark:text-neutral-400">
              Every service, store, queue, backup and integration is healthy.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {warnings.map((service) => (
                <li
                  key={service.id}
                  className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {service.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {service.detail}
                    </span>
                  </span>
                  <StatusBadge tone={service.status === "Down" ? "red" : "amber"}>
                    {service.status}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section
            className="rounded-lg border bg-white dark:bg-neutral-900"
            style={{
              borderColor:
                breaches.length > 0 ? "var(--viz-critical)" : "var(--viz-grid)",
            }}
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <span className="inline-flex items-center gap-2 font-bold">
                <FiUserX size={15} className="text-neutral-400" aria-hidden="true" />
                Separation of duties
              </span>
              <StatusBadge tone={breaches.length > 0 ? "red" : "green"}>
                {breaches.length > 0 ? `${breaches.length} breach` : "No breach"}
              </StatusBadge>
            </header>
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {dutyRules.map((rule) => (
                <li key={rule.id} className="px-5 py-3">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <FiCheckCircle
                      size={13}
                      style={{
                        color:
                          rule.breachedBy.length > 0
                            ? "var(--viz-critical)"
                            : "var(--viz-good)",
                      }}
                      aria-hidden="true"
                    />
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {rule.leftRight}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400">and</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {rule.rightRight}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                    {rule.reason}
                  </p>
                  {rule.breachedBy.length > 0 && (
                    <p
                      className="mt-1 text-xs"
                      style={{ color: "var(--viz-critical)" }}
                    >
                      Held together by {rule.breachedBy.join(", ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <p className="border-t border-neutral-200 px-5 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              FR-ADM-13 — the check runs against the role catalogue rather than
              against anybody's memory. A change that would create one of these
              pairs is refused at the point it is proposed.
            </p>
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <span className="inline-flex items-center gap-2 font-bold">
                <FiClock size={15} className="text-neutral-400" aria-hidden="true" />
                Maintenance ahead
              </span>
            </header>
            {upcoming.length === 0 ? (
              <p className="px-5 py-6 text-sm text-neutral-500 dark:text-neutral-400">
                Nothing is scheduled.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {upcoming.map((window) => (
                  <li
                    key={window.id}
                    className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {window.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        {stamp(window.startsAt)} · {window.affectedServices.join(", ")}
                      </span>
                    </span>
                    <StatusBadge tone={window.notifiedAt ? "green" : "amber"}>
                      {window.notifiedAt ? "Notified" : "Not notified"}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <FiShield size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        Individual account provisioning, amendment, suspension and deactivation
        live in Identity and Access, where the role model is. This console
        configures the platform; that one configures who may use it.
      </p>
    </div>
  );
}
