import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import RoomBoard from "./components/roomBoard";

export const metadata: Metadata = { title: "Rooms" };

/** Per-room configuration and the devices attached to it. */
export default function RoomsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PRS-01 · FR-PRS-06"
        title="Rooms"
        description="How each room is configured and what is attached to it. The idle display, casting and recording settings here are what the room does when a sitting is not in progress — and what it will permit when one is."
      />
      <RoomBoard />
    </MainLayout>
  );
}
