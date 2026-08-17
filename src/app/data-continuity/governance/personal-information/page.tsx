import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import PersonalDataBoard from "./components/personalDataBoard";

export const metadata: Metadata = { title: "Personal information" };

/** FR-DAT-07 — Release 2. Identification and reporting. */
export default function PersonalInformationPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DAT-07 · Release 2"
        title="Personal information"
        description="Where personal information sits inside Cabinet records, and how many people each finding concerns. The platform's obligation is an accurate answer to “what do you hold about me” — what follows from that answer is a legal act with its own authority."
      />
      <PersonalDataBoard />
    </MainLayout>
  );
}
