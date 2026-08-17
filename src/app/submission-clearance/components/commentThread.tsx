"use client";

import { useState } from "react";
import { FiCornerDownRight, FiSend } from "react-icons/fi";
import { TextArea, btnPrimary } from "@/common/field";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import type { ClearanceComment } from "@/models/response/base-response";

const DECISION_TONE = {
  Approved: "green",
  Rejected: "red",
  "Returned for amendment": "amber",
} as const;

/**
 * FR-SUB-10 / 11 — one thread per paper, visible to the submitter and to every
 * later clearance actor. Replies hang off the comment they answer, so a
 * resubmission never orphans the reason it was asked for.
 */
export default function CommentThread({
  comments,
  onReply,
  replyLabel = "Reply to this comment",
}: {
  comments: ClearanceComment[];
  onReply?: (body: string, replyToId?: string) => void;
  replyLabel?: string;
}) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [body, setBody] = useState("");

  const roots = comments.filter((c) => !c.replyToId);
  const repliesFor = (id: string) => comments.filter((c) => c.replyToId === id);

  function send(replyToId?: string) {
    if (!body.trim() || !onReply) return;
    onReply(body.trim(), replyToId);
    setBody("");
    setReplyingTo(null);
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No clearance comment has been recorded against this paper yet.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {roots.map((comment) => (
        <li key={comment.id}>
          <article className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {comment.by}
                <span className="ml-2 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                  {comment.role} · {comment.stage}
                </span>
              </span>
              <span className="flex items-center gap-2">
                {comment.decision && (
                  <StatusBadge tone={DECISION_TONE[comment.decision]}>
                    {comment.decision}
                  </StatusBadge>
                )}
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {stamp(comment.at)}
                </span>
              </span>
            </header>

            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
              {comment.body}
            </p>

            {onReply && (
              <button
                type="button"
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
                className="mt-2 text-xs font-medium text-state-700 hover:underline dark:text-state-400"
              >
                {replyingTo === comment.id ? "Cancel" : replyLabel}
              </button>
            )}
          </article>

          {repliesFor(comment.id).map((reply) => (
            <article
              key={reply.id}
              className="mt-2 ml-6 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/60"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  <FiCornerDownRight
                    size={12}
                    className="text-neutral-400"
                    aria-hidden="true"
                  />
                  {reply.by}
                  <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                    {reply.role}
                  </span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {stamp(reply.at)}
                </span>
              </header>
              <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                {reply.body}
              </p>
            </article>
          ))}

          {replyingTo === comment.id && onReply && (
            <div className="mt-2 ml-6 space-y-2">
              <TextArea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Answer the point raised. Your reply joins the thread and stays with the paper."
              />
              <button
                type="button"
                onClick={() => send(comment.id)}
                disabled={!body.trim()}
                className={btnPrimary}
              >
                <FiSend size={14} aria-hidden="true" />
                Post reply
              </button>
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
