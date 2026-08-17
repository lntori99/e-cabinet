"use client";

import { FiCornerDownRight, FiEye, FiCheckCircle } from "react-icons/fi";
import { LuMessagesSquare } from "react-icons/lu";
import EmptyState from "@/common/emptyState";
import { stamp } from "@/common/time";
import { StatusBadge } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectComments } from "@/core/slices/review-slice";
import { closeComment } from "@/core/thunks-review";
import { COMMENT_TONE } from "../../components/readingStatus";

export default function CommentsBoard() {
  const dispatch = useAppDispatch();
  const comments = useAppSelector(selectComments);

  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <EmptyState
          icon={LuMessagesSquare}
          title="You have raised no comments"
          description="A formal comment goes to the recipients you choose — the Secretariat, the chair, or the originating ministry — and stays on the paper's record."
        />
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {comment.id} · {comment.meetingId}
                {comment.page ? ` · page ${comment.page}` : ""}
              </p>
              <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                {comment.documentTitle}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                <FiEye size={11} aria-hidden="true" />
                Visible to {comment.recipients.join(", ")}
              </p>
            </div>
            <StatusBadge tone={COMMENT_TONE[comment.status]}>
              {comment.status}
            </StatusBadge>
          </header>

          <div className="space-y-3 px-5 py-4">
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {comment.body}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              {stamp(comment.at)}
            </p>

            {comment.replies.map((reply) => (
              <article
                key={reply.id}
                className="ml-6 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/60"
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

            {comment.status !== "Closed" && (
              <button
                type="button"
                onClick={() => dispatch(closeComment(comment.id, comment.documentTitle))}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
              >
                <FiCheckCircle size={14} aria-hidden="true" />
                Close — I am satisfied
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
