import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import SearchConsole from "./components/searchConsole";

export const metadata: Metadata = { title: "Search" };

/** FR-SCH-01, FR-SCH-03 — full text across papers, decisions and actions. */
export default function SearchPage() {
  // Server-computed so the timestamp under the results is the platform's, not
  // the clock of whoever is looking.
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SCH-01 · FR-SCH-03"
        title="Search"
        description="One query across historical papers, decisions and action records — over the text of a paper and its annexes, not the metadata around them. Filter by meeting, ministry, date, classification and status."
      />
      <SearchConsole now={now} />
    </MainLayout>
  );
}
