"use client";

import { useMemo, useState } from "react";
import { FiRotateCcw, FiSearch } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { controlCls, filterCls } from "@/common/field";
import { Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectDeliveries } from "@/core/slices/notification-slice";
import { CHANNELS, TRIGGERS } from "@/data/notifications";
import {
  DELIVERY_TONE,
  TRIGGER_REQUIREMENT,
} from "../../components/notificationStatus";

const ALL = "All";
const STATES = [ALL, "Delivered", "Pending", "Failed"];

/**
 * FR-NOT-10 — every notification sent, with the outcome. The columns are the
 * ones an investigation actually needs: who it went to, down which channel,
 * what happened, and which record it pointed at. The message body is not here
 * because the message has no body worth keeping.
 */
export default function DeliveryLog() {
  const deliveries = useAppSelector(selectDeliveries);

  const [query, setQuery] = useState("");
  const [trigger, setTrigger] = useState(ALL);
  const [channel, setChannel] = useState(ALL);
  const [state, setState] = useState(ALL);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deliveries.filter(
      (record) =>
        (trigger === ALL || record.trigger === trigger) &&
        (channel === ALL || record.channel === channel) &&
        (state === ALL || record.state === state) &&
        (q.length === 0 ||
          record.recipient.toLowerCase().includes(q) ||
          record.subjectRef.toLowerCase().includes(q) ||
          record.id.toLowerCase().includes(q)),
    );
  }, [deliveries, query, trigger, channel, state]);

  const dirty =
    query.trim().length > 0 || trigger !== ALL || channel !== ALL || state !== ALL;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="relative min-w-[16rem] flex-1">
          <FiSearch
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by recipient, record reference or notification ID"
            aria-label="Search the delivery log"
            className={`${controlCls} pl-9`}
          />
        </label>
        <select
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          aria-label="Filter by trigger"
          className={filterCls}
        >
          {[ALL, ...TRIGGERS].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          aria-label="Filter by channel"
          className={filterCls}
        >
          {[ALL, ...CHANNELS].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          aria-label="Filter by delivery state"
          className={filterCls}
        >
          {STATES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {dirty && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setTrigger(ALL);
              setChannel(ALL);
              setState(ALL);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
          >
            <FiRotateCcw size={14} aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {shown.length} of {deliveries.length} notifications
      </p>

      {shown.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={FiSearch}
            title="Nothing matches"
            description="No notification matches that combination of trigger, channel and outcome."
          />
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Sent</Th>
              <Th>Trigger</Th>
              <Th>Recipient</Th>
              <Th>Channel</Th>
              <Th>Points at</Th>
              <Th>Outcome</Th>
            </tr>
          </thead>
          <tbody>
            {shown.map((record) => (
              <tr
                key={record.id}
                className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
              >
                <Td>
                  <span className="whitespace-nowrap font-mono">
                    {stamp(record.at)}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {record.id}
                  </span>
                </Td>
                <Td>
                  <span className="text-neutral-800 dark:text-neutral-200">
                    {record.trigger}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {TRIGGER_REQUIREMENT[record.trigger]} · {record.templateId}
                  </span>
                </Td>
                <Td>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {record.recipient}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {record.role}
                  </span>
                </Td>
                <Td>{record.channel}</Td>
                <Td>
                  <span className="font-mono text-xs">{record.subjectRef}</span>
                </Td>
                <Td>
                  <StatusBadge tone={DELIVERY_TONE[record.state]}>
                    {record.state}
                  </StatusBadge>
                  {record.attempts > 1 && (
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {record.attempts} attempts
                    </span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        The column that is not here is the message. A notification carries a
        template reference and a record reference; there is no body to log, which
        is the point of FR-NOT-06.
      </p>
    </div>
  );
}
