import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import RestoreBoard from "../restore-tests/components/restoreBoard";

export const metadata: Metadata = { title: "Failover tests" };

/** FR-DAT-12 — Release 2. Full-service failover, validated live. */
export default function FailoverTestsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DAT-12 · Release 2"
        title="Failover tests"
        description="Failing the whole service over to Blantyre and running it there. What has been tested so far is partial — the database and application tier moved, and the conferencing media nodes did not follow, which is the finding rather than a footnote."
      />
      <RestoreBoard kind="Failover" />
    </MainLayout>
  );
}
