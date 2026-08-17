import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import DelegationBoard from "./components/delegationBoard";

export const metadata: Metadata = { title: "Delegations" };

/** FR-IAM-17 — a Cabinet member's access, lent for a bounded period. */
export default function DelegationsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-IAM-17"
        title="Delegations"
        description="A Cabinet member may lend their access to a named authorised official for a fixed period. The delegation is explicitly approved, bounded by date, and every use of it is counted and audited."
      />
      <DelegationBoard />
    </MainLayout>
  );
}
