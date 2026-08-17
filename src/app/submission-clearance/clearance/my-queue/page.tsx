import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import MyQueue from "./components/myQueue";

export const metadata: Metadata = { title: "My queue" };

/** FR-SUB-09 — what this clearance actor is being waited on for. */
export default function MyQueuePage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SUB-09"
        title="My queue"
        description="Papers waiting on your decision. Approve, reject or return each one — never without a written comment, which the submitter and every later actor will read."
      />
      <MyQueue now={now} />
    </MainLayout>
  );
}
