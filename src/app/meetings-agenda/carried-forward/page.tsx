import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import CarriedForwardBoard from "./components/carriedForwardBoard";

export const metadata: Metadata = { title: "Carried forward" };

/** FR-MTG-11 — undecided items awaiting a nominated meeting. */
export default function CarriedForwardPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-MTG-11"
        title="Carried forward"
        description="Items a sitting rose from without deciding. Nominate the meeting each one moves to — its papers and its history travel with it."
      />
      <CarriedForwardBoard />
    </MainLayout>
  );
}
