"use client";

import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiShieldOff,
  FiUnlock,
} from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { distance, hoursUntil, stamp } from "@/common/time";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectDevices } from "@/core/slices/identity-slice";
import { selectUsers } from "@/core/slices/users-slice";
import { setDeviceTrust } from "@/core/thunks-identity";
import { rolePermissions } from "@/data/identityAccess";
import type { TrustedDevice } from "@/models/response/base-response";
import { DEVICE_TONE, userById, userName } from "../../components/iamStatus";

const ATTESTATION_ICON = {
  Attested: FiCheckCircle,
  "Attestation stale": FiClock,
  Failed: FiAlertTriangle,
} as const;

const ATTESTATION_COLOR = {
  Attested: "var(--viz-good)",
  "Attestation stale": "var(--viz-warning)",
  Failed: "var(--viz-critical)",
} as const;

/**
 * The effective ceiling is the lower of what the role allows and what the
 * device is attested to hold — which is the point of device trust, and the
 * thing an administrator most often needs to see spelled out.
 */
function effectiveCeiling(device: TrustedDevice, roleCeiling: string) {
  if (device.status === "Blocked" || device.attestation === "Failed") {
    return "No access from this device";
  }
  return device.maxClassification === roleCeiling
    ? device.maxClassification
    : `${device.maxClassification} — capped by the device`;
}

export default function DeviceBoard({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const devices = useAppSelector(selectDevices);
  const users = useAppSelector(selectUsers);

  const trusted = devices.filter(
    (d) => d.status === "Trusted" && d.attestation === "Attested",
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            ["Trusted", trusted, "Certificate valid, attestation current"],
            [
              "Attestation stale",
              devices.filter((d) => d.attestation === "Attestation stale").length,
              "Still trusted, but capped until it re-attests",
            ],
            [
              "Blocked",
              devices.filter((d) => d.status === "Blocked").length,
              "Refused at sign-in, whatever the role allows",
            ],
          ] as const
        ).map(([label, value, hint]) => (
          <div
            key={label}
            className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {value}
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
          </div>
        ))}
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Device</Th>
            <Th>Holder</Th>
            <Th>Certificate</Th>
            <Th>Attestation</Th>
            <Th>Reaches</Th>
            <Th align="right">Action</Th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => {
            const owner = userById(users, device.ownerId);
            const roleCeiling = owner
              ? rolePermissions(owner.role).classificationCeiling
              : device.maxClassification;
            const Icon = ATTESTATION_ICON[device.attestation];
            const expiry = hoursUntil(`${device.expiresAt}T00:00`, now);

            return (
              <tr
                key={device.id}
                className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
              >
                <Td>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {device.label}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {device.id} · {device.kind}
                  </span>
                </Td>
                <Td>
                  {userName(users, device.ownerId)}
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    Last seen {stamp(device.lastSeen)}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono">{device.certificateSerial}</span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    Expires {device.expiresAt} · {distance(expiry)}
                  </span>
                </Td>
                <Td>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <Icon
                      size={14}
                      style={{ color: ATTESTATION_COLOR[device.attestation] }}
                      aria-hidden="true"
                    />
                    {device.attestation}
                  </span>
                  <span className="mt-1 block">
                    <StatusBadge
                      tone={
                        device.status === "Blocked"
                          ? "red"
                          : DEVICE_TONE[device.attestation]
                      }
                    >
                      {device.status}
                    </StatusBadge>
                  </span>
                </Td>
                <Td>
                  {device.status === "Blocked" || device.attestation === "Failed" ? (
                    <span style={{ color: "var(--viz-critical)" }}>
                      {effectiveCeiling(device, roleCeiling)}
                    </span>
                  ) : (
                    <>
                      <span className={`stamp ${classificationTone(device.maxClassification)}`}>
                        {device.maxClassification}
                      </span>
                      {device.maxClassification !== roleCeiling && (
                        <span className="mt-1 block text-xs text-neutral-500 dark:text-neutral-400">
                          Role allows {roleCeiling} — the device caps it
                        </span>
                      )}
                    </>
                  )}
                </Td>
                <Td align="right">
                  {device.status === "Trusted" ? (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(setDeviceTrust(device.id, device.label, "Blocked"))
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                    >
                      <FiShieldOff size={14} aria-hidden="true" />
                      Block
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(setDeviceTrust(device.id, device.label, "Trusted"))
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-state-600 px-3 py-1.5 text-sm font-medium text-state-700 transition hover:bg-state-600 hover:text-white dark:text-state-400"
                    >
                      <FiUnlock size={14} aria-hidden="true" />
                      Restore
                    </button>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        A device whose attestation has gone stale keeps working but is held to a
        lower ceiling until it re-attests. A failed attestation is refused
        outright — the certificate alone is not enough.
      </p>
    </div>
  );
}
