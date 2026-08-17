import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AuthorisationBoard from "./components/authorisationBoard";

export const metadata: Metadata = { title: "Join authorisation" };

/** FR-VID-02 / 03 / 04 — a link is not a key, and a seat is not an entitlement. */
export default function JoinAuthorisationPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-VID-02 · FR-VID-03 · FR-VID-04"
        title="Join authorisation"
        description="Who may join each session. Possession of a link is never sufficient — a join is checked against a named Government account and this meeting-specific list, with multi-factor authentication for privileged and remote participants."
      />
      <AuthorisationBoard />
    </MainLayout>
  );
}
