import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import AdminDashboard from "./components/adminDashboard";

export const metadata: Metadata = { title: "Admin overview" };

/** FR ADM — pending approvals, health, device compliance, maintenance ahead. */
export default function AdminOverviewPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR ADM"
        title="Admin overview"
        description="What is waiting on a second approver, what the platform is complaining about, which devices have drifted off policy, and what is scheduled to be taken down. Individual account administration lives in Identity and Access."
      />
      <AdminDashboard />
    </MainLayout>
  );
}
