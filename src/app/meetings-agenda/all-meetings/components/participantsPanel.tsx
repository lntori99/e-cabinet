"use client";

import { useState } from "react";
import { FiPlus, FiUserX } from "react-icons/fi";
import { LuUsers } from "react-icons/lu";
import Modal from "@/common/modal";
import EmptyState from "@/common/emptyState";
import { StatusBadge } from "@/common/ui";
import { CheckboxRow, Select, btnGhost, btnPrimary, controlCls } from "@/common/field";
import { useAppDispatch } from "@/core/hook";
import {
  addParticipants,
  changeParticipantCapacity,
  recordAttendance,
  removeMeetingParticipant,
} from "@/core/thunks-meetings";
import {
  ATTENDANCE_MODES,
  PARTICIPANT_CAPACITIES,
  ROLE_GROUPS,
} from "@/data/meetingTypes";
import type {
  AttendanceMode,
  Meeting,
  ParticipantCapacity,
} from "@/models/response/base-response";

const ATTENDANCE_TONE: Record<AttendanceMode, "green" | "blue" | "amber" | "neutral"> = {
  Physical: "green",
  Video: "blue",
  Apology: "amber",
  "Not recorded": "neutral",
};

/** FR-MTG-04 — participants and capacities · FR-MTG-13 — attendance. */
export default function ParticipantsPanel({ meeting }: { meeting: Meeting }) {
  const dispatch = useAppDispatch();
  const [adding, setAdding] = useState(false);

  const tally = ATTENDANCE_MODES.map((mode) => ({
    mode,
    count: meeting.participants.filter((p) => p.attendance === mode).length,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* FR-MTG-13 — the attendance picture at a glance */}
        <div className="flex flex-wrap gap-2">
          {tally.map(({ mode, count }) => (
            <StatusBadge key={mode} tone={ATTENDANCE_TONE[mode]}>
              {mode}: {count}
            </StatusBadge>
          ))}
        </div>
        <button type="button" onClick={() => setAdding(true)} className={btnPrimary}>
          <FiPlus size={14} /> Add participants
        </button>
      </div>

      {meeting.participants.length === 0 ? (
        <EmptyState
          icon={LuUsers}
          title="No participants yet"
          description="Add people individually or bring in a whole role group. Each participant is recorded with the capacity they attend in."
          actions={[
            { label: "Add participants", onClick: () => setAdding(true), className: "rounded-lg bg-state-600 text-white hover:bg-state-700" },
          ]}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <th className="px-3 py-2.5">Participant</th>
                <th className="px-3 py-2.5">Role group</th>
                <th className="px-3 py-2.5">Capacity</th>
                <th className="px-3 py-2.5">Attendance</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {meeting.participants.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2.5">
                    <span className="block font-medium text-neutral-900 dark:text-neutral-100">
                      {p.name}
                    </span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                      {p.ministry}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600 dark:text-neutral-400">
                    {p.roleGroup}
                  </td>
                  <td className="px-3 py-2.5">
                    <Select
                      aria-label={`Capacity for ${p.name}`}
                      options={PARTICIPANT_CAPACITIES}
                      value={p.capacity}
                      onChange={(e) =>
                        dispatch(
                          changeParticipantCapacity(
                            meeting.id,
                            p.id,
                            e.target.value as ParticipantCapacity,
                          ),
                        )
                      }
                      className="w-auto py-1 text-xs"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <Select
                      aria-label={`Attendance for ${p.name}`}
                      options={ATTENDANCE_MODES}
                      value={p.attendance}
                      onChange={(e) =>
                        dispatch(
                          recordAttendance({
                            meetingId: meeting.id,
                            participantId: p.id,
                            attendance: e.target.value as AttendanceMode,
                          }),
                        )
                      }
                      className="w-auto py-1 text-xs"
                    />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      aria-label={`Remove ${p.name}`}
                      onClick={() => dispatch(removeMeetingParticipant(meeting.id, p.id))}
                      className="rounded p-1.5 text-neutral-400 transition hover:text-seal-500"
                    >
                      <FiUserX size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddParticipantsModal
        open={adding}
        onClose={() => setAdding(false)}
        meeting={meeting}
      />
    </div>
  );
}

/* FR-MTG-04 — individually or by role group. */
function AddParticipantsModal({
  open,
  onClose,
  meeting,
}: {
  open: boolean;
  onClose: () => void;
  meeting: Meeting;
}) {
  const dispatch = useAppDispatch();
  const [picked, setPicked] = useState<string[]>([]);
  const [capacity, setCapacity] = useState<ParticipantCapacity>("Member");
  const [name, setName] = useState("");
  const [ministry, setMinistry] = useState("");

  const already = new Set(meeting.participants.map((p) => p.name));
  const candidates = ROLE_GROUPS.flatMap((g) =>
    g.members.map((m) => ({ ...m, roleGroup: g.name, defaultCapacity: g.defaultCapacity })),
  ).filter((m) => !already.has(m.name));

  function toggle(key: string) {
    setPicked((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  }

  function pickGroup(group: string) {
    const keys = candidates.filter((c) => c.roleGroup === group).map((c) => c.name);
    const allPicked = keys.every((k) => picked.includes(k));
    setPicked((prev) =>
      allPicked ? prev.filter((k) => !keys.includes(k)) : [...new Set([...prev, ...keys])],
    );
  }

  function submit() {
    const people = candidates
      .filter((c) => picked.includes(c.name))
      .map((c) => ({
        name: c.name,
        ministry: c.ministry,
        roleGroup: c.roleGroup,
        capacity: c.defaultCapacity,
      }));

    if (name.trim()) {
      people.push({
        name: name.trim(),
        ministry: ministry.trim() || "—",
        roleGroup: "Individually added",
        capacity,
      });
    }
    if (people.length) dispatch(addParticipants({ meetingId: meeting.id, people }));
    setPicked([]);
    setName("");
    setMinistry("");
    onClose();
  }

  const groups = [...new Set(candidates.map((c) => c.roleGroup))];

  return (
    <Modal open={open} onClose={onClose} title="Add participants" wide>
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
            By role group
          </p>
          {groups.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Everyone in the standing role groups is already on this meeting.
            </p>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {group}
                    </span>
                    <button type="button" onClick={() => pickGroup(group)} className={`${btnGhost} px-2 py-1 text-xs`}>
                      Select all
                    </button>
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {candidates
                      .filter((c) => c.roleGroup === group)
                      .map((c) => (
                        <CheckboxRow
                          key={c.name}
                          checked={picked.includes(c.name)}
                          onChange={() => toggle(c.name)}
                          label={
                            <>
                              {c.name}
                              <span className="ml-1 text-xs text-neutral-500 dark:text-neutral-400">
                                · {c.ministry}
                              </span>
                            </>
                          }
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Or add an individual
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              aria-label="Participant name"
              className={controlCls}
            />
            <input
              value={ministry}
              onChange={(e) => setMinistry(e.target.value)}
              placeholder="Ministry"
              aria-label="Participant ministry"
              className={controlCls}
            />
            <Select
              aria-label="Capacity"
              options={PARTICIPANT_CAPACITIES}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value as ParticipantCapacity)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={picked.length === 0 && !name.trim()}
            className={btnPrimary}
          >
            Add {picked.length + (name.trim() ? 1 : 0) || ""} participant
            {picked.length + (name.trim() ? 1 : 0) === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
