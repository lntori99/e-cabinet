import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import EventLogBoard from "./components/eventLogBoard";

export const metadata: Metadata = { title: "Event log" };

/** FR-AUD-01, FR-AUD-02, FR-AUD-03 */
export default function EventLogPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-AUD-01 · FR-AUD-02 · FR-AUD-03"
        title="Event log"
        description="Every recorded act, with the actor, the action, the object and its version, the timestamp from the synchronised source, the source address, the device and the outcome. Append-only — there is no control here that changes a row."
      />
      <EventLogBoard />
    </MainLayout>
  );
}
