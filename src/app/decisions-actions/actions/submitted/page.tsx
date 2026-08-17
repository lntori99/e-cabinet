import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import MinistryBoard from "../../components/ministryBoard";

export const metadata: Metadata = { title: "Submitted for closure" };

/** FR-DEC-10 — evidence is in; the Secretariat has not yet signed it off. */
export default function SubmittedPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-10"
        title="Submitted for closure"
        description="Actions where the ministry has attached its evidence and asked for sign-off. They stay open until the Secretariat has checked the evidence against the decision."
      />
      <MinistryBoard
        scope="submitted"
        today={today}
      />
    </MainLayout>
  );
}
