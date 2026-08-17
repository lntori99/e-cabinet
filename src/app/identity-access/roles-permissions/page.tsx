import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import PermissionMatrix from "./components/permissionMatrix";

export const metadata: Metadata = { title: "Roles and permissions" };

/** FR-IAM-07 / 08 — the seven role groups and the rules behind them. */
export default function RolesPermissionsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-IAM-07 · FR-IAM-08"
        title="Roles and permissions"
        description="Access is granted to a role group, never to a person directly. Every request is then re-evaluated on the server against the factors below — the interface never decides what a user may see."
      />
      <PermissionMatrix />
    </MainLayout>
  );
}
