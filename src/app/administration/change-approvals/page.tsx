import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ApprovalBoard from "./components/approvalBoard";

export const metadata: Metadata = { title: "Change approvals" };

/** FR-ADM-05 — a second authorised approver, never the implementer. */
export default function ChangeApprovalsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-ADM-05"
        title="Change approvals"
        description="Security-relevant changes waiting on somebody other than the person who proposed them. The refusal is in the platform rather than on the button — a self-approval is declined whatever screen asks for it."
      />
      <ApprovalBoard />
    </MainLayout>
  );
}
