"use client";

import { FiCheck, FiCheckCircle, FiClock } from "react-icons/fi";
import { Table, Td, Th } from "@/common/table";
import { distance, hoursUntil, stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectAcknowledged,
  selectReaderPacks,
  selectToRead,
} from "@/core/slices/review-slice";
import { acknowledgePaper } from "@/core/thunks-review";
import { progress } from "../../components/readingStatus";

export default function AcknowledgementBoard({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const toRead = useAppSelector(selectToRead);
  const done = useAppSelector(selectAcknowledged);
  const packs = useAppSelector(selectReaderPacks);

  const total = toRead.length + done.length;
  const percent = total === 0 ? 0 : Math.round((done.length / total) * 100);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
            Your record
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            {done.length} of {total} acknowledged
          </p>
        </header>

        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
          role="img"
          aria-label={`${done.length} of ${total} papers acknowledged`}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${percent}%`, background: "var(--viz-ramp-5)" }}
          />
        </div>

        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {toRead.length === 0
            ? "Nothing is outstanding."
            : `${toRead.length} paper${toRead.length === 1 ? "" : "s"} still to acknowledge across ${packs.length} pack${packs.length === 1 ? "" : "s"}.`}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Outstanding</h2>

        {toRead.length === 0 ? (
          <p className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
            <FiCheckCircle
              size={15}
              style={{ color: "var(--viz-good)" }}
              aria-hidden="true"
            />
            You have acknowledged every paper released to you.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Paper</Th>
                <Th>Sitting</Th>
                <Th align="right">Read</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {toRead.map((item) => (
                <tr
                  key={item.documentId}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  <Td>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {item.documentTitle}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      {item.documentId} · {item.versionId}
                    </span>
                  </Td>
                  <Td>
                    {item.meetingTitle}
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                      <FiClock size={11} aria-hidden="true" />
                      {item.meetingDate} ·{" "}
                      {distance(hoursUntil(`${item.meetingDate}T09:00`, now))}
                    </span>
                  </Td>
                  <Td align="right">
                    <span className="font-mono">{progress(item)}%</span>
                  </Td>
                  <Td align="right">
                    <button
                      type="button"
                      onClick={() => dispatch(acknowledgePaper(item))}
                      className="inline-flex items-center gap-2 rounded-lg border border-state-600 px-3 py-1.5 text-sm font-medium text-state-700 transition hover:bg-state-600 hover:text-white dark:text-state-400"
                    >
                      <FiCheck size={14} aria-hidden="true" />
                      Acknowledge
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Acknowledged</h2>

        {done.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            You have not acknowledged anything yet.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Paper</Th>
                <Th>Sitting</Th>
                <Th>Acknowledged</Th>
                <Th>Version</Th>
              </tr>
            </thead>
            <tbody>
              {done.map((item) => (
                <tr key={item.documentId}>
                  <Td>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {item.documentTitle}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {item.agendaItemTitle}
                    </span>
                  </Td>
                  <Td>{item.meetingTitle}</Td>
                  <Td>
                    <span className="inline-flex items-center gap-2 font-mono whitespace-nowrap">
                      <FiCheckCircle
                        size={13}
                        style={{ color: "var(--viz-good)" }}
                        aria-hidden="true"
                      />
                      {item.acknowledgedAt ? stamp(item.acknowledgedAt) : ""}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono">{item.versionId}</span>
                    {item.supersededByVersionId && (
                      <StatusBadge tone="red">Superseded since</StatusBadge>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        An acknowledgement is against a version. If a paper you acknowledged is
        later replaced, the record stands for the version you read — and the
        replacement appears again as outstanding.
      </p>
    </div>
  );
}
