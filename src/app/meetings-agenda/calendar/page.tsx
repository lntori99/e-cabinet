import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import MeetingCalendar from "./components/meetingCalendar";

export const metadata: Metadata = { title: "Meeting calendar" };

/** FR-MTG-03 — date, time, expected duration and venue, in calendar form. */
export default function MeetingCalendarPage() {
  // Resolved on the server so the grid does not depend on the viewer's clock
  // for which month it opens on.
  const today = new Date().toLocaleDateString("en-CA");

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-MTG-03"
        title="Meeting calendar"
        description="Every sitting in date order, including recurring series and any that have been postponed or cancelled."
      />
      <MeetingCalendar today={today} />
    </MainLayout>
  );
}
