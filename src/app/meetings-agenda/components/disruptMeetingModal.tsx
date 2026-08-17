"use client";

import { useState } from "react";
import Modal from "@/common/modal";
import {
  CheckboxRow,
  Field,
  Select,
  TextArea,
  TextInput,
  btnDanger,
  btnGhost,
} from "@/common/field";
import { useAppDispatch } from "@/core/hook";
import { disruptMeeting } from "@/core/thunks-meetings";
import type { Meeting, MeetingDisruption } from "@/models/response/base-response";

const PACK_HANDLING: MeetingDisruption["packHandling"][] = [
  "Recalled",
  "Retained for the new date",
  "Left in place",
];

/**
 * FR-MTG-12 — cancellation and postponement, with participant notification and
 * an explicit decision about packs that have already been released.
 */
export default function DisruptMeetingModal({
  open,
  onClose,
  meeting,
}: {
  open: boolean;
  onClose: () => void;
  meeting: Meeting;
}) {
  const dispatch = useAppDispatch();
  const [kind, setKind] = useState<MeetingDisruption["kind"]>("Postponed");
  const [packHandling, setPackHandling] = useState<MeetingDisruption["packHandling"]>(
    "Retained for the new date",
  );
  const [notify, setNotify] = useState(true);
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(meeting.date);
  const [time, setTime] = useState(meeting.time);

  const packReleased = Boolean(meeting.packFrozenAt);

  function submit() {
    dispatch(
      disruptMeeting({
        meetingId: meeting.id,
        kind,
        reason: reason.trim() || "No reason recorded",
        packHandling,
        notifyParticipants: notify,
        postponedToDate: kind === "Postponed" ? date : undefined,
        postponedToTime: kind === "Postponed" ? time : undefined,
      }),
    );
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Cancel or postpone" wide>
      <div className="space-y-5">
        <Field label="Action">
          <Select
            options={["Postponed", "Cancelled"]}
            value={kind}
            onChange={(e) => setKind(e.target.value as MeetingDisruption["kind"])}
          />
        </Field>

        {kind === "Postponed" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New date">
              <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="New start time">
              <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
          </div>
        )}

        <Field label="Reason" hint="Recorded on the meeting history and the audit log">
          <TextArea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. The President is travelling on State business"
          />
        </Field>

        <Field
          label="Handling of released packs"
          hint={
            packReleased
              ? `This pack was frozen and released on ${meeting.packFrozenAt?.replace("T", " at ")}.`
              : "No pack has been released for this sitting yet."
          }
        >
          <Select
            options={PACK_HANDLING}
            value={packHandling}
            onChange={(e) =>
              setPackHandling(e.target.value as MeetingDisruption["packHandling"])
            }
          />
        </Field>

        <CheckboxRow
          checked={notify}
          onChange={setNotify}
          label={`Notify all ${meeting.participants.length} participants`}
        />

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="button" onClick={submit} className={btnDanger}>
            {kind === "Postponed" ? "Postpone meeting" : "Cancel meeting"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
