import { redirect } from "next/navigation";
import { OPERATOR } from "@/core/app-constants";

/**
 * FR-SUB-05 — the two audiences never share a screen, so the app has no common
 * landing page: it sends the viewer to the side their role belongs on. Once
 * roles come from the session this reads the session rather than `OPERATOR`.
 */
export default function SubmissionClearanceEntry() {
  // Widened deliberately: `OPERATOR` is a fixed demo account, so TypeScript
  // knows its role literally. The branch is the real rule and stays.
  const role: string = OPERATOR.role;

  redirect(
    role === "Ministry Submitter"
      ? "/submission-clearance/papers/my-submissions"
      : "/submission-clearance/clearance/overview",
  );
}
