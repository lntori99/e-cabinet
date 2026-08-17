import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import NotificationDashboard from "./components/notificationDashboard";

export const metadata: Metadata = { title: "Notification overview" };

/** FR NOT — what was sent, what failed, and what the rules say. */
export default function NotificationOverviewPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR NOT"
        title="Notification overview"
        description="What the platform has sent and what became of it. A notification says that something happened and sends the recipient into the platform to see it — it never carries the material, in the subject line, the body or an attachment."
      />
      <NotificationDashboard />
    </MainLayout>
  );
}
