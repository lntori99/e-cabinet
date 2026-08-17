import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import SessionBoard from "./components/sessionBoard";

export const metadata: Metadata = { title: "Admin sessions" };

/** FR-ADM-11 — recorded, and the recordings retained. */
export default function AdminSessionsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-ADM-11"
        title="Admin sessions"
        description="Every administrative session and its recording. The ones worth watching are marked: started out of hours, opened from outside Government ranges, or run with no approved change behind them."
      />
      <SessionBoard />
    </MainLayout>
  );
}
