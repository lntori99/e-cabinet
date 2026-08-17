import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import EncryptionBoard from "./components/encryptionBoard";

export const metadata: Metadata = { title: "Encryption and keys" };

/** FR-DOC-05 / 06 / 07 — at rest, in transit, and the HSM key tier. */
export default function EncryptionKeysPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DOC-05 · FR-DOC-06 · FR-DOC-07"
        title="Encryption and keys"
        description="What is encrypted, with what, and where the keys live. Read-mostly: this screen reports the state of the platform rather than offering somewhere to change it."
      />
      <EncryptionBoard />
    </MainLayout>
  );
}
