"use client";

import type { ReactNode } from "react";
import type { Classification } from "@/core/app-constants";

export function classificationTone(c: Classification): string {
  switch (c) {
    case "TOP SECRET — CABINET":
      return "text-seal-500";
    case "SECRET":
      return "text-seal-500/90";
    case "CONFIDENTIAL":
      return "text-signal-500";
    case "RESTRICTED":
      return "text-state-700 dark:text-state-400";
    default:
      return "text-neutral-500 dark:text-neutral-400";
  }
}

export function StatusBadge({ tone, children }: { tone: "green" | "amber" | "red" | "neutral" | "blue"; children: ReactNode }) {
  const tones: Record<string, string> = {
    green: "bg-state-50 text-state-700 border-state-200 dark:bg-state-900/30 dark:text-state-400 dark:border-state-800",
    amber: "bg-amber-50 text-signal-500 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
    red: "bg-red-50 text-seal-500 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    blue: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800",
    neutral: "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Card({ title, action, children, className = "" }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 ${className}`}>
      {title && (
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
          <h2 className="font-bold">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Kpi({ label, value, hint, tone = "neutral" }: { label: string; value: ReactNode; hint?: string; tone?: "green" | "amber" | "red" | "neutral" }) {
  const tones: Record<string, string> = {
    green: "text-state-700 dark:text-state-400",
    amber: "text-signal-500",
    red: "text-seal-500",
    neutral: "text-neutral-900 dark:text-neutral-100",
  };
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${tones[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>}
    </div>
  );
}
