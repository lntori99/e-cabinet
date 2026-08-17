"use client";

import { useState } from "react";
import Modal from "@/common/modal";
import { Field, Select, btnGhost, btnPrimary } from "@/common/field";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectCarryForwardTargets } from "@/core/slices/meetings-slice";
import { carryItemForward } from "@/core/thunks-meetings";
import type { AgendaItem } from "@/models/response/base-response";

/**
 * FR-MTG-11 — carry an undecided item to a nominated future meeting, keeping
 * its papers and its provenance.
 */
export default function CarryForwardModal({
  open,
  onClose,
  fromMeetingId,
  item,
}: {
  open: boolean;
  onClose: () => void;
  fromMeetingId: string;
  item: AgendaItem;
}) {
  const dispatch = useAppDispatch();
  const targets = useAppSelector(selectCarryForwardTargets);
  const [targetId, setTargetId] = useState(targets[0]?.id ?? "");

  const labels = targets.map((m) => `${m.id} — ${m.title} (${m.date})`);
  const selectedLabel = labels[targets.findIndex((m) => m.id === targetId)] ?? labels[0];

  function submit() {
    if (!targetId) return;
    dispatch(carryItemForward({ fromMeetingId, toMeetingId: targetId, itemId: item.id }));
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Carry item forward">
      <div className="space-y-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {item.title}
          </span>{" "}
          is still undecided. Carrying it forward copies the item and its{" "}
          {item.attachments.length} document
          {item.attachments.length === 1 ? "" : "s"} onto the nominated sitting,
          and records the move on both agendas.
        </p>

        {targets.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            There is no future sitting to carry this item to. Create one first.
          </p>
        ) : (
          <Field label="Nominated meeting">
            <Select
              options={labels}
              value={selectedLabel}
              onChange={(e) => setTargetId(targets[labels.indexOf(e.target.value)]?.id ?? "")}
            />
          </Field>
        )}

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Any closed-session restriction is not carried across — the receiving
          sitting has a different participant list, so it must be set again there.
        </p>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!targetId}
            onClick={submit}
            className={btnPrimary}
          >
            Carry forward
          </button>
        </div>
      </div>
    </Modal>
  );
}
