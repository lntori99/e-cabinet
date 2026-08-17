import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import RecordBoard from "./components/recordBoard";

export const metadata: Metadata = { title: "Session records" };

/** FR-VID-15 — attendance, joins and leaves, host actions, sharing, recording. */
export default function SessionRecordsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-VID-15"
        title="Session records"
        description="What happened in each session, in order: who joined and when they left, every host action, every screen-sharing grant, every recording action and every administrative change."
      />
      <RecordBoard />
    </MainLayout>
  );
}
