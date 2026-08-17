import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import MinistryBoard from "../../components/ministryBoard";

export const metadata: Metadata = { title: "My actions" };

/** FR-DEC-07 — what this officer was personally given, and what they owe back. */
export default function MyActionsPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-07"
        title="My actions"
        description="Actions assigned to you by name, with the deadline and the instructions as Cabinet gave them. Progress is reported in your own words — a status flag on its own does not tell the Secretariat anything."
      />
      <MinistryBoard
        scope="mine"
        today={today}
      />
    </MainLayout>
  );
}
