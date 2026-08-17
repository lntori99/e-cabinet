import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import PreferenceBoard from "./components/preferenceBoard";

export const metadata: Metadata = { title: "Notification preferences" };

/** FR-NOT-08 — user preferences, within the limits policy sets. */
export default function PreferencesPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-NOT-08"
        title="Notification preferences"
        description="How you are told, not whether. You can narrow the channels on the notifications policy leaves to you; the mandatory ones are shown locked and are sent whatever anybody sets."
      />
      <PreferenceBoard />
    </MainLayout>
  );
}
