import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import SavedBoard from "./components/savedBoard";

export const metadata: Metadata = { title: "Saved searches" };

/** FR-SCH-07 — saved searches and filtered views, per user role. */
export default function SavedSearchesPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SCH-07"
        title="Saved searches"
        description="Queries kept against your account, with the filters they were saved with. Each stores the question rather than the answer, so running one goes back through the entitlement filter exactly as a fresh search would."
      />
      <SavedBoard />
    </MainLayout>
  );
}
