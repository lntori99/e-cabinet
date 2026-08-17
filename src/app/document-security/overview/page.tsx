import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import SecurityDashboard from "./components/securityDashboard";

export const metadata: Metadata = { title: "Security overview" };

/** Documents by classification, exceptions, revocations, endpoint verification. */
export default function SecurityOverviewPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR DOC"
        title="Security overview"
        description="What the platform is holding and under what label, which controls are currently being excepted, what access has been withdrawn, and whether the room endpoints came back clean."
      />
      <SecurityDashboard now={now} />
    </MainLayout>
  );
}
