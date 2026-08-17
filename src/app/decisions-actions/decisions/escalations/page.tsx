import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import EscalationBoard from "./components/escalationBoard";

export const metadata: Metadata = { title: "Escalations" };

/** FR-DEC-08 — reminders before the deadline, escalation after it. */
export default function EscalationsPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-08"
        title="Escalations"
        description="Actions that have run past their deadline, and where each one goes next. Escalation is a named officer configured against the action, not a general alarm."
      />
      <EscalationBoard today={today} />
    </MainLayout>
  );
}
