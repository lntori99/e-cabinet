import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import StagingBoard from "./components/stagingBoard";

export const metadata: Metadata = { title: "Pre-staging" };

/** FR-PCK-15 — distribution to rooms and secure locations before a sitting. */
export default function PreStagingPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PCK-15"
        title="Pre-staging"
        description="Packs pushed to the rooms and secure locations that will need them, ahead of the sitting. A pack that has to be fetched over the network on the day is a pack that opens late."
      />
      <StagingBoard />
    </MainLayout>
  );
}
