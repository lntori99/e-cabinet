"use client";

import { useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiArchive,
  FiBriefcase,
  FiCheckCircle,
  FiPaperclip,
  FiSend,
  FiSunrise,
  FiUpload,
  FiUser,
} from "react-icons/fi";
import EmptyState from "@/common/emptyState";
import { Field, Select, TextArea, TextInput } from "@/common/field";
import { DetailRow } from "@/common/table";
import { stamp } from "@/common/time";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  selectActionRecords,
  selectDecisionRecords,
} from "@/core/slices/decision-slice";
import { MINISTRY_VIEWER } from "@/data/decisions";
import { progressAction, submitClosure } from "@/core/thunks-decisions";
import type { ActionRecord, ActionState } from "@/models/response/base-response";
import ActionRow from "./actionRow";
import UpdateTrail from "./updateTrail";
import { standing } from "./decisionStatus";

/** Which slice of the ministry's work a page is showing. */
export type MinistryScope =
  | "mine"
  | "ministry"
  | "due-soon"
  | "overdue"
  | "submitted"
  | "closed";

const PROGRESS_STATES: ActionState[] = ["Not started", "In progress"];

/**
 * The empty states live here rather than on each page: an icon is a function,
 * and a server page cannot hand one to a client component.
 */
const EMPTY: Record<
  MinistryScope,
  { icon: IconType; title: string; description: string }
> = {
  mine: {
    icon: FiUser,
    title: "Nothing is assigned to you",
    description:
      "No action names you as the responsible officer. Anything given to your ministry is under Ministry Actions.",
  },
  ministry: {
    icon: FiBriefcase,
    title: "Your ministry is carrying nothing",
    description: "No decision has placed an action on this ministry.",
  },
  "due-soon": {
    icon: FiSunrise,
    title: "Nothing falls due this week",
    description:
      "No action assigned to this ministry has a deadline inside the reminder window.",
  },
  overdue: {
    icon: FiCheckCircle,
    title: "Nothing is late",
    description: "No action assigned to this ministry has passed its deadline.",
  },
  submitted: {
    icon: FiSend,
    title: "Nothing is with the Secretariat",
    description:
      "No action has been submitted for closure. Submit one from My Actions once the evidence exists.",
  },
  closed: {
    icon: FiArchive,
    title: "Nothing has closed yet",
    description:
      "No action assigned to this ministry has been verified and closed.",
  },
};

/**
 * Every ministry page is the same list with a different filter, so they share
 * one component. What changes is which actions are in scope and whether the
 * officer can still do anything to them — a closed action carries no controls,
 * and an action belonging to a colleague is read-only for this officer.
 */
export default function MinistryBoard({
  scope,
  today,
}: {
  scope: MinistryScope;
  today: string;
}) {
  const actions = useAppSelector(selectActionRecords);
  const decisions = useAppSelector(selectDecisionRecords);

  const shown = useMemo(() => {
    const mine = actions.filter((a) => a.ministry === MINISTRY_VIEWER.ministry);
    const list =
      scope === "mine"
        ? mine.filter((a) => a.officer === MINISTRY_VIEWER.officer)
        : scope === "ministry"
          ? mine
          : scope === "due-soon"
            ? mine.filter((a) => standing(a, today) === "Due soon")
            : scope === "overdue"
              ? mine.filter((a) => standing(a, today) === "Overdue")
              : scope === "submitted"
                ? mine.filter((a) => a.state === "Submitted for closure")
                : mine.filter((a) => a.state === "Closed");
    return [...list].sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [actions, scope, today]);

  if (shown.length === 0) {
    const empty = EMPTY[scope];
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={empty.icon}
          title={empty.title}
          description={empty.description}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {shown.length} action{shown.length === 1 ? "" : "s"} ·{" "}
        {MINISTRY_VIEWER.ministry}
        {scope === "mine" ? ` · ${MINISTRY_VIEWER.officer}` : ""}
      </p>

      {shown.map((item) => {
        const decision = decisions.find((d) => d.id === item.decisionId);
        const mine = item.officer === MINISTRY_VIEWER.officer;
        const open = item.state !== "Closed" && item.state !== "Cancelled";

        return (
          <ActionRow
            key={item.id}
            item={item}
            today={today}
            decisionTitle={decision?.agendaItemTitle}
          >
            {item.evidence && (
              <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
                <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  <FiPaperclip size={11} aria-hidden="true" />
                  Evidence submitted
                </p>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                  {item.evidence.description}
                </p>
                <div className="mt-3 space-y-0.5">
                  <DetailRow label="Reference" value={item.evidence.reference} />
                  <DetailRow
                    label="Submitted"
                    value={`${item.evidence.submittedBy} · ${stamp(item.evidence.submittedAt)}`}
                  />
                  <DetailRow
                    label="Verification"
                    value={
                      item.verifiedAt
                        ? `Verified by ${item.verifiedBy} · ${stamp(item.verifiedAt)}`
                        : "Awaiting the Secretariat"
                    }
                  />
                </div>
              </div>
            )}

            <UpdateTrail actionId={item.id} />

            {open && mine && <Controls item={item} />}

            {open && !mine && (
              <p className="border-t border-neutral-200 px-5 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                Assigned to {item.officer}. Progress is reported by the officer
                responsible, so this one is read-only for you.
              </p>
            )}
          </ActionRow>
        );
      })}
    </div>
  );
}

/**
 * FR-DEC-07 and FR-DEC-10. Progress and closure are deliberately separate:
 * reporting that work is under way is not the same act as asking for the action
 * to be signed off, and the second one needs evidence.
 */
function Controls({ item }: { item: ActionRecord }) {
  const dispatch = useAppDispatch();
  const [narrative, setNarrative] = useState("");
  const [state, setState] = useState<ActionState>(
    item.state === "Not started" ? "In progress" : item.state,
  );
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");

  const awaiting = item.state === "Submitted for closure";

  if (awaiting) {
    return (
      <p className="border-t border-neutral-200 px-5 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        Closure has been requested and is with the Secretariat. Nothing further
        is needed from the ministry unless it comes back.
      </p>
    );
  }

  return (
    <div className="grid gap-6 border-t border-neutral-200 px-5 py-4 lg:grid-cols-2 dark:border-neutral-800">
      <section className="space-y-3">
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Report progress
        </h4>
        <Field label="What has happened">
          <TextArea
            rows={3}
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="Circular drafted and with the Principal Secretary for signature …"
          />
        </Field>
        <Field label="Status">
          <Select
            value={state}
            options={PROGRESS_STATES}
            onChange={(e) => setState(e.target.value as ActionState)}
          />
        </Field>
        <div className="flex justify-end">
          <button
            type="button"
            disabled={narrative.trim().length === 0}
            onClick={() => {
              dispatch(progressAction(item, state, narrative.trim()));
              setNarrative("");
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-state-600 px-3 py-1.5 text-sm font-medium text-state-700 transition hover:bg-state-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-state-400"
          >
            <FiUpload size={14} aria-hidden="true" />
            Record update
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Request closure
        </h4>
        <Field label="Evidence reference" hint="The file or report that shows it is done.">
          <TextInput
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="FIN/CIR/2026/031"
          />
        </Field>
        <Field label="What the evidence shows">
          <TextArea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            The Secretariat verifies before it closes.
          </p>
          <button
            type="button"
            disabled={reference.trim().length === 0 || description.trim().length === 0}
            onClick={() =>
              dispatch(
                submitClosure(item, {
                  reference: reference.trim(),
                  description: description.trim(),
                }),
              )
            }
            className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiSend size={14} aria-hidden="true" />
            Submit for closure
          </button>
        </div>
      </section>
    </div>
  );
}
