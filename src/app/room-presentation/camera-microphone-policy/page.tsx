import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AvPolicyBoard from "./components/avPolicyBoard";

export const metadata: Metadata = { title: "Camera and microphone policy" };

/** FR-PRS-15 — who may start a session, whether recording is permitted, shutdown. */
export default function CameraMicrophonePolicyPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PRS-15"
        title="Camera and microphone policy"
        description="Who may start a video session in each room, whether it may be recorded, and how the devices behave once the meeting is over."
      />
      <AvPolicyBoard />
    </MainLayout>
  );
}
