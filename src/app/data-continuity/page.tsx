import { redirect } from "next/navigation";
import { OPERATOR } from "@/core/app-constants";

/**
 * The two sides have different audiences — records governance and platform
 * continuity — so the app has no common landing page. Read the session here
 * instead of `OPERATOR` once roles come from the IdP.
 */
export default function DataContinuityEntry() {
  // Widened deliberately: `OPERATOR` is a fixed demo account, so TypeScript
  // knows its role literally. The branch is the real rule and stays.
  const role: string = OPERATOR.role;

  redirect(
    role === "Technical Administrator"
      ? "/data-continuity/continuity/backups"
      : "/data-continuity/governance/overview",
  );
}
