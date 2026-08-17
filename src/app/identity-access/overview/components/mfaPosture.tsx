"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { CabinetUser } from "@/models/response/base-response";

/**
 * FR-IAM-04 / 05 — how the estate authenticates. The three factors are a
 * strength order rather than three identities, so they take one hue in monotone
 * steps: the darkest step is the phishing-resistant one.
 */
const FACTORS: { key: CabinetUser["mfa"]; fill: string; note: string }[] = [
  {
    key: "FIDO2 key",
    fill: "var(--viz-ramp-3)",
    note: "Phishing-resistant hardware token",
  },
  {
    key: "Authenticator app",
    fill: "var(--viz-ramp-2)",
    note: "One-time code, phishable",
  },
  {
    key: "Pending enrolment",
    fill: "var(--viz-ramp-1)",
    note: "No second factor registered yet",
  },
];

export default function MfaPosture({ users }: { users: CabinetUser[] }) {
  const { counts, total } = useMemo(() => {
    const live = users.filter((u) => u.status !== "Deactivated");
    const counts = {
      "FIDO2 key": 0,
      "Authenticator app": 0,
      "Pending enrolment": 0,
    } as Record<CabinetUser["mfa"], number>;
    for (const user of live) counts[user.mfa] += 1;
    return { counts, total: live.length };
  }, [users]);

  const resistant = counts["FIDO2 key"];

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
          Authentication posture
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          {resistant} of {total} phishing-resistant
        </p>
      </header>

      {total === 0 ? (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          No account is open on this deployment.
        </p>
      ) : (
        <>
          <div
            className="mt-4 flex h-3 gap-[2px] overflow-hidden rounded-full"
            role="img"
            aria-label={FACTORS.map((f) => `${f.key}: ${counts[f.key]}`).join(", ")}
          >
            {FACTORS.filter((f) => counts[f.key] > 0).map((factor) => (
              <span
                key={factor.key}
                style={{
                  background: factor.fill,
                  width: `${(counts[factor.key] / total) * 100}%`,
                }}
              />
            ))}
          </div>

          <ul className="mt-4 space-y-3">
            {FACTORS.map((factor) => (
              <li key={factor.key} className="flex items-start justify-between gap-3">
                <span className="flex items-start gap-2 text-sm">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{ background: factor.fill }}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-neutral-700 dark:text-neutral-300">
                      {factor.key}
                    </span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                      {factor.note}
                    </span>
                  </span>
                </span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">
                  {counts[factor.key]}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/identity-access/authentication"
            className="mt-4 inline-block text-sm font-medium text-state-700 hover:underline dark:text-state-400"
          >
            Authentication policy →
          </Link>
        </>
      )}
    </section>
  );
}
