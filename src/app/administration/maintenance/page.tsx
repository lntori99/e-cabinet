import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import MaintenanceBoard from "./components/maintenanceBoard";

export const metadata: Metadata = { title: "Maintenance windows" };

/** FR-ADM-10 — scheduled, notified, gracefully suspended. */
export default function MaintenancePage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-ADM-10"
        title="Maintenance windows"
        description="When the platform will be interrupted, what stops, who has been told and whether sessions are drained rather than dropped. A window that collides with a sitting is flagged before it is approved, not discovered on the morning."
      />
      <MaintenanceBoard />
    </MainLayout>
  );
}
