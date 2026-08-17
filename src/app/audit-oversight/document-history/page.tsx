import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import DocumentHistory from "./components/documentHistory";

export const metadata: Metadata = { title: "Document history" };

/** FR-AUD-10 — complete access history for one named document. */
export default function DocumentHistoryPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-AUD-10"
        title="Document history"
        description="Everything that has happened to one named record, across every version and every user. This is the report a leak enquiry starts from, so it covers people whose access has since been withdrawn as well as those who still hold it."
      />
      <DocumentHistory />
    </MainLayout>
  );
}
