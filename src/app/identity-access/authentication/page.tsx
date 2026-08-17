import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AuthenticationBoard from "./components/authenticationBoard";

export const metadata: Metadata = { title: "Authentication" };

/** FR-IAM-02 … 06 — directory binding, resilience, MFA, tokens and step-up. */
export default function AuthenticationPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-IAM-02 … FR-IAM-06"
        title="Authentication"
        description="How users prove who they are: the Government directory this deployment trusts, the path that keeps the Secretariat working when that directory is unreachable, and the factors each role must present."
      />
      <AuthenticationBoard />
    </MainLayout>
  );
}
