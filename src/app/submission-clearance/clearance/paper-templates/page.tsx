import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import TemplateCatalogue from "./components/templateCatalogue";

export const metadata: Metadata = { title: "Paper templates" };

/** FR-SUB-02 — Government-defined templates. Administrators only. */
export default function PaperTemplatesPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SUB-02 · Administration"
        title="Paper templates"
        description="The structures a submission must conform to. A paper missing a required section, or over its page limit, is refused at submission rather than filed and corrected later."
      />
      <TemplateCatalogue />
    </MainLayout>
  );
}
