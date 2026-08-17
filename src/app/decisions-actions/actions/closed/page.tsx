import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import MinistryBoard from "../../components/ministryBoard";

export const metadata: Metadata = { title: "Closed" };

/** Verified and complete. Kept, not cleared away. */
export default function ClosedPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-10"
        title="Closed"
        description="Actions the Secretariat has verified and closed, with the evidence and the verifying officer kept against each one. Closed is a state on the record, not a clearing-out."
      />
      <MinistryBoard
        scope="closed"
        today={today}
      />
    </MainLayout>
  );
}
