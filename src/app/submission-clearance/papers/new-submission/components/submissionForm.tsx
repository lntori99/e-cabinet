"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiPaperclip,
  FiUploadCloud,
} from "react-icons/fi";
import {
  CheckboxRow,
  Field,
  Select,
  TextArea,
  TextInput,
  btnGhost,
  btnPrimary,
  controlCls,
} from "@/common/field";
import { stamp } from "@/common/time";
import { CLASSIFICATIONS } from "@/core/app-constants";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectMeetings } from "@/core/slices/meetings-slice";
import { submitPaper } from "@/core/thunks-submissions";
import {
  CLEARANCE_PATHS,
  FINANCIAL_THRESHOLD_MWK,
  PAPER_TEMPLATES,
  clearancePath,
  paperTemplate,
} from "@/data/submissionClearance";
import type { Classification } from "@/core/app-constants";
import type { ClearanceStage, Submission } from "@/models/response/base-response";
import { SUBMITTER, money } from "../../../components/subStatus";

/** FR-SUB-04 — what the perimeter will and will not take. */
const ALLOWED_TYPES = ["pdf", "docx", "xlsx", "pptx"];
const MAX_FILE_MB = 25;

/**
 * FR-SUB-08 — the path is chosen from the paper's own attributes, so the
 * submitter can see which stages their answers have just committed them to
 * before they submit.
 */
function pathFor(templateId: string, amount: number) {
  if (templateId === "TPL-BILL") return clearancePath("PATH-LEGISLATION");
  if (templateId === "TPL-INFO") return clearancePath("PATH-INFO");
  if (templateId === "TPL-EMERGENCY") return clearancePath("PATH-EMERGENCY");
  return clearancePath("PATH-STANDARD");
}

export default function SubmissionForm({ now }: { now: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const meetings = useAppSelector(selectMeetings);

  const open = meetings.filter(
    (m) => m.status !== "Concluded" && m.status !== "Cancelled",
  );

  const [meetingId, setMeetingId] = useState(open[0]?.id ?? "");
  const [agendaItemTitle, setAgendaItemTitle] = useState("");
  const [templateId, setTemplateId] = useState(PAPER_TEMPLATES[0].id);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [officer, setOfficer] = useState<string>(SUBMITTER.name);
  const [classification, setClassification] = useState<Classification>("SECRET");
  const [decisionSought, setDecisionSought] = useState("");
  const [financialNote, setFinancialNote] = useState("");
  const [financialAmount, setFinancialAmount] = useState("0");
  const [legal, setLegal] = useState("");
  const [fileName, setFileName] = useState("");
  const [sections, setSections] = useState<string[]>([]);

  const template = paperTemplate(templateId);
  const meeting = meetings.find((m) => m.id === meetingId);
  const amount = Number(financialAmount.replace(/[^0-9]/g, "")) || 0;
  const path = useMemo(() => pathFor(templateId, amount), [templateId, amount]);

  const late = meeting ? now > meeting.submissionDeadline : false;

  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const fileIssue =
    fileName && !ALLOWED_TYPES.includes(extension)
      ? `.${extension} is not an accepted file type — use ${ALLOWED_TYPES.join(", ")}`
      : "";

  /** FR-SUB-02 / 03 — everything that would refuse this submission. */
  const issues: string[] = [
    ...(title.trim() ? [] : ["A title is required"]),
    ...(subject.trim() ? [] : ["Subject is required"]),
    ...(agendaItemTitle.trim() ? [] : ["An agenda item must be nominated"]),
    ...(decisionSought.trim() ? [] : ["Decision sought is required"]),
    ...(financialNote.trim() ? [] : ["Financial implication is required"]),
    ...(legal.trim() ? [] : ["Legal implication is required"]),
    ...(fileName.trim() ? [] : ["A paper file must be attached"]),
    ...(fileIssue ? [fileIssue] : []),
    ...template.requiredSections
      .filter((section) => !sections.includes(section))
      .map((section) => `Template section not confirmed: ${section}`),
  ];

  const conforms = issues.length === 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!conforms || !meeting) return;

    const stages: ClearanceStage[] = path.stages.map((stage) => ({
      stage: stage.stage,
      mode: stage.mode,
      mandatory: stage.mandatory,
      actorRole: stage.actorRole,
      serviceHours: stage.serviceHours,
      condition: stage.condition,
      status:
        stage.mode === "Conditional" && amount < FINANCIAL_THRESHOLD_MWK
          ? "Not applicable"
          : "Not started",
    }));

    const submission: Submission = {
      id: `SUB-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      title: title.trim(),
      templateId,
      templateIssues: [],
      metadata: {
        originatingMinistry: SUBMITTER.ministry,
        responsibleOfficer: officer.trim(),
        subject: subject.trim(),
        meetingId,
        agendaItemTitle: agendaItemTitle.trim(),
        classification,
        decisionSought: decisionSought.trim(),
        financialImplication: financialNote.trim(),
        financialAmountMwk: amount,
        legalImplication: legal.trim(),
      },
      status: late ? "Awaiting late authorisation" : "In clearance",
      createdAt: now,
      submittedBy: SUBMITTER.name,
      deadline: meeting.submissionDeadline,
      late,
      stages,
      comments: [],
      versions: [
        { version: 1, uploadedBy: SUBMITTER.name, uploadedAt: now, note: "Initial submission" },
      ],
      files: [
        {
          id: `F-${Date.now()}`,
          kind: "Paper",
          fileName: fileName.trim(),
          sizeMb: 1.8,
          scan: "Clean",
        },
      ],
    };

    dispatch(submitPaper(submission));
    router.push("/submission-clearance/papers/my-submissions");
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
            Where it is going
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-SUB-01 — a paper is always submitted against a sitting and an item
            on its agenda.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Meeting">
              <select
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                className={controlCls}
              >
                {open.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.title} ({m.date})
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Agenda item"
              hint={
                meeting && meeting.agenda.length > 0
                  ? "Choose an existing item, or type a new one for the Secretariat to sequence."
                  : "This sitting has no agenda yet — name the item you are asking for."
              }
            >
              <input
                list="agenda-items"
                value={agendaItemTitle}
                onChange={(e) => setAgendaItemTitle(e.target.value)}
                className={controlCls}
                placeholder="Agenda item this paper answers"
              />
              <datalist id="agenda-items">
                {meeting?.agenda.map((item) => (
                  <option key={item.id} value={item.title} />
                ))}
              </datalist>
            </Field>
          </div>

          {meeting && (
            <p
              className="mt-3 flex items-start gap-2 text-xs"
              style={{ color: late ? "var(--viz-warning)" : undefined }}
            >
              {late ? (
                <FiAlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
              ) : (
                <FiCheckCircle
                  size={13}
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--viz-good)" }}
                  aria-hidden="true"
                />
              )}
              <span className="text-neutral-600 dark:text-neutral-300">
                Submission deadline {stamp(meeting.submissionDeadline)}.{" "}
                {late
                  ? "This paper will be flagged late and cannot enter clearance until the Secretariat authorises it."
                  : "You are inside the window."}
              </span>
            </p>
          )}
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
            Mandatory metadata
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-SUB-03 — none of these is optional.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Paper title" className="sm:col-span-2">
              <TextInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="As it should appear on the agenda"
              />
            </Field>

            <Field label="Originating ministry">
              <TextInput value={SUBMITTER.ministry} readOnly className="opacity-70" />
            </Field>

            <Field label="Responsible officer">
              <TextInput value={officer} onChange={(e) => setOfficer(e.target.value)} />
            </Field>

            <Field label="Subject" className="sm:col-span-2">
              <TextArea
                rows={2}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What the paper is about, in one or two sentences"
              />
            </Field>

            <Field label="Classification">
              <Select
                options={CLASSIFICATIONS}
                value={classification}
                onChange={(e) => setClassification(e.target.value as Classification)}
              />
            </Field>

            <Field label="Decision sought">
              <TextInput
                value={decisionSought}
                onChange={(e) => setDecisionSought(e.target.value)}
                placeholder="What Cabinet is being asked to decide"
              />
            </Field>

            <Field
              label="Financial implication (MWK)"
              hint={`Above ${money(FINANCIAL_THRESHOLD_MWK)} adds financial clearance to the path.`}
            >
              <TextInput
                inputMode="numeric"
                value={financialAmount}
                onChange={(e) => setFinancialAmount(e.target.value)}
              />
            </Field>

            <Field label="Financial implication — note">
              <TextInput
                value={financialNote}
                onChange={(e) => setFinancialNote(e.target.value)}
                placeholder="e.g. MWK 812,400,000 over three financial years"
              />
            </Field>

            <Field label="Legal implication" className="sm:col-span-2">
              <TextArea
                rows={2}
                value={legal}
                onChange={(e) => setLegal(e.target.value)}
                placeholder="Statutes engaged, amendments needed, or 'None'"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
            Template and files
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            FR-SUB-02 and FR-SUB-04 — the structure is enforced, and uploads are
            scanned before anything enters clearance.
          </p>

          <div className="mt-4 space-y-4">
            <Field label="Template" hint={`${template.appliesTo} · maximum ${template.maxPages} pages`}>
              <select
                value={templateId}
                onChange={(e) => {
                  setTemplateId(e.target.value);
                  setSections([]);
                }}
                className={controlCls}
              >
                {PAPER_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (v{t.version})
                  </option>
                ))}
              </select>
            </Field>

            <div>
              <p className="mb-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Required sections
              </p>
              <div className="space-y-2">
                {template.requiredSections.map((section) => (
                  <CheckboxRow
                    key={section}
                    label={section}
                    checked={sections.includes(section)}
                    onChange={(checked) =>
                      setSections((prev) =>
                        checked
                          ? [...prev, section]
                          : prev.filter((s) => s !== section),
                      )
                    }
                  />
                ))}
              </div>
            </div>

            <Field
              label="Paper file"
              hint={`Accepted: ${ALLOWED_TYPES.join(", ")} · up to ${MAX_FILE_MB} MB. Macro-enabled documents are refused.`}
            >
              <div className="relative">
                <FiPaperclip
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
                  size={15}
                  aria-hidden="true"
                />
                <input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className={`${controlCls} pl-9`}
                  placeholder="paper-title.pdf"
                />
              </div>
            </Field>

            {fileIssue && (
              <p
                className="flex items-center gap-2 text-xs"
                style={{ color: "var(--viz-critical)" }}
              >
                <FiAlertTriangle size={13} aria-hidden="true" />
                {fileIssue}
              </p>
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
            Clearance path
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {path.name} — {path.appliesWhen}
          </p>

          <ol className="mt-3 space-y-2">
            {path.stages.map((stage, index) => {
              const applies =
                stage.mode !== "Conditional" || amount >= FINANCIAL_THRESHOLD_MWK;
              return (
                <li key={stage.stage} className="flex items-start gap-2.5 text-sm">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold ${
                      applies
                        ? "bg-state-600/10 text-state-700 dark:bg-state-900/40 dark:text-state-400"
                        : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={
                        applies
                          ? "text-neutral-900 dark:text-neutral-100"
                          : "text-neutral-400 line-through dark:text-neutral-600"
                      }
                    >
                      {stage.stage}
                    </span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                      {stage.mode} · {stage.serviceHours}h · {stage.actorRole}
                      {!applies && stage.condition ? ` — ${stage.condition}` : ""}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">
            Conformance
          </h2>

          {conforms ? (
            <p
              className="mt-3 flex items-start gap-2 text-sm"
              style={{ color: "var(--viz-good)" }}
            >
              <FiCheckCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span className="text-neutral-700 dark:text-neutral-300">
                The submission conforms and can be put forward.
              </span>
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {issues.map((issue) => (
                <li key={issue} className="flex items-start gap-2 text-sm">
                  <FiAlertTriangle
                    size={13}
                    className="mt-1 shrink-0"
                    style={{ color: "var(--viz-critical)" }}
                    aria-hidden="true"
                  />
                  <span className="text-neutral-600 dark:text-neutral-300">{issue}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" disabled={!conforms} className={btnPrimary}>
              <FiUploadCloud size={15} aria-hidden="true" />
              Submit paper
            </button>
            <button
              type="button"
              onClick={() => router.push("/submission-clearance/papers/drafts")}
              className={btnGhost}
            >
              Save as draft
            </button>
          </div>
        </section>
      </aside>
    </form>
  );
}
