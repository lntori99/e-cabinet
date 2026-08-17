import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import CommentsBoard from "./components/commentsBoard";

export const metadata: Metadata = { title: "My comments" };

/** FR-REV-04 — formal comments this reader raised, with recipients and replies. */
export default function MyCommentsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-REV-04"
        title="My comments"
        description="Comments you have put on the record, who can read each one, and what came back. Unlike a private note, a formal comment is visible to the recipients you named."
      />
      <CommentsBoard />
    </MainLayout>
  );
}
