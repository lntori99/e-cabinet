import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import PackShelf from "./components/packShelf";

export const metadata: Metadata = { title: "My packs" };

/** Every pack this reader can reach, past and present. */
export default function MyPacksPage() {
  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR REV"
        title="My packs"
        description="Every pack released to you, newest sitting first. A pack stays reachable until its access expires — which is set by the classification of what is inside it."
      />
      <PackShelf />
    </MainLayout>
  );
}
