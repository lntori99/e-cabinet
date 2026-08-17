"use client";

import { FiArrowUpCircle, FiMapPin, FiMonitor, FiXCircle } from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { distance, hoursUntil, stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { OPERATOR } from "@/core/app-constants";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectDevices, selectSessions } from "@/core/slices/identity-slice";
import { revokeSession } from "@/core/thunks-identity";
import { sessionPolicy } from "@/data/identityAccess";
import { DEVICE_TONE, SESSION_TONE } from "../../identity-access/components/iamStatus";
import SettingsCard from "./settingsCard";

/** The signed-in operator is USR-003 in the seeded directory. */
const ME = "USR-003";

export default function SessionsPanel({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector(selectSessions).filter((s) => s.userId === ME);
  const devices = useAppSelector(selectDevices).filter((d) => d.ownerId === ME);
  const policy = sessionPolicy("Secretariat Administrator");

  const live = sessions.filter((s) => s.status !== "Revoked");

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Where you are signed in"
        description="Every session currently holding a token in your name. Ending one takes its cached access with it — there is no soft close."
      >
        {live.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            You have no other open session.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Device</Th>
                <Th>Where from</Th>
                <Th>Expires</Th>
                <Th>State</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {live.map((session) => (
                <tr key={session.id}>
                  <Td>
                    <span className="inline-flex items-center gap-2 font-medium text-neutral-900 dark:text-neutral-100">
                      <FiMonitor size={14} className="text-neutral-400" aria-hidden="true" />
                      {session.device}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {session.id} · {session.mfaMethod}
                    </span>
                    {session.elevated && (
                      <span
                        className="mt-1 inline-flex items-center gap-1.5 text-xs"
                        style={{ color: "var(--viz-warning)" }}
                      >
                        <FiArrowUpCircle size={11} aria-hidden="true" />
                        Elevated for a privileged action
                      </span>
                    )}
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5">
                      <FiMapPin size={12} className="text-neutral-400" aria-hidden="true" />
                      {session.location}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {session.ip} · started {stamp(session.startedAt)}
                    </span>
                  </Td>
                  <Td>
                    <span className="whitespace-nowrap">
                      {distance(hoursUntil(session.expiresAt, now))}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge tone={SESSION_TONE[session.status]}>
                      {session.status}
                    </StatusBadge>
                  </Td>
                  <Td align="right">
                    <button
                      type="button"
                      onClick={() => dispatch(revokeSession(session.id, OPERATOR.name))}
                      className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                    >
                      <FiXCircle size={14} aria-hidden="true" />
                      End session
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          Your role allows {policy.concurrentSessions} concurrent sessions and signs
          you out after {policy.timeoutMinutes} minutes idle.{" "}
          {policy.reauthOnElevation
            ? "Raising a session for a privileged action asks for a factor again."
            : ""}
        </p>
      </SettingsCard>

      <SettingsCard
        title="Your devices"
        description="Classified material opens only on a managed device with a valid certificate and a current attestation. The device's trust level caps what you can reach, whatever your role allows."
      >
        {devices.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No device is registered to you.
          </p>
        ) : (
          <ul className="space-y-2">
            {devices.map((device) => (
              <li
                key={device.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {device.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {device.kind} · certificate {device.certificateSerial} · expires{" "}
                    {device.expiresAt}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    Reaches {device.maxClassification} · last seen{" "}
                    {stamp(device.lastSeen)}
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={DEVICE_TONE[device.attestation]}>
                    {device.attestation}
                  </StatusBadge>
                  <StatusBadge tone={device.status === "Trusted" ? "green" : "red"}>
                    {device.status}
                  </StatusBadge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </SettingsCard>
    </div>
  );
}
