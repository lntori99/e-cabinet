import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import SessionBoard from "./components/sessionBoard";

export const metadata: Metadata = { title: "Sessions" };

/** FR-IAM-14 / 15 — live sessions, the policy behind them, and force revoke. */
export default function SessionsPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-IAM-14 · FR-IAM-15"
        title="Sessions"
        description="Every session currently holding a token. Revoking one takes its cached access and pending document entitlements with it — there is no soft close."
      />
      <SessionBoard now={now} />
    </MainLayout>
  );
}
