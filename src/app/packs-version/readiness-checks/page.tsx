import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ReadinessBoard from "./components/readinessBoard";

export const metadata: Metadata = { title: "Readiness checks" };

/** FR-PCK-16 / 17 — the pre-release check, and the overrides that pass it. */
export default function ReadinessChecksPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PCK-16 · FR-PCK-17"
        title="Readiness checks"
        description="What stands between a pack and release: missing papers, incomplete clearances, unresolved comments and participants who cannot open it. A pack that fails cannot be released without a recorded override."
      />
      <ReadinessBoard />
    </MainLayout>
  );
}
