"use client";

import { FiLock, FiShield } from "react-icons/fi";
import { StatusBadge } from "@/common/ui";
import { OPERATOR } from "@/core/app-constants";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectPreferences, selectRules } from "@/core/slices/notification-slice";
import { togglePreference } from "@/core/thunks-notifications";
import { CHANNELS } from "@/data/notifications";
import type { NotificationChannel } from "@/models/response/base-response";
import {
  CHANNEL_COLOR,
  TRIGGER_REQUIREMENT,
} from "../../components/notificationStatus";

/**
 * FR-NOT-08 — a user configures their own preferences, within limits set by
 * policy. The limit is not advisory: a mandatory notification renders locked
 * and the reducer refuses the change even if the control were reached another
 * way. Nobody opts out of being told that a sitting was cancelled.
 */
export default function PreferenceBoard() {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(selectPreferences);
  const rules = useAppSelector(selectRules);

  const optional = preferences.filter((p) => !p.mandatory);
  const mandatory = preferences.filter((p) => p.mandatory);

  return (
    <div className="space-y-8">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <FiShield size={18} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            Settings for {OPERATOR.name} · {OPERATOR.role}
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            You may choose how you are told, not whether. {mandatory.length} of
            these {preferences.length} notifications are mandatory under policy
            and are shown locked — the in-platform notice always arrives, and the
            others are the ones you can narrow.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">You may change these</h2>
        {optional.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Every notification in force for your role is mandatory.
          </p>
        ) : (
          <ul className="space-y-2">
            {optional.map((pref) => (
              <li
                key={pref.trigger}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <span className="min-w-0">
                  <span className="block font-medium text-neutral-900 dark:text-neutral-100">
                    {pref.trigger}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {TRIGGER_REQUIREMENT[pref.trigger]}
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  {CHANNELS.map((channel) => (
                    <ChannelToggle
                      key={channel}
                      channel={channel}
                      on={pref.channels.includes(channel)}
                      onToggle={() =>
                        dispatch(togglePreference(pref.trigger, channel, false))
                      }
                    />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">These are sent whatever you set</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          A cancelled sitting, a released pack, an escalated action. Each of
          these changes what somebody has to do today, so policy does not allow
          it to be switched off.
        </p>
        <ul className="space-y-2">
          {mandatory.map((pref) => {
            const rule = rules.find((r) => r.trigger === pref.trigger);
            return (
              <li
                key={pref.trigger}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <span className="min-w-0">
                  <span className="block font-medium text-neutral-800 dark:text-neutral-200">
                    {pref.trigger}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {rule?.recipients.join(", ")}
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-3">
                  <span className="flex flex-wrap items-center gap-2">
                    {pref.channels.map((channel) => (
                      <span
                        key={channel}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
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
                  <StatusBadge tone="neutral">
                    <span className="inline-flex items-center gap-1">
                      <FiLock size={10} aria-hidden="true" />
                      Locked
                    </span>
                  </StatusBadge>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function ChannelToggle({
  channel,
  on,
  onToggle,
}: {
  channel: NotificationChannel;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition ${
        on
          ? "border-state-500 bg-state-50 text-state-800 dark:bg-state-900/30 dark:text-state-300"
          : "border-neutral-300 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
      }`}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-[2px]"
        style={{ background: on ? CHANNEL_COLOR[channel] : "var(--viz-axis)" }}
        aria-hidden="true"
      />
      {channel}
      <span className="sr-only">{on ? "on" : "off"}</span>
    </button>
  );
}
