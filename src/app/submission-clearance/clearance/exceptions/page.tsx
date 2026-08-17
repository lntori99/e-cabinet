import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ExceptionBoard from "./components/exceptionBoard";

export const metadata: Metadata = { title: "Exceptions" };

/** FR-SUB-15 — recorded authorisations that let a paper skip a mandatory stage. */
export default function ExceptionsPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SUB-15"
        title="Exceptions"
        description="A paper cannot reach pack assembly with a mandatory stage outstanding unless an exception has been authorised and recorded. Every exception is named, referenced and kept with the paper."
      />
      <ExceptionBoard now={now} />
    </MainLayout>
  );
}
