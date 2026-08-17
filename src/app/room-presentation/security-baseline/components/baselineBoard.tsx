"use client";

import { FiAlertTriangle, FiCheck, FiShield, FiX } from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  baselineFailures,
  selectAssets,
  selectBaselineCompliance,
  selectBaselines,
  selectRooms,
} from "@/core/slices/rooms-slice";
import { remediateBaseline } from "@/core/thunks-rooms";
import { BASELINE_CONTROLS, SCREEN_LOCK_LIMIT_MINUTES } from "@/data/rooms";
import type { BaselineState } from "@/models/response/base-response";
import { COMPLIANT_COLOR, FAILING_COLOR } from "../../components/roomStatus";

/** The value each control reads on a device, and whether it passes. */
function controlState(baseline: BaselineState, controlId: string) {
  switch (controlId) {
    case "diskEncryption":
      return { pass: baseline.diskEncryption, value: baseline.diskEncryption ? "On" : "Off" };
    case "localFirewall":
      return { pass: baseline.localFirewall, value: baseline.localFirewall ? "On" : "Off" };
    case "antiMalware":
      return { pass: baseline.antiMalware, value: baseline.antiMalware ? "On" : "Off" };
    case "updatePolicy":
      return { pass: baseline.updatePolicy === "Current", value: baseline.updatePolicy };
    case "screenLock":
      return {
        pass: baseline.screenLockMinutes <= SCREEN_LOCK_LIMIT_MINUTES,
        value: `${baseline.screenLockMinutes} min`,
      };
    default:
      return {
        pass: baseline.localAdminRestricted,
        value: baseline.localAdminRestricted ? "Restricted" : "Present",
      };
  }
}

/** What remediating each control actually sets. */
const REMEDY: Record<string, Partial<BaselineState>> = {
  diskEncryption: { diskEncryption: true },
  localFirewall: { localFirewall: true },
  antiMalware: { antiMalware: true },
  updatePolicy: { updatePolicy: "Current" },
  screenLock: { screenLockMinutes: SCREEN_LOCK_LIMIT_MINUTES },
  localAdminRestricted: { localAdminRestricted: true },
};

export default function BaselineBoard() {
  const dispatch = useAppDispatch();
  const baselines = useAppSelector(selectBaselines);
  const assets = useAppSelector(selectAssets);
  const rooms = useAppSelector(selectRooms);
  const compliance = useAppSelector(selectBaselineCompliance);

  const failing = baselines.filter((b) => baselineFailures(b).length > 0);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {compliance.map((control) => (
          <article
            key={control.control}
            className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
              <FiShield size={14} className="text-neutral-400" aria-hidden="true" />
              {control.control}
            </h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {control.detail}
            </p>
            <p
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: control.failing === 0 ? COMPLIANT_COLOR : FAILING_COLOR }}
            >
              {control.failing === 0 ? (
                <FiCheck size={15} aria-hidden="true" />
              ) : (
                <FiAlertTriangle size={15} aria-hidden="true" />
              )}
              {control.compliant} of {control.compliant + control.failing} devices
            </p>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Compliance by device</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {failing.length} of {baselines.length} devices out of policy
          </p>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Device</Th>
              {BASELINE_CONTROLS.map((control) => (
                <Th key={control.id}>{control.label}</Th>
              ))}
              <Th>Last checked</Th>
            </tr>
          </thead>
          <tbody>
            {baselines.map((baseline) => {
              const asset = assets.find((a) => a.id === baseline.assetId);
              const room = rooms.find((r) => r.id === asset?.roomId);

              return (
                <tr
                  key={baseline.assetId}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  <Td>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {asset?.label ?? baseline.assetId}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {asset?.assetTag} · {room?.name}
                    </span>
                  </Td>

                  {BASELINE_CONTROLS.map((control) => {
                    const state = controlState(baseline, control.id);
                    return (
                      <Td key={control.id}>
                        <span
                          className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium"
                          style={{ color: state.pass ? COMPLIANT_COLOR : FAILING_COLOR }}
                        >
                          {state.pass ? (
                            <FiCheck size={13} aria-hidden="true" />
                          ) : (
                            <FiX size={13} aria-hidden="true" />
                          )}
                          {state.value}
                        </span>
                        {!state.pass && (
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                remediateBaseline({
                                  assetId: baseline.assetId,
                                  label: asset?.label ?? baseline.assetId,
                                  patch: REMEDY[control.id],
                                  what: control.label.toLowerCase(),
                                }),
                              )
                            }
                            className="mt-1 block text-[11px] font-medium text-state-700 hover:underline dark:text-state-400"
                          >
                            Remediate
                          </button>
                        )}
                      </Td>
                    );
                  })}

                  <Td>
                    <span className="font-mono text-xs">
                      {stamp(baseline.lastChecked)}
                    </span>
                    <span className="mt-1 block">
                      <StatusBadge
                        tone={baselineFailures(baseline).length === 0 ? "green" : "red"}
                      >
                        {baselineFailures(baseline).length === 0
                          ? "Compliant"
                          : `${baselineFailures(baseline).length} failing`}
                      </StatusBadge>
                    </span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Screen lock passes at {SCREEN_LOCK_LIMIT_MINUTES} minutes or less. A
          device that has not been checked recently is not the same as a device
          that passed — the date is part of the answer.
        </p>
      </section>
    </div>
  );
}
