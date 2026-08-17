import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import HistoryBoard from "./components/historyBoard";

export const metadata: Metadata = { title: "Change history" };

/** FR-ADM-04 — previous value, new value, actor, timestamp. */
export default function ChangeHistoryPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-ADM-04"
        title="Change history"
        description="Every configuration change the platform has taken, with what the setting used to say as well as what it says now. A change record without the previous value cannot answer the only question anybody asks of it."
      />
      <HistoryBoard />
    </MainLayout>
  );
}
