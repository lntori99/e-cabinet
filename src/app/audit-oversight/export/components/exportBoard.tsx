"use client";

import { useState } from "react";
import { FiDownload, FiHash, FiShield } from "react-icons/fi";
import { Field, Select, TextArea, TextInput } from "@/common/field";
import { DetailRow } from "@/common/table";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectAuditLog, selectExports } from "@/core/slices/oversight-slice";
import { takeExport } from "@/core/thunks-oversight";
import type { ExportRecord } from "@/models/response/base-response";

const FORMATS: ExportRecord["format"][] = ["CSV", "JSON", "PDF"];

/**
 * FR-AUD-14 — evidential export. What makes an export evidential is not the
 * file format: it is the digest the recipient can check the file against, and a
 * named officer attesting that this is what the log said. Both are required
 * here, and the export itself is logged as an act.
 */
export default function ExportBoard() {
  const dispatch = useAppDispatch();
  const exports = useAppSelector(selectExports);
  const log = useAppSelector(selectAuditLog);

  const [scope, setScope] = useState("");
  const [purpose, setPurpose] = useState("");
  const [format, setFormat] = useState<ExportRecord["format"]>("CSV");
  const [releasedTo, setReleasedTo] = useState("Office of the Chief Secretary");

  const ready = scope.trim().length > 0 && purpose.trim().length > 0;

  return (
    <div className="space-y-8">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <FiShield size={18} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            An export is not a download
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            The file leaves the platform, so it carries a digest the recipient
            checks it against and the name of the officer attesting that it is
            what the log said. Taking one is itself an audited act — the record
            of the export outlives the file.
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-bold">Take an export</h2>

        <Field
          label="Scope"
          hint="What range of the log this covers. Written on the attestation."
        >
          <TextInput
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="All events for account j.tembo, 2026-08-01 to 2026-08-15"
          />
        </Field>

        <Field label="Purpose" hint="Why it is being taken. An export without a reason is a copy.">
          <TextArea
            rows={2}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Format">
            <Select
              value={format}
              options={FORMATS}
              onChange={(e) => setFormat(e.target.value as ExportRecord["format"])}
            />
          </Field>
          <Field label="Released to" hint="A named recipient, not a location on a disk.">
            <TextInput
              value={releasedTo}
              onChange={(e) => setReleasedTo(e.target.value)}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {log.length} events are readable in the current scope. Attestation by
            the Chief Secretary.
          </p>
          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              dispatch(
                takeExport(scope.trim(), purpose.trim(), log.length, format, releasedTo.trim()),
              );
              setScope("");
              setPurpose("");
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-state-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiDownload size={15} aria-hidden="true" />
            Export with attestation
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-bold">Exports taken</h2>
        {exports.map((record) => (
          <article
            key={record.id}
            className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {record.id} · {record.at.replace("T", " ")}
                </p>
                <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                  {record.purpose}
                </h3>
              </div>
              <StatusBadge tone="neutral">{record.format}</StatusBadge>
            </header>

            <div className="grid gap-x-6 px-5 py-4 lg:grid-cols-2">
              <div className="space-y-0.5">
                <DetailRow label="Scope" value={record.scope} />
                <DetailRow label="Rows" value={record.rows.toLocaleString()} />
                <DetailRow label="Requested by" value={record.requestedBy} />
              </div>
              <div className="space-y-0.5">
                <DetailRow label="Attested by" value={record.attestedBy} />
                <DetailRow label="Released to" value={record.releasedTo} />
              </div>
            </div>

            <div className="border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
              <p className="inline-flex items-start gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                <FiHash size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
                Digest
              </p>
              <p className="mt-1 break-all font-mono text-xs text-neutral-600 dark:text-neutral-300">
                {record.digest}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
