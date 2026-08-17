import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import FinalisedRegister from "./components/finalisedRegister";

export const metadata: Metadata = { title: "Finalised decisions" };

/** FR-DEC-04 — the immutable record, searchable by meeting and by ministry. */
export default function FinalisedPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-04"
        title="Finalised decisions"
        description="What Cabinet decided, as it stands on the record. Nothing here can be edited — where something must change, a correction record is written beside it and the original text is kept."
      />
      <FinalisedRegister />
    </MainLayout>
  );
}
