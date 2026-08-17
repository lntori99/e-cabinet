import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import SupplementaryBoard from "./components/supplementaryBoard";

export const metadata: Metadata = { title: "Supplementary packs" };

/** FR-PCK-12 — addenda issued after the primary pack, never mistaken for one. */
export default function SupplementaryPacksPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PCK-12"
        title="Supplementary packs"
        description="Material issued after the primary pack has gone out. A supplementary adds to the primary; it never replaces it — that distinction is the difference between reading more and reading something else."
      />
      <SupplementaryBoard />
    </MainLayout>
  );
}
