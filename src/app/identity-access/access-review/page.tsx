import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AccessReviewBoard from "./components/accessReviewBoard";

export const metadata: Metadata = { title: "Access review" };

/** FR-IAM-16 — per-user entitlement reports for the quarterly review. */
export default function AccessReviewPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-IAM-16"
        title="Access review"
        description="What each person can currently reach, in one report per user. The quarterly cycle is not finished until every account has been attested or had changes raised against it."
      />
      <AccessReviewBoard />
    </MainLayout>
  );
}
