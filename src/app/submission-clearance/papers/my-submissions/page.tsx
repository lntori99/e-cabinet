import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import MySubmissions from "./components/mySubmissions";

export const metadata: Metadata = { title: "My submissions" };

/** FR-SUB-05 / 06 — own ministry only, with the live clearance stage per paper. */
export default function MySubmissionsPage() {
  const now = new Date().toISOString().slice(0, 16);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-SUB-05 · FR-SUB-06"
        title="My submissions"
        description="Every paper your ministry has put forward, and exactly where each one stands. Papers from other ministries are not listed, counted or searchable from here."
      />
      <MySubmissions now={now} />
    </MainLayout>
  );
}
