"use client";

import { useState, type FormEvent } from "react";
import { FiEyeOff, FiFlag, FiSend } from "react-icons/fi";
import {
  CheckboxRow,
  Field,
  Select,
  TextArea,
  btnGhost,
  btnPrimary,
} from "@/common/field";
import Modal from "@/common/modal";
import { useAppDispatch } from "@/core/hook";
import { addAnnotation, raiseComment, raiseFlag } from "@/core/thunks-review";
import type {
  AnnotationKind,
  ReadingItem,
  ReviewFlag,
} from "@/models/response/base-response";

const KINDS: AnnotationKind[] = ["Note", "Highlight", "Bookmark"];

/** FR-REV-03 — private to its author, and the form says so plainly. */
export function AnnotateModal({
  item,
  page,
  anchorText,
  onClose,
}: {
  item: ReadingItem;
  page: number;
  anchorText?: string;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [kind, setKind] = useState<AnnotationKind>(anchorText ? "Highlight" : "Note");
  const [body, setBody] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    dispatch(addAnnotation({ item, page, kind, body: body.trim(), anchorText }));
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Add a private note">
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {item.documentTitle}
          </p>
          <p className="mt-1 font-mono text-xs text-neutral-500 dark:text-neutral-400">
            Page {page} · {item.versionId}
          </p>
          {anchorText && (
            <p className="mt-2 border-l-2 border-signal-400 pl-3 text-sm italic text-neutral-600 dark:text-neutral-300">
              “{anchorText}”
            </p>
          )}
        </div>

        <Field label="Kind">
          <Select
            options={KINDS}
            value={kind}
            onChange={(e) => setKind(e.target.value as AnnotationKind)}
          />
        </Field>

        <Field label="Your note">
          <TextArea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="For your own use — nobody else will see this."
            required
          />
        </Field>

        <p className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3 text-xs dark:border-neutral-800">
          <FiEyeOff size={14} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
          <span className="text-neutral-600 dark:text-neutral-300">
            Private to you. Encrypted at rest and excluded from administrative
            access — not even a platform administrator can read it. It stays bound
            to {item.versionId}; if the paper is replaced, this note remains
            against the version you annotated.
          </span>
        </p>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={!body.trim()} className={btnPrimary}>
            Save note
          </button>
        </div>
      </form>
    </Modal>
  );
}

const RECIPIENTS = [
  "Secretariat",
  "Chair",
  "Originating ministry",
] as const;

/** FR-REV-04 — visible to named recipients, which makes it an act on the record. */
export function CommentModal({
  item,
  page,
  onClose,
}: {
  item: ReadingItem;
  page?: number;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [recipients, setRecipients] = useState<string[]>(["Secretariat"]);
  const [body, setBody] = useState("");

  const ready = body.trim() && recipients.length > 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    dispatch(raiseComment({ item, body: body.trim(), recipients, page }));
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Raise a formal comment">
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {item.documentTitle}
          </p>
          <p className="mt-1 font-mono text-xs text-neutral-500 dark:text-neutral-400">
            {page ? `Page ${page} · ` : ""}
            {item.versionId}
          </p>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Visible to
          </legend>
          <div className="space-y-2">
            {RECIPIENTS.map((recipient) => (
              <CheckboxRow
                key={recipient}
                label={recipient}
                checked={recipients.includes(recipient)}
                onChange={(checked) =>
                  setRecipients((prev) =>
                    checked
                      ? [...prev, recipient]
                      : prev.filter((r) => r !== recipient),
                  )
                }
              />
            ))}
          </div>
        </fieldset>

        <Field
          label="Comment"
          hint="Written to the paper's record and readable by everyone selected above."
        >
          <TextArea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </Field>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={!ready} className={btnPrimary}>
            <FiSend size={15} aria-hidden="true" />
            Send comment
          </button>
        </div>
      </form>
    </Modal>
  );
}

const FLAG_KINDS: ReviewFlag["kind"][] = ["Requires attention", "Requires discussion"];

/** FR-REV-08 — surfaces on the Secretariat dashboard. */
export function FlagModal({
  item,
  onClose,
}: {
  item: ReadingItem;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [kind, setKind] = useState<ReviewFlag["kind"]>("Requires discussion");
  const [note, setNote] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!note.trim()) return;
    dispatch(raiseFlag({ item, kind, note: note.trim() }));
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Flag this matter">
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {item.agendaItemTitle}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {item.documentTitle} · {item.meetingId}
          </p>
        </div>

        <Field
          label="Kind"
          hint="Attention asks the Secretariat to look at something. Discussion asks for time in the room."
        >
          <Select
            options={FLAG_KINDS}
            value={kind}
            onChange={(e) => setKind(e.target.value as ReviewFlag["kind"])}
          />
        </Field>

        <Field label="What needs to happen">
          <TextArea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
        </Field>

        <p className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3 text-xs dark:border-neutral-800">
          <FiFlag size={14} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
          <span className="text-neutral-600 dark:text-neutral-300">
            This appears on the Secretariat dashboard against the agenda item, with
            your name on it. It is not a private note.
          </span>
        </p>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={!note.trim()} className={btnPrimary}>
            Raise the flag
          </button>
        </div>
      </form>
    </Modal>
  );
}
