import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ChainBoard from "./components/chainBoard";

export const metadata: Metadata = { title: "Decision chains" };

/** FR-DEC-13 — the history of a policy question, across sittings. */
export default function ChainsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-13"
        title="Decision chains"
        description="Where a decision returns to a question Cabinet has already considered, it is linked to the one before it. Read down the chain and you have the history of the question rather than a search result."
      />
      <ChainBoard />
    </MainLayout>
  );
}
