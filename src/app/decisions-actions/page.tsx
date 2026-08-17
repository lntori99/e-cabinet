import { redirect } from "next/navigation";
import { OPERATOR } from "@/core/app-constants";

/**
 * The two audiences never share a screen, so the app has no common landing
 * page: it sends the viewer to the side their role belongs on. Read the session
 * here instead of `OPERATOR` once roles come from the IdP.
 */
export default function DecisionsActionsEntry() {
  // Widened deliberately: `OPERATOR` is a fixed demo account, so TypeScript
  // knows its role literally. The branch is the real rule and stays.
  const role: string = OPERATOR.role;

  redirect(
    role === "Ministry Submitter" || role === "Ministry Officer"
      ? "/decisions-actions/actions/my-actions"
      : "/decisions-actions/decisions/overview",
  );
}
