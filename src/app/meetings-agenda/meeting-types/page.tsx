import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import MeetingTypeCatalogue from "./components/meetingTypeCatalogue";

export const metadata: Metadata = { title: "Meeting types" };

/** FR-MTG-02 — meeting types are configuration, not code. Administrators only. */
export default function MeetingTypesPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-MTG-02 · Administration"
        title="Meeting types"
        description="Each type carries its own participant rule, document handling rule, classification default and approval path. Creating a meeting seeds its defaults from here."
      />
      <MeetingTypeCatalogue />
    </MainLayout>
  );
}
