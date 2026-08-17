import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import EscalationBoard from "./components/escalationBoard";

export const metadata: Metadata = { title: "Escalation points" };

/** FR-NOT-04, FR-NOT-05 — nominated recipients per stage and per action type. */
export default function EscalationPointsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-NOT-04 · FR-NOT-05"
        title="Escalation points"
        description="Where an item goes when nobody has moved it. Clearance escalates when a service window runs out; an action escalates on its own deadline, to an officer chosen by what kind of action it is."
      />
      <EscalationBoard />
    </MainLayout>
  );
}
