import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AcknowledgementBoard from "./components/acknowledgementBoard";

export const metadata: Metadata = { title: "Acknowledgements" };

/** FR-PCK-10 — per-participant receipt and read status for each released pack. */
export default function AcknowledgementsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PCK-10"
        title="Acknowledgements"
        description="Who has received each released pack, who has opened it, and which version they are actually holding."
      />
      <AcknowledgementBoard />
    </MainLayout>
  );
}
