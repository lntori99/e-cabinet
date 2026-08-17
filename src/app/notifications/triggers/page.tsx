import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import RuleBoard from "./components/ruleBoard";

export const metadata: Metadata = { title: "Triggers and rules" };

/** FR-NOT-01 to FR-NOT-05 — which events notify whom, and when. */
export default function TriggersPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-NOT-01 … FR-NOT-05"
        title="Triggers and rules"
        description="Which event notifies whom, down which channel, how far ahead the reminder goes out and where an unmet item escalates. Recipients are roles rather than people, resolved when the notification is sent."
      />
      <RuleBoard />
    </MainLayout>
  );
}
