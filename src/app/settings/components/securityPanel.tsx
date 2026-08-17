"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiKey,
  FiShield,
} from "react-icons/fi";
import { Field, btnPrimary, controlCls } from "@/common/field";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge, classificationTone } from "@/common/ui";
import { OPERATOR } from "@/core/app-constants";
import { useAppSelector } from "@/core/hook";
import { selectTokens } from "@/core/slices/identity-slice";
import { IDENTITY_PROVIDER, STEP_UP_RULES, mfaPolicy } from "@/data/identityAccess";
import SettingsCard from "./settingsCard";

const RULES = [
  "At least 12 characters",
  "Upper and lower case",
  "A digit and a symbol",
];

/** Local to this panel — the auth screens have their own, styled for those pages. */
function SecretField({
  name,
  label,
  hint,
  autoComplete,
}: {
  name: string;
  label: string;
  hint?: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          name={name}
          id={name}
          required
          autoComplete={autoComplete}
          className={`${controlCls} pr-11`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 transition hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          {visible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>
    </Field>
  );
}

export default function SecurityPanel({
  changePassword,
  error,
  changed,
}: {
  changePassword: (formData: FormData) => void;
  error?: string;
  changed?: boolean;
}) {
  const tokens = useAppSelector(selectTokens);
  // The signed-in operator is USR-003 in the seeded directory.
  const mine = tokens.filter((t) => t.holderId === "USR-003");
  const policy = mfaPolicy("Secretariat Administrator");

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Change your password"
        description="This credential is only used on the local resilience path — the route that keeps the Secretariat working when the Government directory is unreachable. Day to day you sign in through single sign-on."
      >
        {changed && (
          <p
            className="mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm"
            style={{ borderColor: "var(--viz-good)" }}
          >
            <FiCheckCircle
              size={15}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--viz-good)" }}
              aria-hidden="true"
            />
            <span className="text-neutral-700 dark:text-neutral-300">
              Password changed. Every other session you hold has been signed out.
            </span>
          </p>
        )}

        {error && (
          <p
            className="mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm"
            style={{ borderColor: "var(--viz-critical)" }}
          >
            <FiAlertCircle
              size={15}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--viz-critical)" }}
              aria-hidden="true"
            />
            <span className="text-neutral-700 dark:text-neutral-300">{error}</span>
          </p>
        )}

        <form action={changePassword} className="max-w-lg space-y-4">
          <SecretField
            name="current"
            label="Current password"
            autoComplete="current-password"
          />
          <SecretField
            name="next"
            label="New password"
            autoComplete="new-password"
            hint="Length first, then variety."
          />
          <SecretField
            name="confirm"
            label="Confirm new password"
            autoComplete="new-password"
          />

          <ul className="flex flex-wrap gap-2">
            {RULES.map((rule) => (
              <li
                key={rule}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
              >
                {rule}
              </li>
            ))}
          </ul>

          <button type="submit" className={btnPrimary}>
            <FiKey size={15} aria-hidden="true" />
            Change password
          </button>
        </form>
      </SettingsCard>

      <SettingsCard
        title="How you sign in"
        description="Your role's authentication policy. It is set centrally and cannot be relaxed from here."
      >
        <div className="space-y-0.5">
          <DetailRow label="Directory" value={IDENTITY_PROVIDER.name} />
          <DetailRow
            label="Single sign-on"
            value={
              <StatusBadge tone={IDENTITY_PROVIDER.status === "Connected" ? "green" : "amber"}>
                {IDENTITY_PROVIDER.status}
              </StatusBadge>
            }
          />
          <DetailRow label="Accepted factors" value={policy.factors.join(" or ")} />
          <DetailRow label="Enforcement" value={policy.enforcement} />
          <DetailRow label="Signed in as" value={OPERATOR.email} />
        </div>

        <h3 className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          Your security keys
        </h3>
        {mine.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            No hardware token is registered to you.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {mine.map((token) => (
              <li
                key={token.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <span className="min-w-0">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    <FiKey size={13} className="text-neutral-400" aria-hidden="true" />
                    {token.serial}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {token.model} · registered {token.registeredAt} · last used{" "}
                    {stamp(token.lastUsed)}
                  </span>
                </span>
                <StatusBadge tone={token.status === "Active" ? "green" : "amber"}>
                  {token.status}
                </StatusBadge>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          Report a lost key immediately — it is revoked from{" "}
          <Link
            href="/identity-access/authentication"
            className="font-medium text-state-700 hover:underline dark:text-state-400"
          >
            Authentication
          </Link>{" "}
          and stops working the moment it is.
        </p>
      </SettingsCard>

      <SettingsCard
        title="When you will be challenged again"
        description="Opening a document above the configured classification asks for a fresh factor, however recently you signed in."
      >
        <Table>
          <thead>
            <tr>
              <Th>Classification</Th>
              <Th>Challenge</Th>
              <Th align="right">Factor age</Th>
            </tr>
          </thead>
          <tbody>
            {STEP_UP_RULES.map((rule) => (
              <tr key={rule.classification}>
                <Td>
                  <span className={`stamp ${classificationTone(rule.classification)}`}>
                    <FiShield size={10} />
                    {rule.classification}
                  </span>
                </Td>
                <Td>{rule.requires}</Td>
                <Td align="right">
                  <span className="font-mono">{rule.maxAgeMinutes} min</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </SettingsCard>
    </div>
  );
}
