import type { ReactNode } from "react";

/**
 * The title block every console page opens with. Server-rendered — actions are
 * passed in from whichever client component owns them.
 */
export default function PageHeading({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description: string;
  /** Functional requirement reference, e.g. "FR-MTG-01". */
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      </div>
      {actions}
    </div>
  );
}
