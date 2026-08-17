import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import OnboardingBoard from "./components/onboardingBoard";

export const metadata: Metadata = { title: "Bulk onboarding" };

/** FR-ADM-12 — ministry import and role assignment during rollout. */
export default function BulkOnboardingPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-ADM-12"
        title="Bulk onboarding"
        description="Ministry imports for the rollout, with the roles each batch assigns. A batch with failed rows cannot be applied at all — a half-imported ministry is worse than an unimported one, because nobody can tell which half."
      />
      <OnboardingBoard />
    </MainLayout>
  );
}
