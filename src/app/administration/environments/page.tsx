import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import EnvironmentBoard from "./components/environmentBoard";

export const metadata: Metadata = { title: "Environments" };

/** FR-ADM-07 — non-production, configured identically, for validation. */
export default function EnvironmentsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-ADM-07"
        title="Environments"
        description="The non-production environments and how closely each matches production, line by line. Two lines are meant to differ — the identity realm and the node count — and everything that decides behaviour is the same."
      />
      <EnvironmentBoard />
    </MainLayout>
  );
}
