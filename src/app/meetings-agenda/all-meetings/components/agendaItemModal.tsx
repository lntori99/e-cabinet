"use client";

import { useState, type FormEvent } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Modal from "@/common/modal";
import {
  Field,
  Select,
  TextInput,
  btnGhost,
  btnPrimary,
  controlCls,
} from "@/common/field";
import { useAppDispatch } from "@/core/hook";
import { addAgendaItem, updateAgendaItem } from "@/core/thunks-meetings";
import {
  AGENDA_ITEM_TYPE_NAMES,
  AGENDA_SECTIONS,
  ATTACHMENT_KINDS,
  MINISTRIES,
  agendaItemTypeRule,
} from "@/data/meetingTypes";
import type {
  AgendaItem,
  AgendaItemType,
  AttachmentKind,
} from "@/models/response/base-response";

interface Draft {
  kind: AttachmentKind;
  title: string;
}

/**
 * FR-MTG-06 section · FR-MTG-07 ministry, papers, annexes, presentations and
 * Secretariat notes · FR-MTG-08 item type and its document expectations.
 */
export default function AgendaItemModal({
  open,
  onClose,
  meetingId,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  meetingId: string;
  /** Present when editing an existing item. */
  editing?: AgendaItem | null;
}) {
  const dispatch = useAppDispatch();
  const [type, setType] = useState<AgendaItemType>(editing?.type ?? "Policy Paper");
  const [attachments, setAttachments] = useState<Draft[]>(
    editing?.attachments.map((a) => ({ kind: a.kind, title: a.title })) ?? [],
  );
  const [draft, setDraft] = useState<Draft>({ kind: "Paper", title: "" });

  const rule = agendaItemTypeRule(type);
  const missingPaper = rule.requiresPaper && !attachments.some((a) => a.kind === "Paper");

  function addAttachment() {
    if (!draft.title.trim()) return;
    setAttachments((prev) => [...prev, { ...draft, title: draft.title.trim() }]);
    setDraft({ kind: "Paper", title: "" });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const section = String(fd.get("section"));
    const title = String(fd.get("title"));
    const ministry = String(fd.get("ministry"));

    if (editing) {
      dispatch(
        updateAgendaItem(meetingId, {
          ...editing,
          section,
          title,
          type,
          ministry,
          attachments: attachments.map((a, i) => ({
            id: editing.attachments[i]?.id ?? `AT-${i}-${title.length}`,
            ...a,
          })),
        }),
      );
    } else {
      dispatch(addAgendaItem({ meetingId, section, title, type, ministry, attachments }));
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Edit ${editing.title}` : "Add an agenda item"}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Item title">
          <TextInput name="title" required defaultValue={editing?.title} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* FR-MTG-06 */}
          <Field label="Section" hint="Items are renumbered automatically">
            <Select
              name="section"
              options={AGENDA_SECTIONS}
              defaultValue={editing?.section ?? AGENDA_SECTIONS[1]}
            />
          </Field>
          {/* FR-MTG-08 */}
          <Field label="Item type">
            <Select
              options={AGENDA_ITEM_TYPE_NAMES}
              value={type}
              onChange={(e) => setType(e.target.value as AgendaItemType)}
            />
          </Field>
          {/* FR-MTG-07 */}
          <Field label="Responsible ministry">
            <Select
              name="ministry"
              options={MINISTRIES}
              defaultValue={editing?.ministry ?? MINISTRIES[1]}
            />
          </Field>
        </div>

        <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            {type} expects:
          </span>{" "}
          {rule.expects}
        </p>

        {/* FR-MTG-07 — papers, annexes, presentations, Secretariat notes */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Linked documents
          </legend>

          {attachments.length > 0 && (
            <ul className="mb-3 divide-y divide-neutral-100 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
              {attachments.map((a, i) => (
                <li key={`${a.kind}-${a.title}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="min-w-0 text-sm">
                    <span className="mr-2 rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      {a.kind}
                    </span>
                    <span className="text-neutral-800 dark:text-neutral-200">{a.title}</span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${a.title}`}
                    onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                    className="shrink-0 rounded p-1.5 text-neutral-400 transition hover:text-seal-500"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-end gap-2">
            <select
              value={draft.kind}
              onChange={(e) => setDraft({ ...draft, kind: e.target.value as AttachmentKind })}
              className={`${controlCls} w-auto`}
              aria-label="Document kind"
            >
              {ATTACHMENT_KINDS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Reference or title, e.g. DOC-0352 — Mid-year review"
              className={`${controlCls} min-w-0 flex-1`}
              aria-label="Document title"
            />
            <button type="button" onClick={addAttachment} className={btnGhost}>
              <FiPlus size={14} /> Link
            </button>
          </div>

          {missingPaper && (
            <p className="mt-2 text-xs text-signal-500">
              A {type} normally carries a paper. You can still save without one.
            </p>
          )}
        </fieldset>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary}>
            {editing ? "Save item" : "Add item"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
