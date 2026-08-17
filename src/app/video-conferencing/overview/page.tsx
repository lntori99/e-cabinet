import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import VideoDashboard from "./components/videoDashboard";

export const metadata: Metadata = { title: "Video overview" };

/** Sessions in progress, scheduled today, pending externals, quality alerts. */
export default function VideoOverviewPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR VID"
        title="Video overview"
        description="What is running now, who is waiting at the door, which external joins need a decision, and where quality did not hold. Conferencing is part of the platform, hosted on Malawi-controlled infrastructure."
      />
      <VideoDashboard now={now} />
    </MainLayout>
  );
}
