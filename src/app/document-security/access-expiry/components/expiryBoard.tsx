"use client";

import { useMemo } from "react";
import { FiCalendar, FiClock, FiUserX } from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { distance, hoursUntil, stamp } from "@/common/time";
import { classificationTone } from "@/common/ui";
import { HANDLING_RULES } from "@/data/documentSecurity";
import { seedAccessExpiry } from "@/data/documentSecurity";
import type { AccessExpiry } from "@/models/response/base-response";

const BASIS_ICON = {
  "Meeting end": FiCalendar,
  "Retention period": FiClock,
  "Role loss": FiUserX,
} as const;

const BASIS_NOTE = {
  "Meeting end": "Closes when the sitting rises",
  "Retention period": "Closes when the classification's period runs out",
  "Role loss": "Closes the moment the reader leaves the role",
} as const;

export default function ExpiryBoard({ now }: { now: string }) {
  const rows = useMemo(
    () =>
      [...seedAccessExpiry].sort((a, b) => a.expiresAt.localeCompare(b.expiresAt)),
    [],
  );

  const soon = rows.filter((row) => {
    const hours = hoursUntil(row.expiresAt, now);
    return hours > 0 && hours <= 72;
  });

  function tone(row: AccessExpiry) {
    const hours = hoursUntil(row.expiresAt, now);
    if (hours <= 0) return "var(--viz-axis)";
    if (hours <= 72) return "var(--viz-warning)";
    return "var(--viz-good)";
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            ["Documents with a clock", rows.length, "Every held document has one"],
            ["Closing within 3 days", soon.length, "Readers lose access without notice"],
            [
              "Already closed",
              rows.filter((r) => hoursUntil(r.expiresAt, now) <= 0).length,
              "Access ended; the record is retained",
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

      <section className="space-y-3">
        <h2 className="font-bold">Expiring access</h2>

        <Table>
          <thead>
            <tr>
              <Th>Document</Th>
              <Th>Classification</Th>
              <Th>Basis</Th>
              <Th>Expires</Th>
              <Th align="right">Holders</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const Icon = BASIS_ICON[row.basis];
              const hours = hoursUntil(row.expiresAt, now);

              return (
                <tr
                  key={row.documentId}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  <Td>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {row.title}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {row.documentId}
                      {row.meetingId ? ` · ${row.meetingId}` : ""}
                    </span>
                  </Td>
                  <Td>
                    <span className={`stamp ${classificationTone(row.classification)}`}>
                      {row.classification}
                    </span>
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <Icon size={13} className="text-neutral-400" aria-hidden="true" />
                      {row.basis}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {BASIS_NOTE[row.basis]}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className="font-medium whitespace-nowrap"
                      style={{ color: tone(row) }}
                    >
                      {hours <= 0 ? "Closed" : distance(hours)}
                    </span>
                    <span className="mt-0.5 block font-mono text-xs text-neutral-500 dark:text-neutral-400">
                      {stamp(row.expiresAt)}
                    </span>
                  </Td>
                  <Td align="right">
                    <span className="font-mono">{row.holders}</span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-bold">Retention by classification</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            How long access survives the sitting, per label. Retention of the
            record itself is a separate matter — it is governed by the
            document&apos;s retention class and the National Archives schedule.
          </p>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Classification</Th>
              <Th align="right">Access retained for</Th>
              <Th>Then</Th>
            </tr>
          </thead>
          <tbody>
            {HANDLING_RULES.map((rule) => (
              <tr key={rule.classification}>
                <Td>
                  <span className={`stamp ${classificationTone(rule.classification)}`}>
                    {rule.classification}
                  </span>
                </Td>
                <Td align="right">
                  <span className="font-mono whitespace-nowrap">
                    {rule.retentionDays === 0
                      ? "Meeting end"
                      : `${rule.retentionDays} days`}
                  </span>
                </Td>
                <Td>
                  Access closes for every holder. The document, its versions and
                  its access history stay on the record.
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </div>
  );
}
