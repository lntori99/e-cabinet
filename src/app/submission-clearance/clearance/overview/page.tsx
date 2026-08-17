import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ClearanceDashboard from "./components/clearanceDashboard";

export const metadata: Metadata = { title: "Clearance overview" };

/** Queue depth by stage, service-time breaches, papers blocked from the pack. */
export default function ClearanceOverviewPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR SUB"
        title="Clearance overview"
        description="Where the clearance chain stands: what is queued at each stage, what has run past its service time, and what is holding up pack assembly."
      />
      <ClearanceDashboard now={now} />
    </MainLayout>
  );
}
