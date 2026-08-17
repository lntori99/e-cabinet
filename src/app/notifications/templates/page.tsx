import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import TemplateBoard from "./components/templateBoard";

export const metadata: Metadata = { title: "Templates" };

/** FR-NOT-06, FR-NOT-07 — the no-content and no-attachment rules, at source. */
export default function TemplatesPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-NOT-06 · FR-NOT-07"
        title="Templates"
        description="The message bodies the platform sends. Every one is written so that an intercepted message would say nothing: no paper title, no classification marking, no decision text — and the record has no field for an attachment at all."
      />
      <TemplateBoard />
    </MainLayout>
  );
}
