import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ExpiryBoard from "./components/expiryBoard";

export const metadata: Metadata = { title: "Access expiry" };

/** FR-DOC-13 — meeting end, retention period, or role loss, whichever is first. */
export default function AccessExpiryPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DOC-13"
        title="Access expiry"
        description="Access ends on its own. Whichever comes first — the meeting ending, the retention period running out, or the reader losing the role that granted it — the document closes without anyone having to remember to close it."
      />
      <ExpiryBoard now={now} />
    </MainLayout>
  );
}
