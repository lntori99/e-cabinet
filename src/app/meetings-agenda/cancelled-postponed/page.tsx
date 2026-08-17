import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import DisruptionBoard from "./components/disruptionBoard";

export const metadata: Metadata = { title: "Cancelled and postponed" };

/** FR-MTG-12 — cancellation and postponement, with pack handling status. */
export default function CancelledPostponedPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-MTG-12"
        title="Cancelled and postponed"
        description="Sittings called off or moved, each with the reason, who decided it, whether participants were notified, and what happened to packs that had already been released."
      />
      <DisruptionBoard />
    </MainLayout>
  );
}
