"use client";

import { useState } from "react";
import Link from "next/link";
import { FiCheck, FiLock, FiSave } from "react-icons/fi";
import { CheckboxRow, Field, TextInput, btnPrimary } from "@/common/field";
import { DetailRow } from "@/common/table";
import { OPERATOR } from "@/core/app-constants";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { contactChanged, selectPreferences } from "@/core/slices/preferences-slice";
import { rolePermissions } from "@/data/identityAccess";
import SettingsCard from "./settingsCard";

/** "Larry" → "LA" */
function initials(name: string) {
  const parts = name.split(/[\s.]+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ProfilePanel() {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(selectPreferences);

  const [preferredName, setPreferredName] = useState(preferences.preferredName);
  const [contactNumber, setContactNumber] = useState(preferences.contactNumber);
  const [outOfOffice, setOutOfOffice] = useState(preferences.outOfOffice);
  const [saved, setSaved] = useState(false);

  const permissions = rolePermissions("Secretariat Administrator");

  const dirty =
    preferredName !== preferences.preferredName ||
    contactNumber !== preferences.contactNumber ||
    outOfOffice !== preferences.outOfOffice;

  function save() {
    dispatch(
      contactChanged({
        preferredName: preferredName.trim(),
        contactNumber: contactNumber.trim(),
        outOfOffice,
        at: new Date().toISOString().slice(0, 16),
      }),
    );
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Your account"
        description="Held in the Government directory. The platform reads these fields and does not write them — a change of name, role or ministry is made in the directory and arrives here at the next sign-in."
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-state-600">
            <span className="text-xl font-bold text-white">
              {initials(OPERATOR.name)}
            </span>
          </span>
          <div className="min-w-0">
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {OPERATOR.name}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {OPERATOR.role}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-0.5">
          <DetailRow label="Email" value={OPERATOR.email} />
          <DetailRow label="Office" value="Office of the President & Cabinet" />
          <DetailRow label="Role group" value={OPERATOR.role} />
          <DetailRow
            label="Classification ceiling"
            value={permissions.classificationCeiling}
          />
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <FiLock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            Directory-owned. To change any of these, raise the request in{" "}
            <Link
              href="/identity-access/users"
              className="font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Identity and Access
            </Link>
            .
          </span>
        </p>
      </SettingsCard>

      <SettingsCard
        title="Your details"
        description="What the platform holds about you, as distinct from what the directory holds. These are yours to change."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Preferred name"
            hint="Shown beside your work in the console — comments, decisions and the audit log still carry your directory name."
          >
            <TextInput
              value={preferredName}
              onChange={(e) => {
                setPreferredName(e.target.value);
                setSaved(false);
              }}
            />
          </Field>

          <Field label="Contact number" hint="Used for out-of-hours contact only.">
            <TextInput
              value={contactNumber}
              onChange={(e) => {
                setContactNumber(e.target.value);
                setSaved(false);
              }}
            />
          </Field>
        </div>

        <div className="mt-4">
          <CheckboxRow
            label={
              <>
                <span className="block">Away from the office</span>
                <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                  Items routed to you are also shown to your escalation point. It
                  does not delegate your clearance role — that is a formal
                  delegation, recorded and audited.
                </span>
              </>
            }
            checked={outOfOffice}
            onChange={(checked) => {
              setOutOfOffice(checked);
              setSaved(false);
            }}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={!dirty}
            className={btnPrimary}
          >
            <FiSave size={15} aria-hidden="true" />
            Save changes
          </button>
          {saved && !dirty && (
            <span
              className="inline-flex items-center gap-1.5 text-sm"
              style={{ color: "var(--viz-good)" }}
            >
              <FiCheck size={15} aria-hidden="true" />
              Saved
            </span>
          )}
        </div>
      </SettingsCard>
    </div>
  );
}
