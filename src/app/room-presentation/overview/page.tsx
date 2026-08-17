import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import RoomDashboard from "./components/roomDashboard";

export const metadata: Metadata = { title: "Room overview" };

/** Endpoints online, sessions in progress, devices out of policy, open errors. */
export default function RoomOverviewPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR PRS · Administration"
        title="Room overview"
        description="The estate the sittings run on: which endpoints are up, what is presenting now, which devices have drifted out of policy, and what has gone wrong that nobody has picked up."
      />
      <RoomDashboard now={now} />
    </MainLayout>
  );
}
