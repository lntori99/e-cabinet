import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import BackupBoard from "./components/backupBoard";

export const metadata: Metadata = { title: "Backups" };

/** FR-DAT-08 — encrypted, access-controlled, monitored, one copy protected. */
export default function BackupsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DAT-08"
        title="Backups"
        description="Four conditions per set rather than one green tick. A backup that is encrypted and monitored but deletable by an administrator meets three of them and protects against nothing that matters."
      />
      <BackupBoard />
    </MainLayout>
  );
}
