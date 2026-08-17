import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import PrivilegedBoard from "./components/privilegedBoard";

export const metadata: Metadata = { title: "Privileged access" };

/** FR-IAM-10 / 11 / 12 — separation, break-glass, and the bastion record. */
export default function PrivilegedAccessPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-IAM-10 · FR-IAM-11 · FR-IAM-12"
        title="Privileged access"
        description="Administrators hold no default read access to Cabinet content. Reaching it takes a documented client approval, is time-boxed, alerts the client security owner, and is recorded here and in the audit log."
      />
      <PrivilegedBoard now={now} />
    </MainLayout>
  );
}
