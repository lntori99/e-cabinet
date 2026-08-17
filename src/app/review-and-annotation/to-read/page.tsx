import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ToReadBoard from "./components/toReadBoard";

export const metadata: Metadata = { title: "To read" };

/** FR-REV-07 — released to this reader, unacknowledged, next sitting first. */
export default function ToReadPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-REV-07"
        title="To read"
        description="Papers released to you that you have not yet acknowledged, with the next sitting at the top. Acknowledging one records, with a timestamp, that you have read it."
      />
      <ToReadBoard now={now} />
    </MainLayout>
  );
}
