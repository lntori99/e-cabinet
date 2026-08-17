import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import SeriesBoard from "./components/seriesBoard";

export const metadata: Metadata = { title: "Series and recurring" };

/** FR-MTG-10 — recurring sittings, their standing agendas and carried lists. */
export default function SeriesAndRecurringPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-MTG-10"
        title="Series and recurring"
        description="Sittings that repeat on a cycle. Each series carries its standing agenda items and its participant list forward, so a new sitting starts from what the last one established."
      />
      <SeriesBoard />
    </MainLayout>
  );
}
