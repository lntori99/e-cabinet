import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import MinutesBoard from "./components/minutesBoard";

export const metadata: Metadata = { title: "Minutes and extracts" };

/** FR-DEC-11, FR-DEC-12 */
export default function MinutesPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-11 · FR-DEC-12"
        title="Minutes and extracts"
        description="Minutes, extracts and action lists are generated from the decision record rather than written a second time. They go to named parties, under the classification of what they contain."
      />
      <MinutesBoard />
    </MainLayout>
  );
}
