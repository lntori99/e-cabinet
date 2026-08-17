import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import VerificationBoard from "./components/verificationBoard";

export const metadata: Metadata = { title: "Closure verification" };

/** FR-DEC-10 — the Secretariat half of closing an action. */
export default function ClosureVerificationPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-10"
        title="Closure verification"
        description="A ministry closes an action by submitting evidence; the Secretariat closes it by reading that evidence against the decision. Both halves are on the record, and a request can go back."
      />
      <VerificationBoard today={today} />
    </MainLayout>
  );
}
