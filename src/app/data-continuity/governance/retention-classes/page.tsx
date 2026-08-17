import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ClassBoard from "./components/classBoard";

export const metadata: Metadata = { title: "Retention classes" };

/** FR-DAT-01 — class definitions and the rules attached to each. */
export default function RetentionClassesPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DAT-01"
        title="Retention classes"
        description="Every document carries one of these, and the rules travel with it. The period matters, but so does what happens at the end of it — twenty-five years then transferred and twenty-five years then destroyed are different promises."
      />
      <ClassBoard />
    </MainLayout>
  );
}
