import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import HoldBoard from "./components/holdBoard";

export const metadata: Metadata = { title: "Legal holds" };

/** FR-DAT-05 — retention-driven deletion suspended for a defined set. */
export default function LegalHoldsPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DAT-05"
        title="Legal holds"
        description="Record sets whose disposal is suspended, and the instrument each hold rests on. A hold does not change the retention class — it stops the clock from being acted upon, and lifting it starts the disposal the class always intended."
      />
      <HoldBoard today={today} />
    </MainLayout>
  );
}
