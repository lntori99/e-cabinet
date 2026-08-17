import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import KindBrowser from "../components/kindBrowser";

export const metadata: Metadata = { title: "Papers" };

/** FR-SCH-01 — historical papers, by the filter set the requirement names. */
export default function PapersPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SCH-01 · FR-SCH-03"
        title="Papers"
        description="Every paper the archive holds, back through the sittings that predate this console. Scanned annexes are searchable on the text optical character recognition recovered, and the confidence travels with the result."
      />
      <KindBrowser
        kind="Paper"
        emptyTitle="No paper matches"
        emptyDescription="No paper you are entitled to see matches that combination. Try fewer terms, or widen the date range."
      />
    </MainLayout>
  );
}
