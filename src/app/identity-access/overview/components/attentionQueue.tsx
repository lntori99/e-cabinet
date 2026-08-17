"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiKey,
  FiSmartphone,
  FiUnlock,
  FiUserCheck,
} from "react-icons/fi";
import { distance, hoursUntil, stamp } from "@/common/time";
import { useAppSelector } from "@/core/hook";
import {
  selectActiveBreakGlass,
  selectOpenDeactivations,
  selectPendingApprovals,
  selectUntrustedDevices,
} from "@/core/slices/identity-slice";
import { selectUsers } from "@/core/slices/users-slice";
import { userName } from "../../components/iamStatus";

function Row({
  icon: Icon,
  color,
  title,
  detail,
  href,
  action,
}: {
  icon: typeof FiClock;
  color: string;
  title: ReactNode;
  detail: string;
  href: string;
  action: string;
}) {
  return (
    <li className="flex items-start justify-between gap-3 py-3">
      <span className="flex min-w-0 items-start gap-2.5">
        <Icon size={15} className="mt-0.5 shrink-0" style={{ color }} aria-hidden="true" />
        <span className="min-w-0">
          <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {title}
          </span>
          <span className="block text-xs text-neutral-500 dark:text-neutral-400">
            {detail}
          </span>
        </span>
      </span>
      <Link
        href={href}
        className="shrink-0 text-xs font-medium text-state-700 hover:underline dark:text-state-400"
      >
        {action} →
      </Link>
    </li>
  );
}

/**
 * The queue the access administrator works from. Ordered by how little time is
 * left to act on it, not by category — a deactivation past its hour outranks a
 * device whose attestation is merely stale.
 */
export default function AttentionQueue({ now }: { now: string }) {
  const users = useAppSelector(selectUsers);
  const deactivations = useAppSelector(selectOpenDeactivations);
  const approvals = useAppSelector(selectPendingApprovals);
  const activeGrants = useAppSelector(selectActiveBreakGlass);
  const devices = useAppSelector(selectUntrustedDevices);

  const rows: ReactNode[] = [];

  // FR-IAM-13 — one working hour, and the clock is already running.
  for (const request of deactivations) {
    const left = hoursUntil(request.dueBy, now);
    rows.push(
      <Row
        key={request.id}
        icon={left < 0 ? FiAlertTriangle : FiClock}
        color={left < 0 ? "var(--viz-critical)" : "var(--viz-warning)"}
        title={`Deactivate ${userName(users, request.userId)}`}
        detail={`${request.reason} · raised by ${request.raisedBy} · due ${distance(left)}`}
        href="/identity-access/users"
        action={left < 0 ? "Overdue" : "Close it"}
      />,
    );
  }

  for (const grant of approvals.breakGlass) {
    rows.push(
      <Row
        key={grant.id}
        icon={FiUnlock}
        color="var(--viz-warning)"
        title={`Break-glass request ${grant.id}`}
        detail={`${grant.requestedBy} · ${grant.scope} · raised ${stamp(grant.requestedAt)}`}
        href="/identity-access/privileged-access"
        action="Review"
      />,
    );
  }

  for (const grant of activeGrants) {
    const left = grant.expiresAt ? hoursUntil(grant.expiresAt, now) : 0;
    rows.push(
      <Row
        key={`active-${grant.id}`}
        icon={FiKey}
        color="var(--viz-critical)"
        title={`${grant.adminAccount} holds content access`}
        detail={`${grant.id} · ${grant.scope} · expires ${distance(left)}`}
        href="/identity-access/privileged-access"
        action="Open"
      />,
    );
  }

  for (const delegation of approvals.delegations) {
    rows.push(
      <Row
        key={delegation.id}
        icon={FiUserCheck}
        color="var(--viz-warning)"
        title={`Delegation ${delegation.id} awaiting approval`}
        detail={`${userName(users, delegation.fromUserId)} → ${userName(users, delegation.toUserId)} · ${delegation.scope}`}
        href="/identity-access/delegations"
        action="Review"
      />,
    );
  }

  for (const device of devices) {
    rows.push(
      <Row
        key={device.id}
        icon={FiSmartphone}
        color={device.attestation === "Failed" ? "var(--viz-critical)" : "var(--viz-warning)"}
        title={device.label}
        detail={`${device.attestation} · ${userName(users, device.ownerId)} · ${device.status}`}
        href="/identity-access/trusted-devices"
        action="Inspect"
      />,
    );
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
        <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
          Needs action
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          {rows.length} open
        </p>
      </header>

      <div className="px-5">
        {rows.length === 0 ? (
          <p className="flex items-center gap-2 py-5 text-sm text-neutral-600 dark:text-neutral-300">
            <FiCheckCircle
              size={15}
              style={{ color: "var(--viz-good)" }}
              aria-hidden="true"
            />
            Nothing is waiting on an administrator.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">{rows}</ul>
        )}
      </div>
    </section>
  );
}
