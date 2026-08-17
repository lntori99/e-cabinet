import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import RecordBoard from "./components/recordBoard";

export const metadata: Metadata = { title: "Records under retention" };

/** FR-DAT-02 — papers, packs, decisions, actions, attendance and audit. */
export default function RecordsPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DAT-02"
        title="Records under retention"
        description="The register of what is preserved, soonest to expire first. A record past its date is either held by something or waiting on somebody, and each row says which."
      />
      <RecordBoard today={today} />
    </MainLayout>
  );
}
