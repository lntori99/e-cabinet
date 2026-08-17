import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import TransferBoard from "./components/transferBoard";

export const metadata: Metadata = { title: "Import and export" };

/** FR-DOC-20 — Release 2. A defined procedure, and both directions logged. */
export default function ImportExportPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DOC-20 · Release 2"
        title="Import and export"
        description="Material crossing the platform boundary in either direction, through an approved procedure. Every transfer is logged — an import is as much a security event as an export."
      />
      <TransferBoard />
    </MainLayout>
  );
}
