import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ActionRegister from "./components/actionRegister";

export const metadata: Metadata = { title: "Actions" };

/** FR-DEC-06, FR-DEC-09 — every action, cut by ministry, meeting and deadline. */
export default function ActionsPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-06 · FR-DEC-09"
        title="Actions"
        description="Everything a decision put on a ministry: who is responsible, by when, and what they were told to do. The dashboard cuts are filters here rather than separate pages, because most real questions are two cuts at once."
      />
      <ActionRegister today={today} />
    </MainLayout>
  );
}
