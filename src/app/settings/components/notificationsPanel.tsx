"use client";

import { FiBell, FiMail } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  notificationToggled,
  selectNotifications,
} from "@/core/slices/preferences-slice";
import SettingsCard from "./settingsCard";

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition ${
        checked ? "bg-state-600" : "bg-neutral-300 dark:bg-neutral-700"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
          checked ? "left-4.5" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function NotificationsPanel() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);

  function toggle(id: string, channel: "email" | "inApp", value: boolean) {
    dispatch(
      notificationToggled({
        id,
        channel,
        value,
        at: new Date().toISOString().slice(0, 16),
      }),
    );
  }

  return (
    <SettingsCard
      title="What reaches you"
      description="Notifications about your own work. Alerts that exist for oversight — a break-glass grant, a recalled pack — are sent whatever you choose here, because someone has to receive them."
    >
      <div className="mb-3 hidden items-center justify-end gap-6 pr-1 sm:flex">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          <FiMail size={12} aria-hidden="true" /> Email
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          <FiBell size={12} aria-hidden="true" /> In console
        </span>
      </div>

      <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {notifications.map((channel) => (
          <li
            key={channel.id}
            className="flex flex-wrap items-start justify-between gap-4 py-3.5"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {channel.label}
              </span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                {channel.detail}
              </span>
            </span>

            <span className="flex items-center gap-6">
              <span className="flex items-center gap-2 sm:gap-0">
                <span className="text-xs text-neutral-500 sm:hidden">Email</span>
                <Switch
                  checked={channel.email}
                  onChange={(value) => toggle(channel.id, "email", value)}
                  label={`Email me when ${channel.label.toLowerCase()}`}
                />
              </span>
              <span className="flex items-center gap-2 sm:gap-0">
                <span className="text-xs text-neutral-500 sm:hidden">Console</span>
                <Switch
                  checked={channel.inApp}
                  onChange={(value) => toggle(channel.id, "inApp", value)}
                  label={`Notify me in the console when ${channel.label.toLowerCase()}`}
                />
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
        Email leaves the platform. Anything classified above RESTRICTED is
        notified by reference only — the notification tells you something is
        waiting, never what it says.
      </p>
    </SettingsCard>
  );
}
