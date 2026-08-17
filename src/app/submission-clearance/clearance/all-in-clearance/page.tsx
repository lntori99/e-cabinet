import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ClearanceRegister from "./components/clearanceRegister";

export const metadata: Metadata = { title: "All in clearance" };

/** FR-SUB-07 / 08 — every paper in flight, filterable by stage. */
export default function AllInClearancePage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SUB-07 · FR-SUB-08"
        title="All in clearance"
        description="Every paper in flight across all ministries, wherever it has reached. Filter by the stage it is sitting at to see who is being waited on."
      />
      <ClearanceRegister now={now} />
    </MainLayout>
  );
}
