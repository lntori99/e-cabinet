import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import RestoreBoard from "./components/restoreBoard";

export const metadata: Metadata = { title: "Restore tests" };

/** FR-DAT-09 — a documented restore, completed before go-live. */
export default function RestoreTestsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DAT-09"
        title="Restore tests"
        description="Restores actually performed, with what was recovered and how long it took. One of them is the go-live gate — “we have done restores” and “the restore go-live depends on has passed” are different statements, and only the second is the requirement."
      />
      <RestoreBoard kind="Restore" />
    </MainLayout>
  );
}
