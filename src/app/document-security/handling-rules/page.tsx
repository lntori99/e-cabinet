import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import HandlingBoard from "./components/handlingBoard";

export const metadata: Metadata = { title: "Handling rules" };

/** FR-DOC-02 / 10 / 11 — what each classification actually permits. */
export default function HandlingRulesPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DOC-02 · FR-DOC-10 · FR-DOC-11"
        title="Handling rules"
        description="Classification is the operative input to access, download, print, offline, retention and recording. This is the table those decisions are read from — not a description of them."
      />
      <HandlingBoard />
    </MainLayout>
  );
}
