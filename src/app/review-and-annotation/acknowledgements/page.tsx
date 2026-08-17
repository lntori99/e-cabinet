import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AcknowledgementBoard from "./components/acknowledgementBoard";

export const metadata: Metadata = { title: "Acknowledgements" };

/** FR-REV-07 — what this reader has acknowledged, and what is outstanding. */
export default function AcknowledgementsPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-REV-07"
        title="Acknowledgements"
        description="Your record of having read each paper, with the time it was made. The Secretariat sees the same record — an outstanding acknowledgement is visible to them as well as to you."
      />
      <AcknowledgementBoard now={now} />
    </MainLayout>
  );
}
