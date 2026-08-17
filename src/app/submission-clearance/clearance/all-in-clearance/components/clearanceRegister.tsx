"use client";

import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useAppSelector } from "@/core/hook";
import { controlCls } from "@/common/field";
import { selectSubmissions } from "@/core/slices/submissions-slice";
import { MINISTRIES } from "@/data/meetingTypes";
import { CLEARANCE_STAGES } from "@/data/submissionClearance";
import PaperDetail from "../../../components/paperDetail";
import PaperList from "../../../components/paperList";
import { currentStage } from "../../../components/subStatus";

export default function ClearanceRegister({ now }: { now: string }) {
  const submissions = useAppSelector(selectSubmissions);

  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("All");
  const [ministry, setMinistry] = useState("All");
  const [selectedId, setSelectedId] = useState("");

  const ministries = MINISTRIES.filter((name) =>
    submissions.some((s) => s.metadata.originatingMinistry === name),
  );

  const needle = query.trim().toLowerCase();
  const visible = submissions
    .filter((s) => s.status !== "Draft")
    .filter((s) => {
      if (stage === "All") return true;
      return currentStage(s)?.stage === stage;
    })
    .filter((s) => ministry === "All" || s.metadata.originatingMinistry === ministry)
    .filter(
      (s) =>
        !needle ||
        [s.id, s.title, s.metadata.subject, s.metadata.originatingMinistry].some(
          (field) => field.toLowerCase().includes(needle),
        ),
    );

  const selected = visible.find((s) => s.id === selectedId) ?? visible[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <FiSearch
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
            size={15}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search papers in clearance"
            placeholder="Search by title, reference or ministry"
            className={`${controlCls} pl-9`}
          />
        </div>

        <select
          value={ministry}
          onChange={(e) => setMinistry(e.target.value)}
          aria-label="Filter by originating ministry"
          className={`${controlCls} sm:w-64`}
        >
          <option value="All">All ministries</option>
          {ministries.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-1.5">
          {["All", ...CLEARANCE_STAGES].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setStage(name)}
              aria-pressed={stage === name}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                stage === name
                  ? "border-state-600 bg-state-600 text-white"
                  : "border-neutral-300 text-neutral-600 hover:border-state-400 dark:border-neutral-700 dark:text-neutral-300"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            {visible.length} of {submissions.filter((s) => s.status !== "Draft").length}{" "}
            papers
          </p>
          <PaperList
            submissions={visible}
            selectedId={selected?.id ?? ""}
            onSelect={setSelectedId}
            emptyMessage="No paper is sitting at this stage."
          />
        </div>

        <div className="min-w-0">
          {selected && <PaperDetail submission={selected} now={now} />}
        </div>
      </div>
    </div>
  );
}
