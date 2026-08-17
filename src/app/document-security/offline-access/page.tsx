import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import OfflineBoard from "./components/offlineBoard";

export const metadata: Metadata = { title: "Offline access" };

/** FR-DOC-18 — Release 2. Managed devices, token expiry, wipe, sync on return. */
export default function OfflineAccessPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DOC-18 · Release 2"
        title="Offline access"
        description="Where Government policy permits offline review at all, it is the narrowest right the platform grants: a managed device, encrypted storage, a token that expires, remote wipe, and an audit trail that catches up on reconnection."
      />
      <OfflineBoard now={now} />
    </MainLayout>
  );
}
