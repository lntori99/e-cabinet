import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import FlagBoard from "./components/flagBoard";

export const metadata: Metadata = { title: "Flagged items" };

/** FR-REV-08 — matters marked for attention or discussion. */
export default function FlaggedItemsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-REV-08"
        title="Flagged items"
        description="Matters you have marked while reading. A flag is not a private note — it appears on the Secretariat dashboard against the agenda item, with your name on it."
      />
      <FlagBoard />
    </MainLayout>
  );
}
