import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import RecallBoard from "./components/recallBoard";

export const metadata: Metadata = { title: "Recalled packs" };

/** FR-PCK-18 — recall record, with reason, and access revoked. */
export default function RecalledPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PCK-18"
        title="Recalled"
        description="Packs withdrawn after release. Access was revoked at the moment of recall; the record of what was withdrawn, when, and why stays permanently against the sitting."
      />
      <RecallBoard />
    </MainLayout>
  );
}
