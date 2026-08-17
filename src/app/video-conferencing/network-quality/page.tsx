import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import QualityBoard from "./components/qualityBoard";

export const metadata: Metadata = { title: "Network and quality" };

/** FR-VID-09 — adaptive bitrate, QoS prioritisation, per-session history. */
export default function NetworkQualityPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-VID-09"
        title="Network and quality"
        description="How each session actually performed. The bitrate adapts to the link it finds; the loss and latency underneath are what decide whether a Minister could be heard."
      />
      <QualityBoard />
    </MainLayout>
  );
}
