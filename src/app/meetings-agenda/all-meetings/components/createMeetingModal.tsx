"use client";

import { useState, type FormEvent } from "react";
import Modal from "@/common/modal";
import {
  CheckboxRow,
  Field,
  Select,
  TextInput,
  btnGhost,
  btnPrimary,
} from "@/common/field";
import { useAppDispatch } from "@/core/hook";
import { createMeeting } from "@/core/thunks-meetings";
import {
  MEETING_TYPE_NAMES,
  RECURRENCES,
  ROLE_GROUPS,
  meetingTypeConfig,
} from "@/data/meetingTypes";
import type {
  MeetingParticipant,
  MeetingType,
  Recurrence,
} from "@/models/response/base-response";

const STANDING_ITEM_SUGGESTIONS = [
  "Confirmation of previous minutes",
  "Matters arising",
  "Any other business",
];

/**
 * FR-MTG-01 create · FR-MTG-02 type defaults · FR-MTG-03 date/time/duration/
 * venue/type/chair · FR-MTG-04 participants by role group · FR-MTG-05 deadline ·
 * FR-MTG-10 recurrence and standing items.
 */
export default function CreateMeetingModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [type, setType] = useState<MeetingType>("Full Cabinet");
  const [recurrence, setRecurrence] = useState<Recurrence>("None");
  const [groups, setGroups] = useState<string[]>(["Cabinet Members", "Secretariat"]);
  const [standing, setStanding] = useState<string[]>([STANDING_ITEM_SUGGESTIONS[0]]);
  const [hybrid, setHybrid] = useState(true);

  const config = meetingTypeConfig(type);

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // FR-MTG-04 — role groups expand into individually recorded participants.
    const participants: MeetingParticipant[] = ROLE_GROUPS.filter((g) =>
      groups.includes(g.name),
    ).flatMap((g) =>
      g.members.map((m, i) => ({
        id: `P-${g.name.slice(0, 3).toUpperCase()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        name: m.name,
        ministry: m.ministry,
        roleGroup: g.name,
        capacity: g.defaultCapacity,
        attendance: "Not recorded" as const,
      })),
    );

    dispatch(
      createMeeting({
        title: String(fd.get("title")),
        type,
        chair: String(fd.get("chair")),
        date: String(fd.get("date")),
        time: String(fd.get("time")),
        durationMinutes: Number(fd.get("durationMinutes")),
        venue: String(fd.get("venue")),
        submissionDeadline: String(fd.get("deadline")),
        hybrid,
        recurrence,
        participants,
        standingItems: recurrence === "None" ? [] : standing,
      }),
    );
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Create a meeting" wide>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Meeting title">
          <TextInput name="title" required placeholder="e.g. 15th Ordinary Cabinet Sitting" />
        </Field>

        {/* FR-MTG-02 — the chosen type dictates the rules below */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Meeting type">
            <Select
              name="type"
              options={MEETING_TYPE_NAMES}
              value={type}
              onChange={(e) => setType(e.target.value as MeetingType)}
            />
          </Field>
          <Field label="Chair">
            <TextInput name="chair" required placeholder="e.g. His Excellency the President" />
          </Field>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Rules applied by this type
          </p>
          <dl className="mt-2 grid gap-1.5 sm:grid-cols-2">
            <div>
              <dt className="inline text-neutral-500 dark:text-neutral-400">Participants: </dt>
              <dd className="inline text-neutral-800 dark:text-neutral-200">{config.participantRule}</dd>
            </div>
            <div>
              <dt className="inline text-neutral-500 dark:text-neutral-400">Handling: </dt>
              <dd className="inline text-neutral-800 dark:text-neutral-200">{config.documentHandling}</dd>
            </div>
            <div>
              <dt className="inline text-neutral-500 dark:text-neutral-400">Classification default: </dt>
              <dd className="inline text-neutral-800 dark:text-neutral-200">{config.classificationDefault}</dd>
            </div>
            <div>
              <dt className="inline text-neutral-500 dark:text-neutral-400">Approval path: </dt>
              <dd className="inline text-neutral-800 dark:text-neutral-200">{config.approvalPath.join(" → ")}</dd>
            </div>
          </dl>
        </div>

        {/* FR-MTG-03 */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date">
            <TextInput name="date" type="date" required />
          </Field>
          <Field label="Start time">
            <TextInput name="time" type="time" required />
          </Field>
          <Field label="Expected duration" hint="Minutes">
            <TextInput name="durationMinutes" type="number" min={15} step={15} defaultValue={120} required />
          </Field>
        </div>

        <Field label="Venue or room">
          <TextInput name="venue" required placeholder="e.g. Cabinet Room, Capital Hill, Lilongwe" />
        </Field>

        {/* FR-MTG-05 */}
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <Field label="Submission deadline" hint="Enforced — papers cannot be submitted after this">
            <TextInput name="deadline" type="datetime-local" required />
          </Field>
          <div className="pt-7">
            <CheckboxRow
              name="hybrid"
              label="Approve hybrid (video) participation"
              checked={hybrid}
              onChange={setHybrid}
            />
          </div>
        </div>

        {/* FR-MTG-04 */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Participants by role group
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {ROLE_GROUPS.map((g) => (
              <CheckboxRow
                key={g.name}
                label={
                  <>
                    {g.name}
                    <span className="ml-1 text-xs text-neutral-500 dark:text-neutral-400">
                      · {g.members.length} people, added as {g.defaultCapacity}
                    </span>
                  </>
                }
                checked={groups.includes(g.name)}
                onChange={() => toggle(groups, g.name, setGroups)}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Individuals can be added, re-capacitated or removed after creation.
          </p>
        </fieldset>

        {/* FR-MTG-10 */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Recurrence" hint="Anything but None opens a series">
            <Select
              options={RECURRENCES}
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as Recurrence)}
            />
          </Field>
          {recurrence !== "None" && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Standing agenda items
              </legend>
              <div className="space-y-1.5">
                {STANDING_ITEM_SUGGESTIONS.map((s) => (
                  <CheckboxRow
                    key={s}
                    label={s}
                    checked={standing.includes(s)}
                    onChange={() => toggle(standing, s, setStanding)}
                  />
                ))}
              </div>
            </fieldset>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary}>
            Create meeting
          </button>
        </div>
      </form>
    </Modal>
  );
}
