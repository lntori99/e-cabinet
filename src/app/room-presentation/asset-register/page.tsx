import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AssetRegister from "./components/assetRegister";

export const metadata: Metadata = { title: "Asset register" };

/** FR-PRS-10 — every screen, OPS PC, stand and accessory under Government control. */
export default function AssetRegisterPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PRS-10"
        title="Asset register"
        description="Every screen, OPS PC, camera, microphone, stand and accessory in a Cabinet room, with its Government asset tag. Anything in a room that is not on this register is not under control."
      />
      <AssetRegister />
    </MainLayout>
  );
}
