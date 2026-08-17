import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import MinistryBoard from "../../components/ministryBoard";
import { REMINDER_THRESHOLD_DAYS } from "@/data/decisions";

export const metadata: Metadata = { title: "Due soon" };

/** FR-DEC-08 — inside the reminder window, before anything is late. */
export default function DueSoonPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-08"
        title="Due soon"
        description={`Actions falling due within ${REMINDER_THRESHOLD_DAYS} days. This is the window in which the reminder goes out, and the last point at which something can be finished without being late.`}
      />
      <MinistryBoard
        scope="due-soon"
        today={today}
      />
    </MainLayout>
  );
}
