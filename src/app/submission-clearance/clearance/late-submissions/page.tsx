import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import LateBoard from "./components/lateBoard";

export const metadata: Metadata = { title: "Late submissions" };

/** FR-SUB-13 — documented Secretariat authorisation before clearance begins. */
export default function LateSubmissionsPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SUB-13"
        title="Late submissions"
        description="Papers that arrived after their sitting's cut-off. Each is flagged distinctly and holds outside the clearance chain until the Secretariat authorises it in writing."
      />
      <LateBoard now={now} />
    </MainLayout>
  );
}
