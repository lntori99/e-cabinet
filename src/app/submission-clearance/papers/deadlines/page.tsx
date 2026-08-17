import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import SubmitterDeadlines from "./components/submitterDeadlines";

export const metadata: Metadata = { title: "Submission deadlines" };

/** Upcoming cut-offs, with the ministry's own late status visible (FR-SUB-13). */
export default function PapersDeadlinesPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SUB-13"
        title="Deadlines"
        description="When each sitting stops taking papers, and what your ministry has in against it. A paper submitted after the cut-off is flagged late and waits on the Secretariat before it enters clearance."
      />
      <SubmitterDeadlines now={now} />
    </MainLayout>
  );
}
