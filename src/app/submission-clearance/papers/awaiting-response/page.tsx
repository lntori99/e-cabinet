import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AwaitingResponse from "./components/awaitingResponse";

export const metadata: Metadata = { title: "Awaiting my response" };

/** FR-SUB-09 / 11 — papers returned for amendment, with their comment thread. */
export default function AwaitingResponsePage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SUB-09 · FR-SUB-11"
        title="Awaiting my response"
        description="Papers a clearance actor has sent back. Answer the point raised and resubmit — the thread and every earlier version stay with the paper."
      />
      <AwaitingResponse now={now} />
    </MainLayout>
  );
}
