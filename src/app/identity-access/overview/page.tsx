import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AccessDashboard from "./components/accessDashboard";

export const metadata: Metadata = { title: "Access overview" };

/** The FR IAM dashboard — approvals waiting, access open, refusals moving. */
export default function AccessOverviewPage() {
  // Resolved on the server so the one-hour deactivation clock does not turn on
  // the viewer's own clock.
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR IAM"
        title="Access overview"
        description="Approvals waiting on an administrator, administrator access currently open, and how the estate is authenticating."
      />
      <AccessDashboard now={now} />
    </MainLayout>
  );
}
