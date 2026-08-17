import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ResidencyBoard from "./components/residencyBoard";

export const metadata: Metadata = { title: "Data residency" };

/** FR-DAT-06 — everything within Malawi-controlled infrastructure. */
export default function DataResidencyPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DAT-06"
        title="Data residency"
        description="Every store, and where it physically sits. There is no control on this page because the requirement is that nothing is anywhere else — the value is in naming each store rather than in asserting the policy once."
      />
      <ResidencyBoard />
    </MainLayout>
  );
}
