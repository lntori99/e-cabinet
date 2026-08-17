import type { ReactNode } from "react";

/** Every settings section is a stack of these — a title, a why, and the controls. */
export default function SettingsCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
        <div className="min-w-0">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
