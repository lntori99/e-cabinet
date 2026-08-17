import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ReplicationBoard from "./components/replicationBoard";

export const metadata: Metadata = { title: "Replication" };

/** FR-DAT-10 — configuration, database and repository to the DR environment. */
export default function ReplicationPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DAT-10"
        title="Replication"
        description="All three components, because a recovery site with the data and not the configuration is a site that holds the papers and cannot serve them. Lag is measured against the recovery point objective rather than against nothing."
      />
      <ReplicationBoard />
    </MainLayout>
  );
}
