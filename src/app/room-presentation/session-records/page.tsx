import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import SessionBoard from "./components/sessionBoard";

export const metadata: Metadata = { title: "Session records" };

/** FR-PRS-08 — session start and end, and the clear-down that must follow. */
export default function SessionRecordsPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PRS-08"
        title="Session records"
        description="Every presentation session, what it put on the screens, and whether the endpoint cleared itself afterwards. A session is not finished until its clear-down is confirmed."
      />
      <SessionBoard now={now} />
    </MainLayout>
  );
}
