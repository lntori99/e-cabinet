"use client";

import Link from "next/link";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiEyeOff,
  FiFlag,
  FiMessageSquare,
} from "react-icons/fi";
import { distance, hoursUntil, stamp } from "@/common/time";
import { Kpi, StatusBadge } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  selectAcknowledged,
  selectAnnotations,
  selectCurrentPack,
  selectOpenComments,
  selectOpenFlags,
  selectReaderPacks,
  selectSuperseded,
  selectToRead,
} from "@/core/slices/review-slice";
import { READER, seedReviewDays } from "@/data/review";
import { FLAG_COLOR, FLAG_TONE, progress } from "../../components/readingStatus";
import ActivityChart from "./activityChart";
import ProgressChart from "./progressChart";

export default function ReadingDashboard({ now }: { now: string }) {
  const packs = useAppSelector(selectReaderPacks);
  const toRead = useAppSelector(selectToRead);
  const acknowledged = useAppSelector(selectAcknowledged);
  const annotations = useAppSelector(selectAnnotations);
  const flags = useAppSelector(selectOpenFlags);
  const comments = useAppSelector(selectOpenComments);
  const superseded = useAppSelector(selectSuperseded);
  const current = useAppSelector(selectCurrentPack);

  const nextSitting = current
    ? hoursUntil(`${current.meetingDate}T09:00`, now)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="To read"
          value={toRead.length}
          hint={
            current
              ? `Next sitting ${distance(nextSitting)}`
              : "Nothing released to you"
          }
          tone={toRead.length === 0 ? "green" : "amber"}
        />
        <Kpi
          label="Acknowledged"
          value={acknowledged.length}
          hint={`of ${acknowledged.length + toRead.length} papers released to you`}
        />
        <Kpi
          label="Your notes"
          value={annotations.length}
          hint="Private to you — encrypted and not administratively readable"
        />
        <Kpi
          label="Open with the Secretariat"
          value={flags.length + comments.length}
          hint={`${flags.length} flag${flags.length === 1 ? "" : "s"} · ${comments.length} comment${comments.length === 1 ? "" : "s"}`}
          tone={flags.length + comments.length === 0 ? "neutral" : "amber"}
        />
      </div>

      {superseded.length > 0 && (
        <section
          className="rounded-lg border bg-white dark:bg-neutral-900"
          style={{ borderColor: "var(--viz-critical)" }}
        >
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <h2
              className="flex items-center gap-2 font-bold"
              style={{ color: "var(--viz-critical)" }}
            >
              <FiAlertTriangle size={16} aria-hidden="true" />
              You have notes on a superseded version
            </h2>
            <Link
              href="/review-and-annotation/superseded"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Superseded →
            </Link>
          </header>

          <ul className="divide-y divide-neutral-100 px-5 dark:divide-neutral-800">
            {superseded.map(({ item, annotations: notes }) => (
              <li
                key={item.documentId}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {item.documentTitle}
                  </span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {notes.length} note{notes.length === 1 ? "" : "s"} against{" "}
                    {item.versionId} · replaced by {item.supersededByVersionId}
                  </span>
                </span>
                <StatusBadge tone="red">Newer version exists</StatusBadge>
              </li>
            ))}
          </ul>
        </section>
      )}

      {current && (
        <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                Next sitting · {current.meetingId}
              </p>
              <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                {current.meetingTitle}
              </h2>
              <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                {current.meetingDate} · {distance(nextSitting)}
              </p>
            </div>
            <Link
              href="/review-and-annotation/current-pack"
              className="inline-flex items-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700"
            >
              Open the pack
            </Link>
          </header>

          <ul className="divide-y divide-neutral-100 px-5 dark:divide-neutral-800">
            {current.items.map((item) => (
              <li
                key={item.documentId}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {item.documentTitle}
                  </span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {item.agendaItemTitle} · {item.pages} pages
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="hidden w-24 sm:block">
                    <span className="block h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${progress(item)}%`,
                          background: "var(--viz-ramp-4)",
                        }}
                      />
                    </span>
                  </span>
                  {item.acknowledgedAt ? (
                    <StatusBadge tone="green">Acknowledged</StatusBadge>
                  ) : (
                    <StatusBadge tone={item.pagesRead > 0 ? "amber" : "neutral"}>
                      {item.pagesRead > 0 ? "Part read" : "Not opened"}
                    </StatusBadge>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <ProgressChart packs={packs} />
        <ActivityChart days={seedReviewDays} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">Your open flags</h2>
            <Link
              href="/review-and-annotation/flagged-items"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Flagged items →
            </Link>
          </div>

          {flags.length === 0 ? (
            <p className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              <FiCheckCircle
                size={15}
                style={{ color: "var(--viz-good)" }}
                aria-hidden="true"
              />
              Nothing of yours is waiting on the Secretariat.
            </p>
          ) : (
            <ul className="space-y-2">
              {flags.map((flag) => (
                <li
                  key={flag.id}
                  className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        <FiFlag
                          size={13}
                          style={{ color: FLAG_COLOR[flag.kind] }}
                          aria-hidden="true"
                        />
                        {flag.agendaItemTitle}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        {flag.kind} · {stamp(flag.at)}
                      </span>
                    </span>
                    <StatusBadge tone={FLAG_TONE[flag.status]}>
                      {flag.status}
                    </StatusBadge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">Comments awaiting a reply</h2>
            <Link
              href="/review-and-annotation/my-comments"
              className="text-sm font-medium text-state-700 hover:underline dark:text-state-400"
            >
              My comments →
            </Link>
          </div>

          {comments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              You have raised nothing that is still open.
            </p>
          ) : (
            <ul className="space-y-2">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        <FiMessageSquare
                          size={13}
                          className="text-neutral-400"
                          aria-hidden="true"
                        />
                        {comment.documentTitle}
                      </span>
                      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                        To {comment.recipients.join(", ")} · {stamp(comment.at)}
                      </span>
                    </span>
                    <StatusBadge tone={comment.status === "Open" ? "amber" : "blue"}>
                      {comment.status}
                    </StatusBadge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <FiEyeOff size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        This room is {READER.name}&apos;s alone. Your private notes are encrypted at
        rest and excluded from administrative access — there is no screen anywhere
        in this platform, for any role, that shows them to somebody else.
      </p>
    </div>
  );
}
