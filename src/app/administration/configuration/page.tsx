import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import ConfigBoard from "./components/configBoard";

export const metadata: Metadata = { title: "Configuration" };

/** FR-ADM-02, FR-ADM-03 — configurable without a code change. */
export default function ConfigurationPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-ADM-02 · FR-ADM-03"
        title="Configuration"
        description="Role definitions, permission sets, classification handling rules, meeting types, clearance paths, retention classes and notification templates — all held as data. A security-relevant setting is not edited here; it is proposed here."
      />
      <ConfigBoard />
    </MainLayout>
  );
}
