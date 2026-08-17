import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import HealthBoard from "./components/healthBoard";

export const metadata: Metadata = { title: "Platform health" };

/** FR-ADM-06 — services, storage, queues, backup, integrations. */
export default function PlatformHealthPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-ADM-06"
        title="Platform health"
        description="Service status, storage capacity, queue depth, backup status and integration status — the five the requirement names, grouped as it names them, because an operator scanning this screen is looking for one kind of thing at a time."
      />
      <HealthBoard />
    </MainLayout>
  );
}
