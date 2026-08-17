import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import EndpointLogBoard from "./components/endpointLogBoard";

export const metadata: Metadata = { title: "Endpoint logs" };

/** FR-PRS-11 — sign-in, administrative change, application access, update, error. */
export default function EndpointLogsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-PRS-11"
        title="Endpoint logs"
        description="Everything a room endpoint reports to the central log platform. A device in a Cabinet Room is administered like any other privileged system — what happens on it is recorded, and someone has to pick it up."
      />
      <EndpointLogBoard />
    </MainLayout>
  );
}
