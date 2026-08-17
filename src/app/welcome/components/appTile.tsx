import Link from "next/link";
import type { CabinetApp } from "@/data/apps";

const shell =
  "group relative flex h-full flex-col rounded-2xl border p-5 text-left transition-all duration-200";


export default function AppTile({ app }: { app: CabinetApp }) {
  const { code, label, title, icon: Icon, href } = app;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
            href
              ? "bg-state-50 text-state-700 group-hover:bg-state-600 group-hover:text-white dark:bg-state-900/40 dark:text-state-300"
              : "bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-neutral-600"
          }`}
        >
          <Icon size={20} />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-neutral-500">
          {code}
        </span>
      </div>

      <h2
        className={`mt-4 text-base font-bold ${
          href
            ? "text-gray-900 dark:text-neutral-50"
            : "text-gray-500 dark:text-neutral-400"
        }`}
      >
        {label}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-neutral-400">
        {title}
      </p>

      {!href && (
        <span className="mt-3 inline-flex w-fit rounded-full border border-gray-300 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:border-neutral-700 dark:text-neutral-500">
          Not yet available
        </span>
      )}
    </>
  );

  if (!href) {
    return (
      <div
        aria-disabled="true"
        className={`${shell} border-dashed border-gray-200 bg-transparent dark:border-neutral-800`}
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`${shell} border-gray-200 bg-white hover:-translate-y-0.5 hover:border-state-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-state-600 focus-visible:ring-offset-2 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-state-700`}
    >
      {body}
    </Link>
  );
}
