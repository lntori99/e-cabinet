"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="rounded border border-neutral-300 p-2 text-neutral-600 transition enabled:hover:border-state-500 enabled:hover:text-state-600 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"
      >
        <FiChevronLeft size={16} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`h-9 w-9 rounded font-mono text-sm transition ${
            p === page
              ? "bg-state-600 font-semibold text-white"
              : "border border-neutral-300 text-neutral-600 hover:border-state-500 hover:text-state-600 dark:border-neutral-700 dark:text-neutral-300"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="rounded border border-neutral-300 p-2 text-neutral-600 transition enabled:hover:border-state-500 enabled:hover:text-state-600 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300"
      >
        <FiChevronRight size={16} />
      </button>
    </nav>
  );
}
