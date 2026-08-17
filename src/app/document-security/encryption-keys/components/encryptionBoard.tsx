"use client";

import {
  FiAlertTriangle,
  FiCheckCircle,
  FiCpu,
  FiLock,
  FiShield,
} from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { daysBetween } from "../../components/docStatus";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { ENCRYPTION_LAYERS, KEY_RECORDS } from "@/data/documentSecurity";
import type { EncryptionLayer } from "@/models/response/base-response";

const STATE_TONE: Record<EncryptionLayer["state"], "green" | "amber" | "red"> = {
  Encrypted: "green",
  Partial: "amber",
  "Not encrypted": "red",
};

export default function EncryptionBoard() {
  const today = new Date().toISOString().slice(0, 10);
  const unprotected = ENCRYPTION_LAYERS.filter((l) => l.state !== "Encrypted");
  const exportable = KEY_RECORDS.filter((k) => k.exportable);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2">
        <article
          className="flex items-start gap-3 rounded-lg border p-4"
          style={{
            borderColor:
              unprotected.length === 0 ? "var(--viz-good)" : "var(--viz-critical)",
          }}
        >
          {unprotected.length === 0 ? (
            <FiCheckCircle
              size={18}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--viz-good)" }}
              aria-hidden="true"
            />
          ) : (
            <FiAlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--viz-critical)" }}
              aria-hidden="true"
            />
          )}
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {unprotected.length === 0
                ? "Every layer is encrypted"
                : `${unprotected.length} layers are not fully encrypted`}
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              FR-DOC-05 covers the places a document leaves a trace: the store, its
              metadata, the search index, backups and temporary caches.
            </p>
          </div>
        </article>

        <article
          className="flex items-start gap-3 rounded-lg border p-4"
          style={{
            borderColor:
              exportable.length === 0 ? "var(--viz-good)" : "var(--viz-critical)",
          }}
        >
          <FiCpu
            size={18}
            className="mt-0.5 shrink-0"
            style={{
              color: exportable.length === 0 ? "var(--viz-good)" : "var(--viz-critical)",
            }}
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {exportable.length === 0
                ? "No key is recoverable from the application"
                : `${exportable.length} keys are exportable`}
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              FR-DOC-07 — keys are held in the hardware security module tier. The
              application asks the module to encrypt and decrypt; it never holds
              the key material itself.
            </p>
          </div>
        </article>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-bold">Encryption state</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Verified by the platform against each layer, not asserted in
            configuration.
          </p>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Layer</Th>
              <Th>State</Th>
              <Th>Algorithm</Th>
              <Th>Key tier</Th>
              <Th>Last verified</Th>
            </tr>
          </thead>
          <tbody>
            {ENCRYPTION_LAYERS.map((layer) => (
              <tr key={layer.id}>
                <Td>
                  <span className="inline-flex items-center gap-2 font-medium text-neutral-900 dark:text-neutral-100">
                    <FiLock size={13} className="text-neutral-400" aria-hidden="true" />
                    {layer.layer}
                  </span>
                  {layer.note && (
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {layer.note}
                    </span>
                  )}
                </Td>
                <Td>
                  <StatusBadge tone={STATE_TONE[layer.state]}>{layer.state}</StatusBadge>
                </Td>
                <Td>
                  <span className="font-mono text-xs">{layer.algorithm}</span>
                </Td>
                <Td>
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{
                      color: layer.keyTier === "HSM" ? "var(--viz-good)" : "var(--viz-critical)",
                    }}
                  >
                    <FiShield size={12} aria-hidden="true" />
                    {layer.keyTier}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono">{stamp(layer.lastVerified)}</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-bold">Keys</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Held in the module, rotated on a schedule. A key that could be exported
            would put document content within reach of the application layer, which
            is precisely what FR-DOC-07 forbids.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {KEY_RECORDS.map((key) => {
            const days = daysBetween(today, key.nextRotation);
            return (
              <article
                key={key.id}
                className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {key.id}
                    </p>
                    <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                      {key.label}
                    </h3>
                  </div>
                  <StatusBadge tone={key.exportable ? "red" : "green"}>
                    {key.exportable ? "Exportable" : "Non-exportable"}
                  </StatusBadge>
                </header>

                <div className="mt-3 space-y-0.5">
                  <DetailRow label="Purpose" value={key.purpose} />
                  <DetailRow label="Module" value={key.module} />
                  <DetailRow label="Last rotated" value={key.rotatedAt} />
                  <DetailRow
                    label="Next rotation"
                    value={
                      <span
                        style={{
                          color: days <= 30 ? "var(--viz-warning)" : undefined,
                        }}
                      >
                        {key.nextRotation} · in {Math.round(days)} days
                      </span>
                    }
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        FR-DOC-06 — data in transit uses approved current protocols and cipher
        suites, and anything older is refused at the edge rather than negotiated
        down.
      </p>
    </div>
  );
}
