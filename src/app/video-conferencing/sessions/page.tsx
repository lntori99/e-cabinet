import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import SessionConsole from "./components/sessionConsole";

export const metadata: Metadata = { title: "Sessions" };

/** FR-VID-05 / 06 / 07 / 08 / 16 — the host's console for a video session. */
export default function SessionsPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-VID-05 · 06 · 07 · 16"
        title="Sessions"
        description="Scheduled and past video sessions, joined to their meetings. Admission, muting, the lock, screen sharing and recording are the host's — nothing here happens on its own."
      />
      <SessionConsole now={now} />
    </MainLayout>
  );
}
