import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import UserActivity from "./components/userActivity";

export const metadata: Metadata = { title: "User activity" };

/** FR-AUD-11 — complete activity history for one named user, over a period. */
export default function UserActivityPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-AUD-11"
        title="User activity"
        description="Everything one officer did between two dates. The period is an input rather than a fixed window, because “what has this person been doing” is not a question anybody can answer without saying since when."
      />
      <UserActivity today={today} />
    </MainLayout>
  );
}
