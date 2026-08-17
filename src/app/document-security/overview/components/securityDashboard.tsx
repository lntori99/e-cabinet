"use client";

import Link from "next/link";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiHardDrive,
  FiXOctagon,
} from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { Kpi, StatusBadge, classificationTone } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import { selectDocuments } from "@/core/slices/documents-slice";
import {
  selectActiveRevocations,
  selectEndpointExceptions,
  selectFailingEndpoints,
  selectPendingReclassifications,
  selectPendingTransfers,
} from "@/core/slices/docsec-slice";
import { seedHandlingDays } from "@/data/documentSecurity";
import {
  VERIFICATION_COLOR,
  VERIFICATION_TONE,
  endpointExceptions,
} from "../../components/docStatus";
import ClassificationChart from "./classificationChart";
import HandlingChart from "./handlingChart";

export default function SecurityDashboard({ now }: { now: string }) {
  const documents = useAppSelector(selectDocuments);
  const pending = useAppSelector(selectPendingReclassifications);
  const revocations = useAppSelector(selectActiveRevocations);
  const failing = useAppSelector(selectFailingEndpoints);
  const exceptions = useAppSelector(selectEndpointExceptions);
  const transfers = useAppSelector(selectPendingTransfers);

  const unclassified = documents.filter((d) => !d.classification).length;
  const recentDays = seedHandlingDays.slice(-7);
  const blocked = recentDays.reduce((sum, day) => sum + day.blocked, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Documents held"
          value={documents.length}
          hint={
            unclassified === 0
              ? "Every one carries a classification"
              : `${unclassified} without a classification`
          }
          tone={unclassified === 0 ? "green" : "red"}
        />
        <Kpi
          label="Policy exceptions"
          value={exceptions.length + pending.length + transfers.length}
          hint={`${pending.length} reclassification · ${transfers.length} transfer · ${exceptions.length} endpoint`}
          tone={
            exceptions.length + pending.length + transfers.length === 0
              ? "green"
              : "amber"
          }
        />
        <Kpi
          label="Revocations in force"
          value={revocations.length}
          hint="Access withdrawn and not restored"
          tone={revocations.length === 0 ? "green" : "amber"}
        />
        <Kpi
          label="Endpoints not clean"
          value={failing.length}
          hint={`${blocked} handling refusals in the last 7 days`}
          tone={failing.length === 0 ? "green" : "red"}
        />
      </div>

      {failing.length > 0 && (
        <section
          className="rounded-lg border bg-white dark:bg-neutral-900"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <h2
              className="flex items-center gap-2 font-bold"
              style={{ color: "var(--viz-critical)" }}
            >
              <FiHardDrive size={16} aria-hidden="true" />
              Endpoints failing cache verification
            </h2>
            <Link
              href="/document-security/endpoint-controls"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Endpoint controls →
            </Link>
          </header>

          <ul className="divide-y divide-neutral-100 px-5 dark:divide-neutral-800">
            {failing.map((endpoint) => (
              <li key={endpoint.id} className="py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {endpoint.label}
                    </span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                      {endpoint.location} ·{" "}
                      {endpoint.lastVerifiedAt
                        ? `inspected ${stamp(endpoint.lastVerifiedAt)}`
                        : "never inspected"}
                    </span>
                  </span>
                  <StatusBadge tone={VERIFICATION_TONE[endpoint.verification]}>
                    {endpoint.verification}
                  </StatusBadge>
                </div>
                {endpoint.note && (
                  <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                    {endpoint.note}
                  </p>
                )}
                {endpointExceptions(endpoint).map((issue) => (
                  <p
                    key={issue}
                    className="mt-1 flex items-center gap-1.5 text-xs"
                    style={{ color: VERIFICATION_COLOR["Remnant found"] }}
                  >
                    <FiAlertTriangle size={11} aria-hidden="true" />
                    {issue}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <ClassificationChart documents={documents} />
        <HandlingChart days={seedHandlingDays} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">Policy exceptions in force</h2>
            <Link
              href="/document-security/reclassification"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Reclassification →
            </Link>
          </div>

          {pending.length + transfers.length === 0 ? (
            <p className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              <FiCheckCircle
                size={15}
                style={{ color: "var(--viz-good)" }}
                aria-hidden="true"
              />
              Nothing is waiting on a security decision.
            </p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Waiting on</Th>
                  <Th>Subject</Th>
                  <Th>Raised</Th>
                </tr>
              </thead>
              <tbody>
                {pending.map((request) => (
                  <tr key={request.id}>
                    <Td>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        Reclassification
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        {request.from} → {request.to}
                      </span>
                    </Td>
                    <Td>
                      {request.documentTitle}
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {request.documentId} · {request.requestedBy}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono">{stamp(request.requestedAt)}</span>
                    </Td>
                  </tr>
                ))}
                {transfers.map((transfer) => (
                  <tr key={transfer.id}>
                    <Td>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {transfer.direction}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        {transfer.counterparty}
                      </span>
                    </Td>
                    <Td>
                      {transfer.title}
                      <span className={`stamp mt-1 ${classificationTone(transfer.classification)}`}>
                        {transfer.classification}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-mono">{stamp(transfer.at)}</span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">Recent revocations</h2>
            <Link
              href="/document-security/revocations"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Revocations →
            </Link>
          </div>

          {revocations.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              No access has been withdrawn.
            </p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Target</Th>
                  <Th>Audience</Th>
                  <Th>Withdrawn</Th>
                </tr>
              </thead>
              <tbody>
                {revocations.slice(0, 5).map((revocation) => (
                  <tr key={revocation.id}>
                    <Td>
                      <span className="inline-flex items-center gap-2 font-medium text-neutral-900 dark:text-neutral-100">
                        <FiXOctagon
                          size={13}
                          style={{ color: "var(--viz-critical)" }}
                          aria-hidden="true"
                        />
                        {revocation.targetTitle}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        {revocation.scope} · {revocation.targetId}
                      </span>
                    </Td>
                    <Td>
                      {revocation.audience === "All users"
                        ? "All users"
                        : `${revocation.users.length} named`}
                    </Td>
                    <Td>
                      <span className="font-mono">{stamp(revocation.at)}</span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </section>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Read at {stamp(now)}. Classification is the operative input to every one
        of these decisions — access, download, print, offline, retention and
        recording — not a label printed on a page.
      </p>
    </div>
  );
}
