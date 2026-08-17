import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import WatermarkBoard from "./components/watermarkBoard";

export const metadata: Metadata = { title: "Watermarking" };

/** FR-DOC-08 / 09 — applied server-side, and not suppressible by the client. */
export default function WatermarkingPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DOC-08 · FR-DOC-09"
        title="Watermarking"
        description="What is stamped onto a document on view and on print, for each classification. The stamp is rendered server-side into the pages that are sent — there is nothing on the client to switch off."
      />
      <WatermarkBoard now={now} />
    </MainLayout>
  );
}
