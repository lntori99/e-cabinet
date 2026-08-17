"use client";

import { useState } from "react";
import { FiCheck, FiSave } from "react-icons/fi";
import { Field, Select, btnPrimary } from "@/common/field";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { regionalChanged, selectPreferences } from "@/core/slices/preferences-slice";
import SettingsCard from "./settingsCard";

const TIMEZONES = [
  "Africa/Blantyre (CAT, UTC+2)",
  "Africa/Johannesburg (SAST, UTC+2)",
  "Africa/Nairobi (EAT, UTC+3)",
  "Europe/London (BST, UTC+1)",
  "UTC",
];

const DATE_FORMATS = ["2026-08-14 (ISO)", "14 August 2026", "14/08/2026", "08/14/2026"];

const LANGUAGES = ["English (Malawi)", "English (United Kingdom)", "Chichewa"];

export default function RegionalPanel() {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(selectPreferences);

  const [timezone, setTimezone] = useState(preferences.timezone);
  const [dateFormat, setDateFormat] = useState(preferences.dateFormat);
  const [language, setLanguage] = useState(preferences.language);
  const [saved, setSaved] = useState(false);

  const dirty =
    timezone !== preferences.timezone ||
    dateFormat !== preferences.dateFormat ||
    language !== preferences.language;

  return (
    <SettingsCard
      title="Language and region"
      description="How dates and times are shown to you. The record itself is stored in UTC and rendered into your zone, so two people in different places never disagree about when something happened."
    >
      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Field label="Time zone" className="sm:col-span-2">
          <Select
            options={TIMEZONES}
            value={timezone}
            onChange={(e) => {
              setTimezone(e.target.value);
              setSaved(false);
            }}
          />
        </Field>

        <Field
          label="Date format"
          hint="Registers and audit columns keep the ISO form regardless, so they sort correctly."
        >
          <Select
            options={DATE_FORMATS}
            value={dateFormat}
            onChange={(e) => {
              setDateFormat(e.target.value);
              setSaved(false);
            }}
          />
        </Field>

        <Field label="Language" hint="Cabinet papers are not translated by the platform.">
          <Select
            options={LANGUAGES}
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setSaved(false);
            }}
          />
        </Field>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!dirty}
          onClick={() => {
            dispatch(
              regionalChanged({
                timezone,
                dateFormat,
                language,
                at: new Date().toISOString().slice(0, 16),
              }),
            );
            setSaved(true);
          }}
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
  );
}
