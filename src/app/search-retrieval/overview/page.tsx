import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ArchiveDashboard from "./components/archiveDashboard";

export const metadata: Metadata = { title: "Archive overview" };

/** FR SCH — what the archive holds, how it is indexed, and who asked what. */
export default function ArchiveOverviewPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR SCH"
        title="Archive overview"
        description="What the archive holds and how far back it reaches, how the index is built and protected, and the queries run against it. Every count on this page is scoped to your entitlements before it is counted."
      />
      <ArchiveDashboard />
    </MainLayout>
  );
}
