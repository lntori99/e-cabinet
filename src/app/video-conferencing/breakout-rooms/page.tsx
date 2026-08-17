import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import BreakoutBoard from "./components/breakoutBoard";

export const metadata: Metadata = { title: "Breakout rooms" };

/** FR-VID-17 — Release 2, could-have. Committee working sessions only. */
export default function BreakoutRoomsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-VID-17 · Release 2"
        title="Breakout rooms"
        description="Side conversations for committee working sessions. Not for full Cabinet: a sitting of Cabinet is one conversation on one record, and a breakout would be a conversation nobody minutes."
      />
      <BreakoutBoard />
    </MainLayout>
  );
}
