import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import PeripheralBoard from "./components/peripheralBoard";

export const metadata: Metadata = { title: "Peripheral policy" };

/** FR-PRS-13 / 14 — USB, Wi-Fi, Bluetooth, casting and guest isolation. */
export default function PeripheralPolicyPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PRS-13 · FR-PRS-14"
        title="Peripheral policy"
        description="The ways material could leave a room endpoint, and what is done about each. Where wireless presentation is permitted at all it needs a moderator, and guest traffic never shares a path with Cabinet data."
      />
      <PeripheralBoard />
    </MainLayout>
  );
}
