"use client";

import { useMemo, useState } from "react";
import { FiCheckSquare, FiLink2, FiLock, FiSearch } from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { controlCls, filterCls } from "@/common/field";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppSelector } from "@/core/hook";
import {
  selectActionRecords,
  selectCorrections,
  selectFinalisedDecisions,
} from "@/core/slices/decision-slice";
import { MINISTRIES } from "@/data/decisions";
import { ACTION_TONE, OUTCOME_TONE } from "../../../components/decisionStatus";

const ALL = "All";

/**
 * FR-DEC-04 — the immutable register. Searchable by meeting and by ministry
 * because those are the two questions actually asked of it: what did that
 * sitting decide, and what is my ministry carrying.
 */
export default function FinalisedRegister() {
  const decisions = useAppSelector(selectFinalisedDecisions);
  const actions = useAppSelector(selectActionRecords);
  const corrections = useAppSelector(selectCorrections);

  const [query, setQuery] = useState("");
  const [ministry, setMinistry] = useState(ALL);
  const [meeting, setMeeting] = useState(ALL);

  const meetings = useMemo(
    () => [ALL, ...new Set(decisions.map((d) => d.meetingTitle))],
    [decisions],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return decisions.filter(
      (d) =>
        (ministry === ALL || d.ministries.includes(ministry)) &&
        (meeting === ALL || d.meetingTitle === meeting) &&
        (q.length === 0 ||
          d.text.toLowerCase().includes(q) ||
          d.agendaItemTitle.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q)),
    );
  }, [decisions, ministry, meeting, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="relative min-w-[16rem] flex-1">
          <FiSearch
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the decision text, item or reference"
            aria-label="Search finalised decisions"
            className={`${controlCls} pl-9`}
          />
        </label>
        <select
          value={meeting}
          onChange={(e) => setMeeting(e.target.value)}
          aria-label="Filter by meeting"
          className={`${filterCls}`}
        >
          {meetings.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          value={ministry}
          onChange={(e) => setMinistry(e.target.value)}
          aria-label="Filter by ministry"
          className={`${filterCls}`}
        >
          {[ALL, ...MINISTRIES].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {shown.length} of {decisions.length} finalised decisions
      </p>

      {shown.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            icon={FiSearch}
            title="Nothing matches"
            description="No finalised decision matches that combination of meeting, ministry and search text."
          />
        </div>
      ) : (
        shown.map((decision) => {
          const carried = actions.filter((a) => a.decisionId === decision.id);
          const corrected = corrections.filter((c) => c.decisionId === decision.id);

          return (
            <article
              key={decision.id}
              className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {decision.id} · {decision.meetingId} · item {decision.agendaItemNumber}
                  </p>
                  <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                    {decision.agendaItemTitle}
                  </h2>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span className={`stamp ${classificationTone(decision.classification)}`}>
                    {decision.classification}
                  </span>
                  <StatusBadge tone={OUTCOME_TONE[decision.outcome]}>
                    {decision.outcome}
                  </StatusBadge>
                  <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <FiLock size={12} aria-hidden="true" />
                    Immutable
                  </span>
                </div>
              </header>

              <div className="px-5 py-4">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {decision.text}
                </p>

                <div className="mt-4 grid gap-x-6 lg:grid-cols-2">
                  <div className="space-y-0.5">
                    <DetailRow
                      label="Meeting"
                      value={`${decision.meetingTitle} · ${decision.meetingDate}`}
                    />
                    <DetailRow label="Recorded by" value={decision.recordedBy} />
                    <DetailRow label="Reviewed by" value={decision.reviewedBy ?? "—"} />
                  </div>
                  <div className="space-y-0.5">
                    <DetailRow
                      label="Finalised"
                      value={decision.finalisedAt ? stamp(decision.finalisedAt) : "—"}
                    />
                    <DetailRow
                      label="Ministries"
                      value={decision.ministries.join(", ") || "None named"}
                    />
                    <DetailRow
                      label="Corrections"
                      value={
                        corrected.length === 0
                          ? "None"
                          : `${corrected.length} on the record`
                      }
                    />
                  </div>
                </div>

                {decision.supersedes && (
                  <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                    <FiLink2 size={12} aria-hidden="true" />
                    Continues {decision.supersedes}
                  </p>
                )}
              </div>

              {carried.length > 0 && (
                <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
                  <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    <FiCheckSquare size={12} aria-hidden="true" />
                    Actions carried
                  </p>
                  <ul className="mt-2 space-y-2">
                    {carried.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-start justify-between gap-2 text-sm"
                      >
                        <span className="min-w-0">
                          <span className="text-neutral-800 dark:text-neutral-200">
                            {item.description}
                          </span>
                          <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                            {item.ministry} · due {item.deadline}
                          </span>
                        </span>
                        <StatusBadge tone={ACTION_TONE[item.state]}>
                          {item.state}
                        </StatusBadge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}
