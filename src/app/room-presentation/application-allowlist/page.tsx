import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AllowlistBoard from "./components/allowlistBoard";

export const metadata: Metadata = { title: "Application allowlist" };

/** FR-PRS-09 — approved e-Cabinet, conferencing and presentation services only. */
export default function ApplicationAllowlistPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PRS-09"
        title="Application allowlist"
        description="What a room endpoint is allowed to run. The list is short by intention: a device in a Cabinet Room has one job, and everything outside that job is a way for material to leave the platform."
      />
      <AllowlistBoard />
    </MainLayout>
  );
}
