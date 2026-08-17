import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import PathCatalogue from "./components/pathCatalogue";

export const metadata: Metadata = { title: "Clearance paths" };

/** FR-SUB-07 / 08 — stage configuration. Administrators only. */
export default function ClearancePathsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SUB-07 · FR-SUB-08 · Administration"
        title="Clearance paths"
        description="How papers are routed. A stage may be sequential, run in parallel with its neighbours, or apply only on a condition — classification, financial threshold or meeting type."
      />
      <PathCatalogue />
    </MainLayout>
  );
}
