import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ReportBoard from "./components/reportBoard";

export const metadata: Metadata = { title: "Reports" };

/** FR-AUD-09 — the five standing reports the requirement names. */
export default function ReportsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-AUD-09"
        title="Reports"
        description="Document access, downloads, administrative changes, meeting attendance and workflow actions. Each shows what it would return against the current log, so a report that would come back empty says so before anybody runs it."
      />
      <ReportBoard />
    </MainLayout>
  );
}
