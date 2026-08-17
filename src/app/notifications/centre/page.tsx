import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import CentreBoard from "./components/centreBoard";

export const metadata: Metadata = { title: "Notification centre" };

/** FR-NOT-09 — the in-platform centre, showing this user's outstanding items. */
export default function CentrePage() {
  // Server-computed so "was due" does not depend on the viewer's clock.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-NOT-09"
        title="Notification centre"
        description="Everything addressed to you that is still outstanding, with what it is waiting on. Each item is a pointer into the platform rather than a copy of anything."
      />
      <CentreBoard today={today} />
    </MainLayout>
  );
}
