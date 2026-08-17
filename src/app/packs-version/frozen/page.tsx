import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import FrozenBoard from "./components/frozenBoard";

export const metadata: Metadata = { title: "Frozen packs" };

/** FR-PCK-04 / 05 — closed at the cut-off, awaiting release, with no edit path. */
export default function FrozenPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PCK-04 · FR-PCK-05"
        title="Frozen"
        description="Packs closed at their cut-off and waiting to go out. Nothing inside a frozen pack can be altered — the only way to change one is to create a formal replacement version."
      />
      <FrozenBoard />
    </MainLayout>
  );
}
