import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ProcedureBoard from "./components/procedureBoard";

export const metadata: Metadata = { title: "Disaster recovery" };

/** FR-DAT-11 — RPO, RTO, decision authority, steps, communication. */
export default function DisasterRecoveryPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DAT-11"
        title="Disaster recovery"
        description="The documented procedure and the five things it must confirm. A procedure that lists the technical steps but not who may declare a disaster leaves everybody waiting for permission nobody is empowered to give."
      />
      <ProcedureBoard />
    </MainLayout>
  );
}
