import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import RetentionBoard from "./components/retentionBoard";

export const metadata: Metadata = { title: "Retention" };

/** FR-AUD-13 — the Government-defined period, and surviving the subject. */
export default function RetentionPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-AUD-13"
        title="Retention"
        description="How long each class of audit record is held, on whose authority. Destroying a document does not destroy the events describing it — those records are what remains to show who did what to something nobody can produce any more."
      />
      <RetentionBoard />
    </MainLayout>
  );
}
