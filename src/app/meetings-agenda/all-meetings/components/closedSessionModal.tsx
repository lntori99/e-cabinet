"use client";

import { useState } from "react";
import { FiLock } from "react-icons/fi";
import Modal from "@/common/modal";
import { CheckboxRow, btnGhost, btnPrimary } from "@/common/field";
import { useAppDispatch } from "@/core/hook";
import { setClosedSession } from "@/core/thunks-meetings";
import type { AgendaItem, Meeting } from "@/models/response/base-response";

/**
 * FR-MTG-14 — restrict one agenda item and its papers to a narrower list than
 * the meeting as a whole. "Narrower" is enforced: you cannot admit everyone.
 */
export default function ClosedSessionModal({
  open,
  onClose,
  meeting,
  item,
}: {
  open: boolean;
  onClose: () => void;
  meeting: Meeting;
  item: AgendaItem;
}) {
  const dispatch = useAppDispatch();
  const [admitted, setAdmitted] = useState<string[]>(item.closedParticipantIds);

  const total = meeting.participants.length;
  const isNarrower = admitted.length > 0 && admitted.length < total;

  function toggle(id: string) {
    setAdmitted((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function apply(closed: boolean) {
    dispatch(
      setClosedSession({
        meetingId: meeting.id,
        itemId: item.id,
        closed,
        participantIds: closed ? admitted : [],
      }),
    );
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Closed session" wide>
      <div className="space-y-4">
        <p className="stamp text-seal-500">
          <FiLock size={10} /> Restricted item
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {item.title}
          </span>{" "}
          and its {item.attachments.length} linked document
          {item.attachments.length === 1 ? "" : "s"} will be visible only to the
          participants admitted below. Everyone else sees the item as closed.
        </p>

        <div className="max-h-72 divide-y divide-neutral-100 overflow-y-auto rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {meeting.participants.map((p) => (
            <div key={p.id} className="px-3 py-2.5">
              <CheckboxRow
                checked={admitted.includes(p.id)}
                onChange={() => toggle(p.id)}
                label={
                  <>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {p.name}
                    </span>
                    <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                      {p.capacity} · {p.ministry}
                    </span>
                  </>
                }
              />
            </div>
          ))}
        </div>

        <p
          className={`text-xs ${
            isNarrower
              ? "text-neutral-500 dark:text-neutral-400"
              : "text-signal-500"
          }`}
        >
          {admitted.length} of {total} admitted.{" "}
          {admitted.length === 0
            ? "Admit at least one participant."
            : admitted.length === total
              ? "A closed session must be narrower than the meeting itself."
              : "The remaining participants are excluded from this item."}
        </p>

        <div className="flex flex-wrap justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          {item.closedSession && (
            <button type="button" onClick={() => apply(false)} className={btnGhost}>
              Lift restriction
            </button>
          )}
          <button
            type="button"
            disabled={!isNarrower}
            onClick={() => apply(true)}
            className={btnPrimary}
          >
            Apply closed session
          </button>
        </div>
      </div>
    </Modal>
  );
}
