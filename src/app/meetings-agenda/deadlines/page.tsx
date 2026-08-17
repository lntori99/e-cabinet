import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import DeadlineBoard from "./components/deadlineBoard";

export const metadata: Metadata = { title: "Submission deadlines" };

/** FR-MTG-05 — the submission window across every sitting, breaches flagged. */
export default function DeadlinesPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-MTG-05"
        title="Deadlines"
        description="One submission window per sitting, enforced. Anything still expecting a paper when the window shuts is a breach and is flagged here."
      />
      <DeadlineBoard now={now} />
    </MainLayout>
  );
}
