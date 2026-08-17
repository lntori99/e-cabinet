import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import RecordForm from "./components/recordForm";

export const metadata: Metadata = { title: "Record decisions" };

/** FR-DEC-01, FR-DEC-02, FR-DEC-03 */
export default function RecordDecisionsPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-01 · FR-DEC-02 · FR-DEC-03"
        title="Record decisions"
        description="Write the decision against the agenda item it belongs to, during the sitting or after it. The meeting, the date and the recording officer come from the item and the session — they are not typed."
      />
      <RecordForm today={today} />
    </MainLayout>
  );
}
