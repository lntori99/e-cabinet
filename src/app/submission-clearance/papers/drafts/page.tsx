import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import DraftsBoard from "./components/draftsBoard";

export const metadata: Metadata = { title: "Drafts" };

/** Started but not submitted — with what still stands in the way (FR-SUB-02). */
export default function DraftsPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SUB-02"
        title="Drafts"
        description="Papers your ministry has started but not put forward. Each one is checked against its template, so you can see what would refuse it before you submit."
      />
      <DraftsBoard now={now} />
    </MainLayout>
  );
}
