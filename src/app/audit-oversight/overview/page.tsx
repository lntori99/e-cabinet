import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AuditDashboard from "./components/auditDashboard";

export const metadata: Metadata = { title: "Audit overview" };

/** FR AUD — open alerts, events today, integrity status, replication lag. */
export default function AuditOverviewPage() {
  // Server-computed so "today" is the platform's day, not the viewer's.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR AUD"
        title="Audit overview"
        description="What the log has recorded, whether it still verifies, how far behind the store outside administrative reach is running, and what the detectors have flagged. Nothing on this console can alter a record."
      />
      <AuditDashboard today={today} />
    </MainLayout>
  );
}
