"use client";

import {
  FiAlertTriangle,
  FiCheckCircle,
  FiDatabase,
  FiHardDrive,
  FiLayers,
  FiLink,
  FiServer,
  FiXCircle,
} from "react-icons/fi";
import { StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectHealth } from "@/core/slices/admin-slice";
import { CAPACITY_WARNING_PERCENT, QUEUE_WARNING_DEPTH } from "@/data/administration";
import type { ServiceHealth } from "@/models/response/base-response";

const KIND_ICON: Record<ServiceHealth["kind"], typeof FiServer> = {
  Service: FiServer,
  Storage: FiHardDrive,
  Queue: FiLayers,
  Backup: FiDatabase,
  Integration: FiLink,
};

const STATUS_TONE: Record<ServiceHealth["status"], "green" | "amber" | "red"> = {
  Healthy: "green",
  Degraded: "amber",
  Down: "red",
};

const KINDS: ServiceHealth["kind"][] = [
  "Service",
  "Storage",
  "Queue",
  "Backup",
  "Integration",
];

/**
 * FR-ADM-06 — service status, storage capacity, queue depth, backup status and
 * integration status. All five, grouped as the requirement lists them, because
 * an operator scanning this screen is looking for one kind of thing at a time.
 */
export default function HealthBoard() {
  const services = useAppSelector(selectHealth);

  return (
    <div className="space-y-8">
      {KINDS.map((kind) => {
        const mine = services.filter((s) => s.kind === kind);
        if (mine.length === 0) return null;
        const Icon = KIND_ICON[kind];

        return (
          <section key={kind} className="space-y-3">
            <h2 className="inline-flex items-center gap-2 font-bold">
              <Icon size={15} className="text-neutral-400" aria-hidden="true" />
              {kind === "Service" ? "Services" : kind === "Storage" ? "Storage" : kind === "Queue" ? "Queues" : kind === "Backup" ? "Backup and replication" : "Integrations"}
            </h2>

            <ul className="grid gap-3 lg:grid-cols-2">
              {mine.map((service) => {
                const nearCapacity =
                  service.usedPercent !== undefined &&
                  service.usedPercent >= CAPACITY_WARNING_PERCENT;
                const backedUp =
                  service.queueDepth !== undefined &&
                  service.queueDepth >= QUEUE_WARNING_DEPTH;
                const bad = service.status === "Down";
                const warn = service.status === "Degraded" || nearCapacity || backedUp;

                return (
                  <li
                    key={service.id}
                    className="rounded-lg border bg-white p-4 dark:bg-neutral-900"
                    style={{
                      borderColor: bad
                        ? "var(--viz-critical)"
                        : warn
                          ? "var(--viz-warning)"
                          : "var(--viz-grid)",
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {service.name}
                        </p>
                        <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                          {service.detail}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-2">
                        {bad ? (
                          <FiXCircle
                            size={14}
                            style={{ color: "var(--viz-critical)" }}
                            aria-hidden="true"
                          />
                        ) : warn ? (
                          <FiAlertTriangle
                            size={14}
                            style={{ color: "var(--viz-warning)" }}
                            aria-hidden="true"
                          />
                        ) : (
                          <FiCheckCircle
                            size={14}
                            style={{ color: "var(--viz-good)" }}
                            aria-hidden="true"
                          />
                        )}
                        <StatusBadge tone={STATUS_TONE[service.status]}>
                          {service.status}
                        </StatusBadge>
                      </span>
                    </div>

                    {service.usedPercent !== undefined && (
                      <div className="mt-3">
                        <div
                          className="h-2 w-full overflow-hidden rounded-full"
                          style={{ background: "var(--viz-grid)" }}
                          role="img"
                          aria-label={`${service.usedPercent}% used`}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${service.usedPercent}%`,
                              background: nearCapacity
                                ? "var(--viz-critical)"
                                : "var(--viz-1)",
                            }}
                          />
                        </div>
                        <p className="mt-1 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                          {service.usedPercent}% used · warning at{" "}
                          {CAPACITY_WARNING_PERCENT}%
                        </p>
                      </div>
                    )}

                    {service.queueDepth !== undefined && (
                      <p className="mt-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                        <span
                          style={{
                            color: backedUp ? "var(--viz-critical)" : undefined,
                          }}
                        >
                          {service.queueDepth} waiting
                        </span>{" "}
                        · warning at {QUEUE_WARNING_DEPTH}
                      </p>
                    )}

                    <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      Checked {service.lastCheckedAt.replace("T", " ")}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
