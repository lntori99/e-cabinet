import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import DecisionsDashboard from "./components/decisionsDashboard";

export const metadata: Metadata = { title: "Decisions overview" };

/** FR DEC — what is unrecorded, unfinalised, late, or waiting on sign-off. */
export default function DecisionsOverviewPage() {
  // Computed on the server so the deadline arithmetic does not depend on the
  // clock of whoever is looking.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR DEC"
        title="Decisions overview"
        description="Which sittings are still short of a decision record, what is waiting to be finalised, which actions have run past their deadline, and what the ministries have sent back for verification."
      />
      <DecisionsDashboard today={today} />
    </MainLayout>
  );
}
