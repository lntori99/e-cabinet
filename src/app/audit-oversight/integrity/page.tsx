import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import IntegrityBoard from "./components/integrityBoard";

export const metadata: Metadata = { title: "Integrity verification" };

/** FR-AUD-04, FR-AUD-06 — verification runs and their results. */
export default function IntegrityPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-AUD-04 · FR-AUD-06"
        title="Integrity verification"
        description="Each event is hashed over its own fields and the previous event's hash, so altering one row breaks every row after it. A run under the client security owner's own credential is the one that proves this to somebody who does not trust the platform."
      />
      <IntegrityBoard />
    </MainLayout>
  );
}
