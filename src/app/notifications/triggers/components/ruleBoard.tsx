"use client";

import { FiClock, FiLock, FiTrendingUp, FiUsers } from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectRules } from "@/core/slices/notification-slice";
import { updateLeadTime } from "@/core/thunks-notifications";
import {
  CHANNEL_COLOR,
  isReminderRule,
  leadWords,
  serviceWords,
} from "../../components/notificationStatus";

/** The lead times an officer can pick, in hours. */
const LEAD_OPTIONS: (number | null)[] = [null, 24, 48, 72, 168];

/**
 * FR-NOT-01 to FR-NOT-05 in one register: which event notifies whom, down which
 * channel, how far ahead the reminder goes and where the item escalates. The
 * lead time is editable because it is a policy setting; the recipient list is
 * not, because it comes from the role model rather than from this screen.
 */
export default function RuleBoard() {
  const dispatch = useAppDispatch();
  const rules = useAppSelector(selectRules);

  const grouped = ["FR-NOT-01", "FR-NOT-02", "FR-NOT-03", "FR-NOT-04", "FR-NOT-05"];

  return (
    <div className="space-y-8">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <FiLock size={18} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            Recipients are roles, resolved when the notification is sent
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            No rule names a person. A rule names the role that must be told, and
            membership of that role is read at send time — so a Minister
            appointed this morning is notified this afternoon without anybody
            editing a list.
          </p>
        </div>
      </section>

      {grouped.map((requirement) => {
        const mine = rules.filter((r) => r.requirement === requirement);
        if (mine.length === 0) return null;

        return (
          <section key={requirement} className="space-y-3">
            <h2 className="font-bold">
              {requirement} —{" "}
              {requirement === "FR-NOT-01"
                ? "meetings"
                : requirement === "FR-NOT-02"
                  ? "packs and versions"
                  : requirement === "FR-NOT-03"
                    ? "submission deadlines"
                    : requirement === "FR-NOT-04"
                      ? "clearance"
                      : "actions"}
            </h2>

            <Table>
              <thead>
                <tr>
                  <Th>Event</Th>
                  <Th>Who is told</Th>
                  <Th>Channels</Th>
                  <Th>Reminder</Th>
                  <Th>Escalation</Th>
                  <Th>Suppressible</Th>
                </tr>
              </thead>
              <tbody>
                {mine.map((rule) => (
                  <tr key={rule.id}>
                    <Td>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {rule.trigger}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {rule.id}
                      </span>
                    </Td>
                    <Td>
                      <span className="inline-flex items-start gap-1.5">
                        <FiUsers
                          size={12}
                          className="mt-0.5 shrink-0 text-neutral-400"
                          aria-hidden="true"
                        />
                        {rule.recipients.join(", ")}
                      </span>
                    </Td>
                    <Td>
                      <span className="flex flex-wrap items-center gap-2">
                        {rule.channels.map((channel) => (
                          <span
                            key={channel}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs"
                          >
                            <span
                              className="h-2 w-2 shrink-0 rounded-[2px]"
                              style={{ background: CHANNEL_COLOR[channel] }}
                              aria-hidden="true"
                            />
                            {channel}
                          </span>
                        ))}
                      </span>
                    </Td>
                    <Td>
                      {!isReminderRule(rule.trigger) ? (
                        <span className="text-neutral-500 dark:text-neutral-400">
                          Fires on the event
                        </span>
                      ) : (
                        <label className="block">
                          <span className="sr-only">
                            Reminder lead time for {rule.trigger}
                          </span>
                          <select
                            value={String(rule.reminderLeadHours)}
                            onChange={(e) =>
                              dispatch(
                                updateLeadTime(
                                  rule,
                                  e.target.value === "null"
                                    ? null
                                    : Number(e.target.value),
                                ),
                              )
                            }
                            className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-900 outline-none transition focus:border-state-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                          >
                            {LEAD_OPTIONS.map((option) => (
                              <option key={String(option)} value={String(option)}>
                                {leadWords(option)}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </Td>
                    <Td>
                      {rule.escalateAfterHours === null ? (
                        <span className="text-neutral-500 dark:text-neutral-400">
                          None
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 whitespace-nowrap"
                          style={{ color: "var(--viz-warning)" }}
                        >
                          <FiTrendingUp size={12} aria-hidden="true" />
                          {serviceWords(rule.escalateAfterHours)}
                        </span>
                      )}
                    </Td>
                    <Td>
                      {rule.mandatory ? (
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-neutral-600 dark:text-neutral-300">
                          <FiLock size={12} aria-hidden="true" />
                          No — mandatory
                        </span>
                      ) : (
                        <StatusBadge tone="neutral">User may narrow</StatusBadge>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </section>
        );
      })}

      <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <FiClock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        Changing a lead time changes when the reminder goes out, not whether it
        does. FR-NOT-08 allows a user to narrow their own channels on the rules
        marked suppressible; the rest are sent whatever anybody has configured.
      </p>
    </div>
  );
}
