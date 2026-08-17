import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import SubmissionForm from "./components/submissionForm";

export const metadata: Metadata = { title: "New submission" };

/** FR-SUB-01 / 02 / 03 — meeting and agenda item, template, mandatory metadata. */
export default function NewSubmissionPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SUB-01 · FR-SUB-02 · FR-SUB-03"
        title="New submission"
        description="A paper is put forward against a specific sitting and agenda item, on a Government-defined template, with every mandatory field completed. A submission that does not conform is refused rather than filed."
      />
      <SubmissionForm now={now} />
    </MainLayout>
  );
}
