import type { Metadata } from "next";
import PageHeading from "@/common/pageHeading";
import MainLayout from "@/shared/mainLayout";
import MinistryBoard from "../../components/ministryBoard";

export const metadata: Metadata = { title: "Ministry actions" };

/** Everything the ministry is carrying, whoever inside it holds the pen. */
export default function MinistryActionsPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <MainLayout>
      <PageHeading
        eyebrow="FR-DEC-06 · FR-DEC-07"
        title="Ministry actions"
        description="Every action assigned to this ministry, across officers and across sittings. You can see all of them; you report progress only on the ones assigned to you."
      />
      <MinistryBoard
        scope="ministry"
        today={today}
      />
    </MainLayout>
  );
}
