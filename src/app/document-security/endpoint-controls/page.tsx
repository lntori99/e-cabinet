import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import EndpointBoard from "./components/endpointBoard";

export const metadata: Metadata = { title: "Endpoint controls" };

/** FR-DOC-15 / 16 / 17 / 19 — what a shared room device may hold, and for how long. */
export default function EndpointControlsPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DOC-15 · 16 · 17 · 19"
        title="Endpoint controls"
        description="Shared room devices hold nothing permanently. Where a session needs a local cache it is encrypted, limited to that session's pack, and cleared at the end — and the clearing is verified by inspecting the device afterwards."
      />
      <EndpointBoard />
    </MainLayout>
  );
}
