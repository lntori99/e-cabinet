"use client";

import {
  FiBluetooth,
  FiCast,
  FiCheckCircle,
  FiHardDrive,
  FiShield,
  FiWifi,
} from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectPeripheralPolicies, selectRooms } from "@/core/slices/rooms-slice";
import { policyTone } from "../../components/roomStatus";

const CONTROLS = [
  {
    id: "usb",
    label: "USB mass storage",
    icon: FiHardDrive,
    detail:
      "Disabled unless a Government-approved controlled import and export procedure is in force — and then read-only, against a reference.",
  },
  {
    id: "wifi",
    label: "Wi-Fi",
    icon: FiWifi,
    detail: "Controlled by policy. A room endpoint has a wired path to the platform; wireless is an alternative route out.",
  },
  {
    id: "bluetooth",
    label: "Bluetooth",
    icon: FiBluetooth,
    detail: "Input devices only where it is on at all — no file transfer profiles.",
  },
  {
    id: "casting",
    label: "Wireless casting",
    icon: FiCast,
    detail:
      "Where permitted, requires moderator approval before anything reaches the screens, and isolates guest traffic from Cabinet data.",
  },
] as const;

export default function PeripheralBoard() {
  const policies = useAppSelector(selectPeripheralPolicies);
  const rooms = useAppSelector(selectRooms);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2">
        {CONTROLS.map((control) => (
          <article
            key={control.id}
            className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h2 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
              <control.icon size={16} className="text-neutral-400" aria-hidden="true" />
              {control.label}
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {control.detail}
            </p>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Applied per room</h2>

        <Table>
          <thead>
            <tr>
              <Th>Room</Th>
              <Th>USB mass storage</Th>
              <Th>Wi-Fi</Th>
              <Th>Bluetooth</Th>
              <Th>Wireless casting</Th>
              <Th>Guest traffic</Th>
              <Th>Applied</Th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => {
              const room = rooms.find((r) => r.id === policy.roomId);
              return (
                <tr key={policy.roomId}>
                  <Td>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {room?.name ?? policy.roomId}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {room?.location}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge tone={policyTone(policy.usbMassStorage)}>
                      {policy.usbMassStorage}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <StatusBadge tone={policyTone(policy.wifi)}>{policy.wifi}</StatusBadge>
                  </Td>
                  <Td>
                    <StatusBadge tone={policyTone(policy.bluetooth)}>
                      {policy.bluetooth}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <StatusBadge tone={policyTone(policy.wirelessCasting)}>
                      {policy.wirelessCasting}
                    </StatusBadge>
                    {policy.wirelessCasting === "Moderated" && (
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        Moderator approves each source
                      </span>
                    )}
                  </Td>
                  <Td>
                    {policy.guestTrafficIsolated ? (
                      <span
                        className="inline-flex items-center gap-1.5 whitespace-nowrap"
                        style={{ color: "var(--viz-good)" }}
                      >
                        <FiShield size={13} aria-hidden="true" />
                        Isolated
                      </span>
                    ) : (
                      <span style={{ color: "var(--viz-critical)" }}>Not isolated</span>
                    )}
                  </Td>
                  <Td>
                    <span className="font-mono text-xs">{stamp(policy.lastApplied)}</span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <FiCheckCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          The Cabinet Room runs the tightest configuration: no USB, no Wi-Fi, no
          casting. Committee Room B is relaxed for working sessions, which is why
          its transfers are read-only and its casting is moderated.
        </p>
      </section>
    </div>
  );
}
