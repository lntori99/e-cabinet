import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import RecordingsBoard from "./components/recordingsBoard";

export const metadata: Metadata = { title: "Recordings" };

/** FR-VID-13 — Release 2. Access-controlled and disposal-tracked. */
export default function RecordingsPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-VID-13 · Release 2"
        title="Recordings"
        description="What has been recorded, where it is held, who may reach it and when it must be destroyed. A recording that has passed its retention date is a finding, not a convenience."
      />
      <RecordingsBoard now={now} />
    </MainLayout>
  );
}
