import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import BaselineBoard from "./components/baselineBoard";

export const metadata: Metadata = { title: "Security baseline" };

/** FR-PRS-12 — the Windows 11 Professional baseline, with state per device. */
export default function SecurityBaselinePage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PRS-12"
        title="Security baseline"
        description="Disk encryption, local firewall, anti-malware, update policy, screen lock and local administrator restriction — measured on each device rather than assumed from its configuration."
      />
      <BaselineBoard />
    </MainLayout>
  );
}
