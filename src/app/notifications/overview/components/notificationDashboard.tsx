"use client";

import Link from "next/link";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiBell,
  FiEyeOff,
  FiLink2,
  FiLock,
  FiPaperclip,
  FiShield,
} from "react-icons/fi";
import { stamp } from "@/common/time";
import { Kpi, StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  selectDeliveries,
  selectFailedDeliveries,
  selectOutstandingCentreItems,
  selectPendingDeliveries,
  selectRules,
  selectTemplates,
} from "@/core/slices/notification-slice";
import { CONTENT_RULES } from "@/data/notifications";
import { checkTemplate, triggerTone } from "../../components/notificationStatus";
import DeliveryChart from "./deliveryChart";
import TriggerChart from "./triggerChart";

export default function NotificationDashboard() {
  const deliveries = useAppSelector(selectDeliveries);
  const failed = useAppSelector(selectFailedDeliveries);
  const pending = useAppSelector(selectPendingDeliveries);
  const outstanding = useAppSelector(selectOutstandingCentreItems);
  const rules = useAppSelector(selectRules);
  const templates = useAppSelector(selectTemplates);

  const mandatory = rules.filter((r) => r.mandatory).length;
  const deliveredRate =
    deliveries.length === 0
      ? 0
      : Math.round(
          (deliveries.filter((d) => d.state === "Delivered").length /
            deliveries.length) *
            100,
        );

  // FR-NOT-06 and FR-NOT-07 are checkable, so they are checked rather than
  // asserted: every template body is run against the content rules here.
  const offending = templates.filter((t) =>
    checkTemplate(t.subject, t.body).some((c) => !c.passes),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Notifications sent"
          value={deliveries.length}
          hint={`${deliveredRate}% delivered on the first or a later attempt`}
        />
        <Kpi
          label="Failed deliveries"
          value={failed.length}
          hint={
            failed.length === 0
              ? "Nothing needs chasing"
              : "Surfaced below — a participant who never got a release notice is a meeting risk"
          }
          tone={failed.length > 0 ? "red" : "green"}
        />
        <Kpi
          label="Still in flight"
          value={pending.length}
          hint="Accepted by the channel, not yet confirmed"
          tone={pending.length > 0 ? "amber" : "neutral"}
        />
        <Kpi
          label="Your outstanding items"
          value={outstanding.length}
          hint="In the notification centre, unread"
          tone={outstanding.length > 0 ? "amber" : "neutral"}
        />
      </div>

      <section
        className="rounded-lg border"
        style={{ borderColor: offending.length > 0 ? "var(--viz-critical)" : "var(--viz-grid)" }}
      >
        <div className="flex items-start gap-3 p-4">
          <FiEyeOff
            size={18}
            className="mt-0.5 shrink-0"
            style={{
              color: offending.length > 0 ? "var(--viz-critical)" : undefined,
            }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              A notification says that something happened, never what it was
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              FR-NOT-06 and FR-NOT-07. Every template is written so that the
              message would tell an interceptor nothing: no paper title, no
              classification marking, no decision text, and no attachment at any
              classification. The recipient is sent into the platform to read the
              material, which is the only place it exists.
            </p>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {CONTENT_RULES.map((rule) => (
                <li
                  key={rule}
                  className="inline-flex items-start gap-1.5 text-xs text-neutral-600 dark:text-neutral-400"
                >
                  <FiShield
                    size={11}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--viz-good)" }}
                    aria-hidden="true"
                  />
                  {rule}
                </li>
              ))}
            </ul>
            <p className="mt-3 inline-flex items-center gap-2 text-sm">
              {offending.length === 0 ? (
                <>
                  <FiPaperclip size={13} style={{ color: "var(--viz-good)" }} aria-hidden="true" />
                  <span style={{ color: "var(--viz-good)" }}>
                    All {templates.length} templates pass the content check.
                  </span>
                </>
              ) : (
                <>
                  <FiAlertTriangle size={13} style={{ color: "var(--viz-critical)" }} aria-hidden="true" />
                  <span style={{ color: "var(--viz-critical)" }}>
                    {offending.length === 1
                      ? "1 template fails the content check"
                      : `${offending.length} templates fail the content check`}{" "}
                    and must not be sent.
                  </span>
                </>
              )}
              <Link
                href="/notifications/templates"
                className="inline-flex items-center gap-1.5 text-state-700 hover:underline dark:text-state-400"
              >
                Templates <FiArrowRight size={13} aria-hidden="true" />
              </Link>
            </p>
          </div>
        </div>
      </section>

      {failed.length > 0 && (
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
              Did not reach the recipient
            </span>
            <Link
              href="/notifications/failed-deliveries"
              className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
            >
              Failed deliveries <FiArrowRight size={13} aria-hidden="true" />
            </Link>
          </header>
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {failed.map((record) => (
              <li
                key={record.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {record.trigger} · {record.recipient}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {record.channel} · {record.attempts} attempts ·{" "}
                    {record.failureReason}
                  </span>
                </span>
                <StatusBadge tone="red">Failed</StatusBadge>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <DeliveryChart records={deliveries} />
        <TriggerChart records={deliveries} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <span className="inline-flex items-center gap-2 font-bold">
              <FiBell size={15} className="text-neutral-400" aria-hidden="true" />
              Rules in force
            </span>
            <Link
              href="/notifications/triggers"
              className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
            >
              Triggers and rules <FiArrowRight size={13} aria-hidden="true" />
            </Link>
          </header>
          <div className="px-5 py-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {rules.length} rules, of which {mandatory} are mandatory. A
              mandatory rule cannot be switched off by the recipient — FR-NOT-08
              lets a user narrow their own channels, not opt out of being told
              that a sitting was cancelled.
            </p>
            <ul className="mt-4 space-y-2">
              {rules.map((rule) => (
                <li
                  key={rule.id}
                  className="flex flex-wrap items-center justify-between gap-3 text-sm"
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    {rule.mandatory && (
                      <FiLock
                        size={11}
                        className="shrink-0 text-neutral-400"
                        aria-label="Mandatory"
                      />
                    )}
                    <span className="text-neutral-800 dark:text-neutral-200">
                      {rule.trigger}
                    </span>
                  </span>
                  <StatusBadge tone={triggerTone(rule.trigger)}>
                    {rule.requirement}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <span className="inline-flex items-center gap-2 font-bold">
              <FiLink2 size={15} className="text-neutral-400" aria-hidden="true" />
              Most recent
            </span>
            <Link
              href="/notifications/delivery-log"
              className="inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
            >
              Delivery log <FiArrowRight size={13} aria-hidden="true" />
            </Link>
          </header>
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {deliveries.slice(0, 7).map((record) => (
              <li
                key={record.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {record.trigger}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {record.recipient} · {record.channel} · {stamp(record.at)}
                  </span>
                </span>
                <StatusBadge
                  tone={
                    record.state === "Delivered"
                      ? "green"
                      : record.state === "Pending"
                        ? "amber"
                        : "red"
                  }
                >
                  {record.state}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <FiShield size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        The log records that a message was sent and what became of it. It does
        not record the message, because there is nothing in a message worth
        recording — the content stays where it has always been, inside the
        platform.
      </p>
    </div>
  );
}
