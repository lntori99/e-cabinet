import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import DeviceBoard from "./components/deviceBoard";

export const metadata: Metadata = { title: "Trusted devices" };

/** FR-IAM-18 — certificate-based device trust and attestation status. */
export default function TrustedDevicesPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-IAM-18"
        title="Trusted devices"
        description="Classified material opens only on a managed device holding a valid certificate and a current attestation. The device's trust level caps what its holder can reach, whatever their role allows."
      />
      <DeviceBoard now={now} />
    </MainLayout>
  );
}
