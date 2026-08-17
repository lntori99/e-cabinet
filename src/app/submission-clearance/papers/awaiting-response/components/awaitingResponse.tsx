"use client";

import { useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { LuCircleCheckBig } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { Field, TextInput, btnPrimary } from "@/common/field";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectMinistrySubmissions } from "@/core/slices/submissions-slice";
import { addComment, resubmitPaper } from "@/core/thunks-submissions";
import PaperDetail from "../../../components/paperDetail";
import PaperList from "../../../components/paperList";
import { SUBMITTER } from "../../../components/subStatus";

export default function AwaitingResponse({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const selector = useMemo(() => selectMinistrySubmissions(SUBMITTER.ministry), []);
  const mine = useAppSelector(selector);

  const returned = mine.filter((s) => s.status === "Returned for amendment");
  const [selectedId, setSelectedId] = useState(returned[0]?.id ?? "");
  const [note, setNote] = useState("");

  const selected =
    returned.find((s) => s.id === selectedId) ?? returned[0] ?? null;

  if (returned.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuCircleCheckBig}
          title="Nothing is waiting on you"
          description="No paper from your ministry has been returned for amendment. Anything sent back will appear here with the comment that explains why."
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          {returned.length} awaiting a response
        </p>
        <PaperList
          submissions={returned}
          selectedId={selected?.id ?? ""}
          onSelect={setSelectedId}
          emptyMessage="Nothing is waiting on you."
        />
      </div>

      <div className="min-w-0">
        {selected && (
          <PaperDetail
            submission={selected}
            now={now}
            onReply={(body, replyToId) =>
              dispatch(
                addComment({
                  submissionId: selected.id,
                  stage: "Submission",
                  body,
                  role: SUBMITTER.role,
                  replyToId,
                }),
              )
            }
            actions={
              <div className="space-y-3">
                <Field
                  label="Resubmit"
                  hint="Describe what changed. A new version is added; the thread and earlier versions are untouched, and the stage that returned it reopens."
                >
                  <TextInput
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Clause 14 redrafted and consequential schedule added"
                  />
                </Field>
                <button
                  type="button"
                  disabled={!note.trim()}
                  onClick={() => {
                    dispatch(
                      resubmitPaper({
                        submissionId: selected.id,
                        title: selected.title,
                        note: note.trim(),
                      }),
                    );
                    setNote("");
                  }}
                  className={btnPrimary}
                >
                  <FiRefreshCw size={15} aria-hidden="true" />
                  Resubmit for clearance
                </button>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
