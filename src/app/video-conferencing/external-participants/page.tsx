import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ExternalBoard from "./components/externalBoard";

export const metadata: Metadata = { title: "External participants" };

/** FR-VID-14 — Release 2. Exceptional, pre-approved, verified and scoped. */
export default function ExternalParticipantsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-VID-14 · Release 2"
        title="External participants"
        description="Anyone outside Government joining a Cabinet session is treated as exceptional: pre-approved by name, identity-verified, and admitted only for the meeting or agenda item they were authorised for."
      />
      <ExternalBoard />
    </MainLayout>
  );
}
