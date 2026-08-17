import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AssemblyBoard from "./components/assemblyBoard";

export const metadata: Metadata = { title: "In assembly" };

/** FR-PCK-01 / 02 / 03 — ordering, generated front matter, inherited labels. */
export default function InAssemblyPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PCK-01 · FR-PCK-02 · FR-PCK-03"
        title="In assembly"
        description="Cleared papers gathered into a pack in agenda sequence, with the cover page, contents and agenda generated from the sitting rather than typed."
      />
      <AssemblyBoard now={now} />
    </MainLayout>
  );
}
