import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ExportBoard from "./components/exportBoard";

export const metadata: Metadata = { title: "Export" };

/** FR-AUD-14 — evidential export with integrity attestation. */
export default function ExportPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-AUD-14"
        title="Export"
        description="Audit records in a form fit for evidence: a digest the recipient can check the file against, a named officer attesting that it is what the log said, and a record of the export that outlives the file itself."
      />
      <ExportBoard />
    </MainLayout>
  );
}
