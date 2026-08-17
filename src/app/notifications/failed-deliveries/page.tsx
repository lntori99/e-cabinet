import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import FailedBoard from "./components/failedBoard";

export const metadata: Metadata = { title: "Failed deliveries" };

/** FR-NOT-10 — failures surfaced to the Secretariat for follow-up. */
export default function FailedDeliveriesPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-NOT-10"
        title="Failed deliveries"
        description="Notifications that did not reach their recipient. This is its own screen rather than a filter on the log because a participant who never received a release notice is a meeting risk, and a risk needs somewhere it is looked at."
      />
      <FailedBoard />
    </MainLayout>
  );
}
