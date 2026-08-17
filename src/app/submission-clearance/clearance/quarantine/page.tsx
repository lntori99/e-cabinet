import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import QuarantineBoard from "./components/quarantineBoard";

export const metadata: Metadata = { title: "Quarantine" };

/** FR-SUB-04 — uploads that failed file type, size or malware scanning. */
export default function QuarantinePage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SUB-04"
        title="Quarantine"
        description="Uploads stopped at the perimeter. Nothing here has entered clearance, and nothing leaves quarantine without a decision recorded against it."
      />
      <QuarantineBoard now={now} />
    </MainLayout>
  );
}
