import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import DeletionBoard from "./components/deletionBoard";

export const metadata: Metadata = { title: "Deletion approvals" };

/** FR-DAT-04 — approval, audit, and never one administrator alone. */
export default function DeletionApprovalsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DAT-04"
        title="Deletion approvals"
        description="Destroying a Cabinet record takes three people: one to ask, one to approve, and one to carry it out. Each act is audited separately, and a legal hold stops all three however the request was approved."
      />
      <DeletionBoard />
    </MainLayout>
  );
}
