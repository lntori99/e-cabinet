"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiArrowRight,
  FiCheck,
  FiEdit3,
  FiLock,
  FiShield,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { Field, TextArea, TextInput } from "@/common/field";
import { StatusBadge } from "@/common/ui";
import { OPERATOR } from "@/core/app-constants";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectDutyRules, selectSettings } from "@/core/slices/admin-slice";
import { ACCOUNT_ADMIN_HOME } from "@/data/administration";
import { changeSetting, proposeChange } from "@/core/thunks-admin";
import type { ConfigArea, ConfigSetting } from "@/models/response/base-response";

const AREAS: ConfigArea[] = [
  "Roles and permissions",
  "Classification handling",
  "Meeting types",
  "Clearance paths",
  "Retention classes",
  "Notification templates",
];

/**
 * FR-ADM-02 and FR-ADM-03 — everything here is data rather than code, so an
 * administrator changes it without a release. What differs between a setting
 * and a security-relevant setting is not who may touch it but what happens
 * next: one applies, the other becomes a proposal for somebody else to weigh.
 */
export default function ConfigBoard() {
  const settings = useAppSelector(selectSettings);
  const dutyRules = selectDutyRules();

  return (
    <div className="space-y-8">
      <section
        className="flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <FiUsers size={18} className="mt-0.5 shrink-0 text-neutral-400" aria-hidden="true" />
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            Individual accounts are administered next door
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-ADM-01 — provisioning, amending, suspending and deactivating an
            account happens in Identity and Access, alongside the role model it
            depends on. This screen configures what the roles mean.
          </p>
          <Link
            href={ACCOUNT_ADMIN_HOME}
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-state-700 hover:underline dark:text-state-400"
          >
            Open user administration <FiArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section
        className="rounded-lg border bg-white dark:bg-neutral-900"
        style={{ borderColor: "var(--viz-grid)" }}
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
          <span className="inline-flex items-center gap-2 font-bold">
            <FiShield size={15} className="text-neutral-400" aria-hidden="true" />
            What the role catalogue may not combine
          </span>
          <StatusBadge tone="green">FR-ADM-13</StatusBadge>
        </header>
        <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {dutyRules.map((rule) => (
            <li key={rule.id} className="px-5 py-3 text-sm">
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {rule.leftRight} + {rule.rightRight}
              </p>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                {rule.reason}
              </p>
            </li>
          ))}
        </ul>
        <p className="border-t border-neutral-200 px-5 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          A permission-set change that would put both rights on one role is
          refused when it is proposed, not discovered at the next access review.
        </p>
      </section>

      {AREAS.map((area) => {
        const mine = settings.filter((s) => s.area === area);
        if (mine.length === 0) return null;

        return (
          <section key={area} className="space-y-3">
            <h2 className="font-bold">{area}</h2>
            {mine.map((setting) => (
              <SettingCard key={setting.id} setting={setting} />
            ))}
          </section>
        );
      })}
    </div>
  );
}

function SettingCard({ setting }: { setting: ConfigSetting }) {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(setting.value);
  const [justification, setJustification] = useState("");

  const changed = value.trim() !== setting.value;
  const ready = setting.securityRelevant
    ? changed && justification.trim().length > 0
    : changed;

  function save() {
    if (setting.securityRelevant) {
      dispatch(proposeChange(setting, value.trim(), justification.trim()));
    } else {
      dispatch(changeSetting(setting, value.trim()));
    }
    setEditing(false);
    setJustification("");
  }

  return (
    <article className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {setting.id} · {setting.requirement}
          </p>
          <h3 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
            {setting.label}
          </h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {setting.description}
          </p>
        </div>
        {setting.securityRelevant && (
          <StatusBadge tone="amber">
            <span className="inline-flex items-center gap-1">
              <FiLock size={10} aria-hidden="true" />
              Needs a second approver
            </span>
          </StatusBadge>
        )}
      </header>

      <div className="px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Current value
        </p>
        <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
          {setting.value}
        </p>
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          Last changed by {setting.lastChangedBy} · {setting.lastChangedAt.replace("T", " ")}
        </p>

        {editing && (
          <div className="mt-4 space-y-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <Field label="New value">
              <TextInput value={value} onChange={(e) => setValue(e.target.value)} />
            </Field>
            {setting.securityRelevant && (
              <Field
                label="Justification"
                hint="Required. The second approver reads this before anything else."
              >
                <TextArea
                  rows={2}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                />
              </Field>
            )}
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {setting.securityRelevant
            ? `Submitted as a proposal by ${OPERATOR.name}, for somebody else to approve.`
            : "Applied on save, with both values written to the audit log."}
        </p>
        {editing ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setValue(setting.value);
                setJustification("");
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 dark:border-neutral-700 dark:text-neutral-300"
            >
              <FiX size={14} aria-hidden="true" />
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!ready}
              className="inline-flex items-center gap-2 rounded-lg bg-state-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-state-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiCheck size={14} aria-hidden="true" />
              {setting.securityRelevant ? "Submit for approval" : "Save"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
          >
            <FiEdit3 size={14} aria-hidden="true" />
            Change
          </button>
        )}
      </footer>
    </article>
  );
}
