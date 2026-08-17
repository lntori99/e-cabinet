import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import CorrectionBoard from "./components/correctionBoard";

export const metadata: Metadata = { title: "Corrections" };

/** FR-DEC-05 — formal correction records against finalised decisions. */
export default function CorrectionsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-05"
        title="Corrections"
        description="Amending a finalised decision takes a formal correction record: the authorising officer, the reason, and the original text preserved. The record grows; it is never rewritten."
      />
      <CorrectionBoard />
    </MainLayout>
  );
}
