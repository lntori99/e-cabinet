"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiCornerUpRight, FiPaperclip } from "react-icons/fi";
import { LuCircleCheckBig } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectCarriedItems,
  selectUndecidedBacklog,
  selected,
} from "@/core/slices/meetings-slice";
import type { AgendaItem, Meeting } from "@/models/response/base-response";
import CarryForwardModal from "../../components/carryForwardModal";
import { STATUS_TONE } from "../../components/meetingStatus";
import { Table, Td, Th } from "@/common/table";

function ItemIdentity({ item }: { item: AgendaItem }) {
  return (
    <>
      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
        {item.title}
      </span>
      <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
        {item.section} · {item.type} · {item.ministry}
      </span>
      {item.attachments.length > 0 && (
        <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <FiPaperclip size={11} aria-hidden="true" />
          {item.attachments.length} document
          {item.attachments.length === 1 ? "" : "s"} travel with it
        </span>
      )}
    </>
  );
}

function SittingLink({ meeting }: { meeting: Meeting }) {
  const dispatch = useAppDispatch();
  return (
    <Link
      href="/meetings-agenda/all-meetings"
      onClick={() => dispatch(selected(meeting.id))}
      className="font-medium text-neutral-900 hover:text-state-700 dark:text-neutral-100 dark:hover:text-state-400"
    >
      {meeting.id}
      <span className="mt-0.5 block text-xs font-normal text-neutral-500 dark:text-neutral-400">
        {meeting.title} · {meeting.date}
      </span>
    </Link>
  );
}

export default function CarriedForwardBoard() {
  const dispatch = useAppDispatch();
  const backlog = useAppSelector(selectUndecidedBacklog);
  const carried = useAppSelector(selectCarriedItems);
  const [nominating, setNominating] = useState<{
    item: AgendaItem;
    from: Meeting;
  } | null>(null);

  /** The modal offers every sitting but the one currently selected, so point
      the selection at the origin before opening it. */
  function nominate(item: AgendaItem, from: Meeting) {
    dispatch(selected(from.id));
    setNominating({ item, from });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Awaiting a nominated meeting</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {backlog.length} item{backlog.length === 1 ? "" : "s"} with nowhere to go
          </p>
        </div>

        {backlog.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              icon={LuCircleCheckBig}
              title="Nothing is waiting"
              description="Every item raised at a concluded sitting was either decided there or has already been nominated to a future meeting."
            />
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Item</Th>
                <Th>Raised at</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {backlog.map(({ item, from }) => (
                <tr
                  key={`${from.id}-${item.id}`}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  <Td>
                    <ItemIdentity item={item} />
                  </Td>
                  <Td>
                    <SittingLink meeting={from} />
                  </Td>
                  <Td align="right">
                    <button
                      type="button"
                      onClick={() => nominate(item, from)}
                      className="inline-flex items-center gap-2 rounded-lg border border-state-600 px-3 py-1.5 text-sm font-medium text-state-700 transition hover:bg-state-600 hover:text-white dark:text-state-400"
                    >
                      <FiCornerUpRight size={14} aria-hidden="true" />
                      Carry forward
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Already carried</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {carried.length} move{carried.length === 1 ? "" : "s"} on the record
          </p>
        </div>

        {carried.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            No item has been carried between sittings yet. A move recorded here
            also appears on the change history of both agendas.
          </p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Item</Th>
                <Th>From</Th>
                <Th>Nominated to</Th>
                <Th>State</Th>
              </tr>
            </thead>
            <tbody>
              {carried.map(({ item, from, to }) => (
                <tr
                  key={`${from.id}-${item.id}`}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                >
                  <Td>
                    <ItemIdentity item={item} />
                  </Td>
                  <Td>
                    <SittingLink meeting={from} />
                  </Td>
                  <Td>
                    {to ? (
                      <span className="inline-flex items-start gap-2">
                        <FiArrowRight
                          size={14}
                          className="mt-1 shrink-0 text-neutral-400"
                          aria-hidden="true"
                        />
                        <SittingLink meeting={to} />
                      </span>
                    ) : (
                      <span className="text-neutral-500 dark:text-neutral-400">
                        Sitting no longer on the register
                      </span>
                    )}
                  </Td>
                  <Td>
                    {to ? (
                      <StatusBadge tone={STATUS_TONE[to.status]}>
                        {to.status}
                      </StatusBadge>
                    ) : (
                      <StatusBadge tone="red">Unplaced</StatusBadge>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      {nominating && (
        <CarryForwardModal
          open
          onClose={() => setNominating(null)}
          fromMeetingId={nominating.from.id}
          item={nominating.item}
        />
      )}
    </div>
  );
}
