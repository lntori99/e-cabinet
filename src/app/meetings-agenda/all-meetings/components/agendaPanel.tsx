"use client";

import { useState } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiCornerUpRight,
  FiEdit2,
  FiLock,
  FiPlus,
  FiTrash2,
  FiUnlock,
} from "react-icons/fi";
import { LuCalendarClock } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { StatusBadge } from "@/common/ui";
import { btnGhost, btnPrimary } from "@/common/field";
import { useAppDispatch } from "@/core/hook";
import { groupAgenda } from "@/core/slices/meetings-slice";
import {
  moveAgendaItem,
  removeAgendaItem,
  setAgendaItemDecided,
} from "@/core/thunks-meetings";
import { agendaItemTypeRule } from "@/data/meetingTypes";
import type { AgendaItem, Meeting } from "@/models/response/base-response";
import AgendaItemModal from "./agendaItemModal";
import CarryForwardModal from "../../components/carryForwardModal";
import ClosedSessionModal from "./closedSessionModal";

/**
 * FR-MTG-06 sequencing and sections · FR-MTG-07 linked documents ·
 * FR-MTG-08 item types · FR-MTG-11 carry forward · FR-MTG-14 closed sessions.
 */
export default function AgendaPanel({ meeting }: { meeting: Meeting }) {
  const dispatch = useAppDispatch();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AgendaItem | null>(null);
  const [closing, setClosing] = useState<AgendaItem | null>(null);
  const [carrying, setCarrying] = useState<AgendaItem | null>(null);

  const sections = groupAgenda(meeting.agenda);
  const total = meeting.agenda.length;
  const frozen = meeting.status === "Pack Frozen";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {total} item{total === 1 ? "" : "s"} across {sections.length} section
          {sections.length === 1 ? "" : "s"}. Numbering is maintained
          automatically.
        </p>
        <button type="button" onClick={() => setAdding(true)} className={btnPrimary}>
          <FiPlus size={14} /> Add item
        </button>
      </div>

      {frozen && (
        <p className="rounded-lg border border-state-300 bg-state-50 px-3 py-2 text-xs text-state-800 dark:border-state-700 dark:bg-state-900/20 dark:text-state-300">
          The pack is frozen. Agenda changes from here require a formal
          replacement version with documented approval.
        </p>
      )}

      {total === 0 ? (
        <EmptyState
          icon={LuCalendarClock}
          title="No agenda items yet"
          description={`Submissions close ${meeting.submissionDeadline.replace("T", " at ")}. Add the first item to start building the pack.`}
          actions={[
            { label: "Add item", onClick: () => setAdding(true), className: "rounded-lg bg-state-600 text-white hover:bg-state-700" },
          ]}
        />
      ) : (
        <div className="space-y-5">
          {sections.map(({ section, items }) => (
            <section key={section}>
              <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                {section}
              </h3>
              <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 p-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-state-300 font-mono text-[11px] font-semibold text-state-700 dark:border-state-700 dark:text-state-400">
                      {item.order}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {item.title}
                        </span>
                        <StatusBadge tone="neutral">{item.type}</StatusBadge>
                        {item.closedSession && (
                          <StatusBadge tone="red">
                            Closed · {item.closedParticipantIds.length} admitted
                          </StatusBadge>
                        )}
                        {item.decided ? (
                          <StatusBadge tone="green">Decided</StatusBadge>
                        ) : (
                          <StatusBadge tone="amber">Undecided</StatusBadge>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        {item.ministry} · {agendaItemTypeRule(item.type).expects}
                      </p>

                      {item.carriedFromMeetingId && (
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                          Carried forward from {item.carriedFromMeetingId}
                        </p>
                      )}
                      {item.carriedToMeetingId && (
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                          Carried forward to {item.carriedToMeetingId}
                        </p>
                      )}

                      {item.attachments.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {item.attachments.map((a) => (
                            <li
                              key={a.id}
                              className="rounded border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
                            >
                              <span className="font-mono text-[9px] uppercase tracking-wide text-neutral-400">
                                {a.kind}
                              </span>{" "}
                              {a.title}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Move ${item.title} up`}
                        disabled={item.order === 1}
                        onClick={() => dispatch(moveAgendaItem(meeting.id, item.id, "up"))}
                        className="rounded p-1.5 text-neutral-400 transition hover:text-state-600 disabled:opacity-30"
                      >
                        <FiArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${item.title} down`}
                        disabled={item.order === total}
                        onClick={() => dispatch(moveAgendaItem(meeting.id, item.id, "down"))}
                        className="rounded p-1.5 text-neutral-400 transition hover:text-state-600 disabled:opacity-30"
                      >
                        <FiArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={`${item.closedSession ? "Edit" : "Apply"} closed session for ${item.title}`}
                        onClick={() => setClosing(item)}
                        className={`rounded p-1.5 transition ${item.closedSession ? "text-seal-500" : "text-neutral-400 hover:text-seal-500"}`}
                      >
                        {item.closedSession ? <FiLock size={14} /> : <FiUnlock size={14} />}
                      </button>
                      <button
                        type="button"
                        aria-label={`Carry ${item.title} forward`}
                        disabled={item.decided || Boolean(item.carriedToMeetingId)}
                        onClick={() => setCarrying(item)}
                        className="rounded p-1.5 text-neutral-400 transition hover:text-state-600 disabled:opacity-30"
                      >
                        <FiCornerUpRight size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Edit ${item.title}`}
                        onClick={() => setEditing(item)}
                        className="rounded p-1.5 text-neutral-400 transition hover:text-state-600"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${item.title}`}
                        onClick={() => dispatch(removeAgendaItem(meeting.id, item.id))}
                        className="rounded p-1.5 text-neutral-400 transition hover:text-seal-500"
                      >
                        <FiTrash2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch(setAgendaItemDecided(meeting.id, item.id, !item.decided))}
                        className={`${btnGhost} px-2 py-1 text-xs`}
                      >
                        {item.decided ? "Reopen" : "Mark decided"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {adding && (
        <AgendaItemModal open onClose={() => setAdding(false)} meetingId={meeting.id} />
      )}
      {editing && (
        <AgendaItemModal
          open
          onClose={() => setEditing(null)}
          meetingId={meeting.id}
          editing={editing}
        />
      )}
      {closing && (
        <ClosedSessionModal open onClose={() => setClosing(null)} meeting={meeting} item={closing} />
      )}
      {carrying && (
        <CarryForwardModal
          open
          onClose={() => setCarrying(null)}
          fromMeetingId={meeting.id}
          item={carrying}
        />
      )}
    </div>
  );
}
