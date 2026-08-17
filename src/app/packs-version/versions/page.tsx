import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import VersionBoard from "./components/versionBoard";

export const metadata: Metadata = { title: "Versions" };

/** FR-PCK-06 / 07 / 08 / 13 — replacement history and superseded markers. */
export default function VersionsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PCK-06 · 07 · 08 · 13"
        title="Versions"
        description="Every replacement, who authorised it and why. Superseded versions stay retrievable and are marked as superseded wherever they appear — including on the copy a participant is still holding."
      />
      <VersionBoard />
    </MainLayout>
  );
}
