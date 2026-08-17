import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import PackDashboard from "./components/packDashboard";

export const metadata: Metadata = { title: "Pack overview" };

/** Packs by state, freeze cut-offs, readiness failures, acknowledgement gaps. */
export default function PackOverviewPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR PCK"
        title="Pack overview"
        description="Where every pack stands, what is about to freeze, and whether anyone is holding a version that is no longer current — the failure this whole set of controls exists to prevent."
      />
      <PackDashboard now={now} />
    </MainLayout>
  );
}
