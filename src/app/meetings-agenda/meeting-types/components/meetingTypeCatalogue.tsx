"use client";

import { FiCheck, FiFileText, FiLock, FiShield, FiUsers } from "react-icons/fi";
import { classificationTone } from "@/common/ui";
import { OPERATOR } from "@/core/app-constants";
import { useAppSelector } from "@/core/hook";
import { selectMeetings } from "@/core/slices/meetings-slice";
import { AGENDA_ITEM_TYPES, MEETING_TYPES } from "@/data/meetingTypes";
import { Table, Td, Th } from "@/common/table";

export default function MeetingTypeCatalogue() {
  const meetings = useAppSelector(selectMeetings);

  return (
    <div className="space-y-8">
      <p className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
        <FiLock size={14} className="shrink-0 text-neutral-400" aria-hidden="true" />
        Configuration is read-only in this build. You are signed in as{" "}
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {OPERATOR.role}
        </span>
        — editing a type will be gated on that role once roles come from the
        session.
      </p>

      <section className="grid gap-4 xl:grid-cols-2">
        {MEETING_TYPES.map((type) => {
          const usage = meetings.filter((m) => m.type === type.name).length;

          return (
            <article
              key={type.name}
              className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
                <div className="min-w-0">
                  <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
                    {type.name}
                  </h2>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    {usage} sitting{usage === 1 ? "" : "s"} on the register
                  </p>
                </div>
                <span className={`stamp ${classificationTone(type.classificationDefault)}`}>
                  <FiShield size={10} />
                  {type.classificationDefault}
                </span>
              </header>

              <dl className="space-y-4 p-5 text-sm">
                <div>
                  <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                    <FiUsers size={12} aria-hidden="true" /> Participant rule
                  </dt>
                  <dd className="mt-1 text-neutral-700 dark:text-neutral-300">
                    {type.participantRule}
                  </dd>
                </div>

                <div>
                  <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                    <FiFileText size={12} aria-hidden="true" /> Document handling
                  </dt>
                  <dd className="mt-1 text-neutral-700 dark:text-neutral-300">
                    {type.documentHandling}
                  </dd>
                </div>

                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                    Approval path
                  </dt>
                  <dd className="mt-2">
                    <ol className="space-y-1.5">
                      {type.approvalPath.map((step, index) => (
                        <li key={step} className="flex items-center gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-state-600/10 font-mono text-[10px] font-semibold text-state-700 dark:bg-state-900/40 dark:text-state-400">
                            {index + 1}
                          </span>
                          <span className="text-neutral-700 dark:text-neutral-300">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-bold">Agenda item types</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-MTG-08 — what each kind of item is expected to carry. An item whose
            type expects a paper counts against its sitting&apos;s submission
            deadline until one is attached.
          </p>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Item type</Th>
              <Th>Expected documents</Th>
              <Th>Paper required</Th>
            </tr>
          </thead>
          <tbody>
            {AGENDA_ITEM_TYPES.map((item) => (
              <tr key={item.name}>
                <Td>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {item.name}
                  </span>
                </Td>
                <Td>{item.expects}</Td>
                <Td>
                  {item.requiresPaper ? (
                    <span
                      className="inline-flex items-center gap-1.5 font-medium"
                      style={{ color: "var(--viz-good)" }}
                    >
                      <FiCheck size={14} aria-hidden="true" /> Required
                    </span>
                  ) : (
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Optional
                    </span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </div>
  );
}
