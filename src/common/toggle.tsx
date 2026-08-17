"use client";

import React from "react";

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export const Toggle: React.FC<Props> = ({ checked, onChange, label }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex items-center gap-2.5"
  >
    <span
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
        checked ? "bg-green-600" : "bg-neutral-200 dark:bg-neutral-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </span>
    {label && (
      <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
    )}
  </button>
);

export default Toggle;
