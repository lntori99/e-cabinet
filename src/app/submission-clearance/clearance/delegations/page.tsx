import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ClearanceDelegations from "./components/clearanceDelegations";

export const metadata: Metadata = { title: "Clearance delegations" };

/** FR-SUB-12 — a clearance role held by someone else, recorded and audited. */
export default function ClearanceDelegationsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SUB-12"
        title="Delegations"
        description="A clearance role formally held by another officer for a bounded period. The delegation is recorded against every decision taken under it, so the chain of responsibility stays legible afterwards."
      />
      <ClearanceDelegations />
    </MainLayout>
  );
}
