"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const controlBase =
  "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-state-500 focus:ring-1 focus:ring-state-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

export const controlCls = `w-full ${controlBase}`;

/**
 * The same control without the full-width rule, for filter rows where several
 * sit side by side. Overriding `w-full` from the class attribute does not work
 * — both are width utilities and the generated stylesheet decides which wins.
 */
export const filterCls = controlBase;

/** Label + control + optional hint, so forms look the same across modules. */
export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-neutral-500 dark:text-neutral-400">
          {hint}
        </span>
      )}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${controlCls} ${className}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea {...rest} className={`${controlCls} ${className}`} />;
}

export function Select({
  options,
  className = "",
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[] }) {
  return (
    <select {...rest} className={`${controlCls} ${className}`}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function CheckboxRow({
  label,
  checked,
  onChange,
  name,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
}) {
  return (
    <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 accent-state-600 dark:border-neutral-700"
      />
      <span>{label}</span>
    </label>
  );
}

/** Primary / secondary buttons used by the meeting modals. */
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-state-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-state-700 disabled:cursor-not-allowed disabled:opacity-50";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-seal-500 px-4 py-2 text-sm font-semibold text-seal-500 transition hover:bg-seal-500 hover:text-white";
