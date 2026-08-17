import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import DraftBoard from "./components/draftBoard";

export const metadata: Metadata = { title: "Drafts and review" };

/** FR-DEC-04 — the pre-finalisation cycle. */
export default function DraftsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-04"
        title="Drafts and review"
        description="Decisions written up but not yet on the record. A draft is checked against the sitting by a second officer before it is finalised, and finalisation is the point after which it cannot be edited."
      />
      <DraftBoard />
    </MainLayout>
  );
}
