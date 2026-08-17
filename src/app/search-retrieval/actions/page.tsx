import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import KindBrowser from "../components/kindBrowser";

export const metadata: Metadata = { title: "Actions" };

/** FR-SCH-01 — closed and historical action records. */
export default function ActionsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SCH-01"
        title="Actions"
        description="Closed and historical action records, searchable on the instruction and on the evidence that closed them. Open actions live in the decision tracker, where somebody can still act on them."
      />
      <KindBrowser
        kind="Action"
        emptyTitle="No action matches"
        emptyDescription="No closed action you are entitled to see matches that combination."
      />
    </MainLayout>
  );
}
