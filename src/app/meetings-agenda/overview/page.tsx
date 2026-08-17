import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import OverviewDashboard from "./components/overviewDashboard";

export const metadata: Metadata = { title: "Meetings & agenda" };

/** The Secretariat dashboard — what needs action before the next sitting. */
export default function MeetingsOverviewPage() {
  // Resolved on the server so the runway does not turn on the viewer's clock.
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR MTG"
        title="Meetings & agenda"
        description="Where the next sittings stand: what is on their agendas, what they are still waiting for, and what has changed across the register."
      />
      <OverviewDashboard now={now} />
    </MainLayout>
  );
}
