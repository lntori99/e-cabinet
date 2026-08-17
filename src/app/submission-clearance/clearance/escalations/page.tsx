import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import EscalationBoard from "./components/escalationBoard";

export const metadata: Metadata = { title: "Escalations" };

/** FR-SUB-14 — clearance actions past their configured service time. */
export default function EscalationsPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SUB-14"
        title="Escalations"
        description="Stages that have run past the service time configured for them. Each is raised to its nominated escalation point — the queue does not simply age quietly."
      />
      <EscalationBoard now={now} />
    </MainLayout>
  );
}
