import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ReclassificationBoard from "./components/reclassificationBoard";

export const metadata: Metadata = { title: "Reclassification" };

/** FR-DOC-03 / 04 — changes take effect at once, and are recorded in full. */
export default function ReclassificationPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DOC-03 · FR-DOC-04"
        title="Reclassification"
        description="A change of label takes effect on the next access decision — no re-release, no re-login. Every change carries the previous value, the new value, the officer who made it and the reason."
      />
      <ReclassificationBoard />
    </MainLayout>
  );
}
