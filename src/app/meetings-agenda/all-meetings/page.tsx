import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import MeetingsWorkspace from "./components/meetingsWorkspace";

export const metadata: Metadata = { title: "All meetings" };

/** FR-MTG-01 — the register of Cabinet, committee and other high-level meetings. */
export default function AllMeetingsPage() {
  // Resolved on the server so "submissions closed" does not turn on the
  // viewer's clock, the same way the calendar resolves its opening month.
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-MTG-01"
        title="All meetings"
        description="Every Cabinet, committee and other high-level sitting on the register. Create a meeting, build and sequence its agenda, manage participants and attendance, and control its submission window."
      />
      <MeetingsWorkspace now={now} />
    </MainLayout>
  );
}
