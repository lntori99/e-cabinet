import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import NotesBoard from "./components/notesBoard";

export const metadata: Metadata = { title: "My notes" };

/** FR-REV-03 / 05 — private across every pack, searchable, bound to versions. */
export default function MyNotesPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-REV-03 · FR-REV-05"
        title="My notes"
        description="Every private annotation you have made, across every pack. These are yours: encrypted at rest, excluded from administrative access, and carried between your sessions and devices."
      />
      <NotesBoard />
    </MainLayout>
  );
}
