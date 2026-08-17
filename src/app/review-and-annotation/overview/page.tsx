import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import { READER } from "@/data/review";
import ReadingDashboard from "./components/readingDashboard";

export const metadata: Metadata = { title: "Reading room" };

/** The reader's own summary — what is waiting, and what they have raised. */
export default function ReadingRoomOverviewPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow={`FR REV · ${READER.name}`}
        title="Reading room"
        description="What has been released to you, how far through it you are, and what you have raised with the Secretariat. Everything here is yours alone."
      />
      <ReadingDashboard now={now} />
    </MainLayout>
  );
}
