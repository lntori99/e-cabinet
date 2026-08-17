import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import RevocationBoard from "./components/revocationBoard";

export const metadata: Metadata = { title: "Revocations" };

/** FR-DOC-14 — immediate, by document, pack or version, named users or all. */
export default function RevocationsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DOC-14"
        title="Revocations"
        description="Access withdrawn deliberately, rather than left to expire. A revocation takes effect at once — for a single document, a whole pack or one version, and for named users or everyone holding it."
      />
      <RevocationBoard />
    </MainLayout>
  );
}
