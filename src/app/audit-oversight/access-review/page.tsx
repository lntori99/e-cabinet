import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AccessReview from "./components/accessReview";

export const metadata: Metadata = { title: "Access review" };

/** FR-AUD-12 — quarterly, per role and per user. */
export default function AccessReviewPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-AUD-12"
        title="Access review"
        description="What each account is entitled to do, and what it actually did in the quarter. An entitlement with no activity behind it is the finding the exercise exists to produce — a credential nobody would miss."
      />
      <AccessReview />
    </MainLayout>
  );
}
