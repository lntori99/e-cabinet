import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import SchemeBoard from "./components/schemeBoard";

export const metadata: Metadata = { title: "Classification scheme" };

/** FR-DOC-01 — Government-defined labels, and the no-unclassified rule. */
export default function ClassificationSchemePage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DOC-01"
        title="Classification scheme"
        description="The Government-defined labels this deployment recognises, the default applied for each meeting type, and the rule that a document cannot exist without one."
      />
      <SchemeBoard />
    </MainLayout>
  );
}
