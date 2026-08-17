import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import RoomMediaBoard from "./components/roomMediaBoard";

export const metadata: Metadata = { title: "Room media" };

/** FR-VID-10 — camera, microphone, speaker, DSP and PTZ, per room. */
export default function RoomMediaPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-VID-10"
        title="Room media"
        description="The media chain in each room: professional microphones, digital signal processing, speakers and a controllable camera. Poor audio is what makes a hybrid sitting unworkable, so it is configured rather than assumed."
      />
      <RoomMediaBoard />
    </MainLayout>
  );
}
