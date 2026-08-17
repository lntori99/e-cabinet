import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import PackReadingRoom from "./components/packReadingRoom";

export const metadata: Metadata = { title: "Current pack" };

/** FR-REV-01 / 02 — the reading view, and navigation within the pack. */
export default function CurrentPackPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-REV-01 · FR-REV-02"
        title="Current pack"
        description="The pack for your next sitting. Move through it by agenda item, by paper or by page, or search across every paper in it at once."
      />
      <PackReadingRoom now={now} />
    </MainLayout>
  );
}
