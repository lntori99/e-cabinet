import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import KindBrowser from "../components/kindBrowser";

export const metadata: Metadata = { title: "Decisions" };

/** FR-SCH-01 — the finalised decision record, as an archive. */
export default function DecisionsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SCH-01"
        title="Decisions"
        description="The finalised decision record, searchable across sittings. Decisions still in the draft cycle are not here — the archive holds what Cabinet settled, not what the Secretariat is still writing up."
      />
      <KindBrowser
        kind="Decision"
        emptyTitle="No decision matches"
        emptyDescription="No finalised decision you are entitled to see matches that combination."
      />
    </MainLayout>
  );
}
