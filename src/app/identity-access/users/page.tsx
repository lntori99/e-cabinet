import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import UserDirectory from "./components/userDirectory";

export const metadata: Metadata = { title: "Users" };

/** FR-IAM-01 / 13 — named individual accounts, and closing them in the hour. */
export default function UsersPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-IAM-01 · FR-IAM-13"
        title="Users"
        description="Every account is one named person. Shared and generic accounts are not issued, and deactivation is immediate — it cuts sessions and tokens with the account."
      />
      <UserDirectory now={now} />
    </MainLayout>
  );
}
