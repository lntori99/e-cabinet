import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import TransferBoard from "./components/transferBoard";

export const metadata: Metadata = { title: "Archival transfer" };

/** FR-DAT-03 — transfer preserving metadata, classification and audit linkage. */
export default function ArchivalTransferPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DAT-03"
        title="Archival transfer"
        description="Records moved to the National Archives at the end of their retention. Three things must arrive with each batch — the metadata, the classification and the linkage to the audit events — and a transfer missing any one of them is not accepted."
      />
      <TransferBoard />
    </MainLayout>
  );
}
