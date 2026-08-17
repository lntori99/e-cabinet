import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import SupersededBoard from "./components/supersededBoard";

export const metadata: Metadata = { title: "Superseded" };

/** FR-REV-06 — annotations survive replacement, and say so. */
export default function SupersededPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-REV-06"
        title="Superseded"
        description="Papers you annotated that have since been replaced. Your notes stay against the version you read — they are not moved, rewritten or discarded — and the newer version is shown alongside them."
      />
      <SupersededBoard />
    </MainLayout>
  );
}
