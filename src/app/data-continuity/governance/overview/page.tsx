import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import GovernanceDashboard from "./components/governanceDashboard";

export const metadata: Metadata = { title: "Governance overview" };

/** FR DAT — expiry, holds, deletions awaiting approval, last restore. */
export default function GovernanceOverviewPage() {
  // Server-computed so the expiry arithmetic does not depend on the viewer's clock.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR DAT"
        title="Governance overview"
        description="What is approaching the end of its retention, what is being held past it and why, what is waiting on a second approver before it can be destroyed, and when the platform last proved it could restore itself."
      />
      <GovernanceDashboard today={today} />
    </MainLayout>
  );
}
