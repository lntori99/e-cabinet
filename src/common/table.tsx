import type { ReactNode } from "react";

/**
 * The register table used across FR MTG. Kept here rather than in each page so
 * the deadline, disruption and carry-forward lists read as one document.
 * Wide content scrolls inside the frame; the page itself never scrolls sideways.
 */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full min-w-[42rem] border-collapse text-sm">
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`border-b border-neutral-200 bg-neutral-50 px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className = "",
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`border-b border-neutral-100 px-4 py-3 align-top text-neutral-700 dark:border-neutral-800/70 dark:text-neutral-300 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}

/** Dotted-leader row for the small definition lists these pages lean on. */
export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="register-row py-1 text-sm">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="font-medium text-neutral-900 dark:text-neutral-100">
        {value}
      </span>
    </div>
  );
}
