import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import DeviceBoard from "./components/deviceBoard";

export const metadata: Metadata = { title: "Devices" };

/** FR-ADM-08, FR-ADM-09 — inventory, compliance, remote wipe. */
export default function DevicesPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-ADM-08 · FR-ADM-09"
        title="Devices"
        description="Every enrolled endpoint and room device, what it is running and whether it still meets the policy it was enrolled under. A device off policy always says why — a red badge with no finding behind it tells nobody what to do."
      />
      <DeviceBoard />
    </MainLayout>
  );
}
