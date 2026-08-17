import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AlertBoard from "./components/alertBoard";

export const metadata: Metadata = { title: "Alerts" };

/** FR-AUD-15 — bulk download, out-of-hours access, repeated failures, privilege change. */
export default function AlertsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-AUD-15"
        title="Alerts"
        description="The four anomalous patterns the requirement names. Each alert carries the rule that fired beside what was observed, because half of reviewing an alert is judging whether the rule was right to fire at all."
      />
      <AlertBoard />
    </MainLayout>
  );
}
