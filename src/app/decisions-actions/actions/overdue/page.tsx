import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import MinistryBoard from "../../components/ministryBoard";

export const metadata: Metadata = { title: "Overdue" };

/** FR-DEC-08 — past the deadline, with the escalation point named. */
export default function OverduePage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-08"
        title="Overdue"
        description="Actions that have run past their date. The escalation point is shown against each one, so the officer responsible knows where it goes next rather than finding out when it gets there."
      />
      <MinistryBoard
        scope="overdue"
        today={today}
      />
    </MainLayout>
  );
}
