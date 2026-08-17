import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import DeliveryLog from "./components/deliveryLog";

export const metadata: Metadata = { title: "Delivery log" };

/** FR-NOT-10 — every notification sent, with its delivery outcome. */
export default function DeliveryLogPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-NOT-10"
        title="Delivery log"
        description="Every notification the platform has sent: the event that fired it, who it went to, down which channel, and what happened to it. The message body is not recorded, because a notification does not have one worth recording."
      />
      <DeliveryLog />
    </MainLayout>
  );
}
