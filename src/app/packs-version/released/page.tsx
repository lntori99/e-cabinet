import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ReleasedBoard from "./components/releasedBoard";

export const metadata: Metadata = { title: "Released packs" };

/** FR-PCK-09 / 11 — out with the meeting's authorised participants. */
export default function ReleasedPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PCK-09 · FR-PCK-11"
        title="Released"
        description="Packs with participants, and when each went out. A participant restricted from a closed item holds a copy that omits it entirely — not one with a hole where it was."
      />
      <ReleasedBoard />
    </MainLayout>
  );
}
