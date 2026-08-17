import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import CustodianBoard from "./components/custodianBoard";

export const metadata: Metadata = { title: "Key custodianship" };

/** FR-DAT-13 — recoverable through a procedure requiring multiple custodians. */
export default function KeyCustodianshipPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DAT-13"
        title="Key custodianship"
        description="Who holds a share of the master key, where it physically is, and whether enough of them are reachable. Five custodians with three on leave is a quorum of three that cannot be met."
      />
      <CustodianBoard />
    </MainLayout>
  );
}
