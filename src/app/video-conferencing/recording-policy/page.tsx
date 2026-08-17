import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import RecordingPolicyBoard from "./components/recordingPolicyBoard";

export const metadata: Metadata = { title: "Recording policy" };

/** FR-VID-11 / 12 — off by default, and visible to everyone when it is on. */
export default function RecordingPolicyPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-VID-11 · FR-VID-12"
        title="Recording policy"
        description="Recording is disabled by default and enabled only where Government has approved the storage location, the retention period, the authorisation path and who may reach the result. Where it runs, every participant is told."
      />
      <RecordingPolicyBoard />
    </MainLayout>
  );
}
