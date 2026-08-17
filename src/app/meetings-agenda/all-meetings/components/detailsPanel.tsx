"use client";

import { useState } from "react";
import { FiAlertTriangle, FiLock, FiRepeat } from "react-icons/fi";
import { StatusBadge } from "@/common/ui";
import { btnDanger, btnGhost, btnPrimary } from "@/common/field";
import { useAppDispatch } from "@/core/hook";
import { submissionsClosed } from "@/core/slices/meetings-slice";
import { freezeMeetingPack } from "@/core/thunks-meetings";
import { meetingTypeConfig } from "@/data/meetingTypes";
import type { Meeting } from "@/models/response/base-response";
import DisruptMeetingModal from "../../components/disruptMeetingModal";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="register-row py-1.5">
      <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
      <span className="text-right text-neutral-900 dark:text-neutral-100">{children}</span>
    </div>
  );
}

/**
 * FR-MTG-03 the captured details · FR-MTG-02 the rules its type applies ·
 * FR-MTG-05 deadline enforcement · FR-MTG-10 series · FR-MTG-12 disruption.
 */
export default function DetailsPanel({ meeting }: { meeting: Meeting }) {
  const dispatch = useAppDispatch();
  const [disrupting, setDisrupting] = useState(false);

  const config = meetingTypeConfig(meeting.type);
  // Compared as a local ISO string, matching how the deadline is stored.
  const now = new Date().toISOString().slice(0, 16);
  const closed = submissionsClosed(meeting, now);
  const ended = meeting.status === "Cancelled" || meeting.status === "Concluded";

  const hours = Math.floor(meeting.durationMinutes / 60);
  const mins = meeting.durationMinutes % 60;
  const duration = [hours ? `${hours}h` : "", mins ? `${mins}m` : ""].filter(Boolean).join(" ");

  return (
    <div className="space-y-6">
      {meeting.disruption && (
        <div className="rounded-lg border border-seal-500/40 bg-seal-500/5 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-seal-500">
            <FiAlertTriangle size={15} />
            {meeting.disruption.kind}
          </p>
          <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
            {meeting.disruption.reason}
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-wide text-neutral-500 dark:text-neutral-400">
            Packs {meeting.disruption.packHandling} · participants{" "}
            {meeting.disruption.participantsNotified ? "notified" : "not notified"} ·
            recorded by {meeting.disruption.by} at {meeting.disruption.at}
            {meeting.disruption.postponedToDate && (
              <span className="mt-0.5 block">
                Moved to {meeting.disruption.postponedToDate} at{" "}
                {meeting.disruption.postponedToTime}
              </span>
            )}
          </p>
        </div>
      )}

      <div className="grid gap-x-10 gap-y-1 text-sm sm:grid-cols-2">
        {/* FR-MTG-03 */}
        <Row label="Reference">{meeting.id}</Row>
        <Row label="Meeting type">{meeting.type}</Row>
        <Row label="Date">{meeting.date}</Row>
        <Row label="Start time">{meeting.time}</Row>
        <Row label="Expected duration">{duration}</Row>
        <Row label="Venue or room">{meeting.venue}</Row>
        <Row label="Chair">{meeting.chair}</Row>
        <Row label="Hybrid participation">{meeting.hybrid ? "Approved" : "Not approved"}</Row>
        {/* FR-MTG-10 */}
        <Row label="Recurrence">
          {meeting.recurrence === "None" ? (
            "One-off sitting"
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <FiRepeat size={12} /> {meeting.recurrence}
              {meeting.seriesId && (
                <span className="font-mono text-[10px] uppercase tracking-wide text-neutral-500">
                  {meeting.seriesId}
                </span>
              )}
            </span>
          )}
        </Row>
        {/* FR-MTG-05 */}
        <Row label="Submission deadline">
          <span className="inline-flex items-center gap-2">
            <span className="font-mono text-xs">
              {meeting.submissionDeadline.replace("T", " ")}
            </span>
            <StatusBadge tone={closed ? "red" : "green"}>
              {closed ? "Closed" : "Open"}
            </StatusBadge>
          </span>
        </Row>
      </div>

      {closed && !ended && (
        <p className="rounded-lg border border-signal-400/40 bg-signal-400/5 px-3 py-2 text-xs text-signal-500">
          The submission window has closed. New papers are refused for this
          sitting; a late paper needs documented Secretariat approval.
        </p>
      )}

      {/* FR-MTG-02 */}
      <section>
        <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          Rules applied by this meeting type
        </h3>
        <div className="grid gap-x-10 gap-y-1 text-sm sm:grid-cols-2">
          <Row label="Participant rule">{config.participantRule}</Row>
          <Row label="Document handling">{config.documentHandling}</Row>
          <Row label="Classification default">{config.classificationDefault}</Row>
          <Row label="Approval path">{config.approvalPath.join(" → ")}</Row>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        {meeting.packFrozenAt ? (
          <p className="flex items-center gap-2 rounded-lg border border-state-300 bg-state-50 px-3 py-2 text-xs text-state-800 dark:border-state-700 dark:bg-state-900/20 dark:text-state-300">
            <FiLock size={12} />
            Pack frozen {meeting.packFrozenAt.replace("T", " at ")} by {meeting.packFrozenBy}
          </p>
        ) : (
          <button
            type="button"
            disabled={meeting.agenda.length === 0 || ended}
            onClick={() => dispatch(freezeMeetingPack({ meetingId: meeting.id }))}
            className={btnPrimary}
          >
            <FiLock size={14} /> Freeze pack for release
          </button>
        )}

        <button
          type="button"
          disabled={ended}
          onClick={() => setDisrupting(true)}
          className={ended ? btnGhost : btnDanger}
        >
          Cancel or postpone
        </button>
      </div>

      <DisruptMeetingModal
        open={disrupting}
        onClose={() => setDisrupting(false)}
        meeting={meeting}
      />
    </div>
  );
}
