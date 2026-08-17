"use client";

import { Kpi } from "@/common/ui";
import { hoursUntil } from "@/common/time";
import { useAppSelector } from "@/core/hook";
import {
  selectActiveBreakGlass,
  selectLiveSessions,
  selectOpenDeactivations,
  selectPendingApprovals,
} from "@/core/slices/identity-slice";
import { selectUsers } from "@/core/slices/users-slice";
import { seedAccessDays } from "@/data/identityAccess";
import AttentionQueue from "./attentionQueue";
import DenialsChart from "./denialsChart";
import MfaPosture from "./mfaPosture";
import RoleMixChart from "./roleMixChart";

/**
 * The access administrator's opening screen: what is waiting on an approval,
 * what is currently elevated, and whether the refusal rate has moved.
 */
export default function AccessDashboard({ now }: { now: string }) {
  const users = useAppSelector(selectUsers);
  const approvals = useAppSelector(selectPendingApprovals);
  const activeGrants = useAppSelector(selectActiveBreakGlass);
  const deactivations = useAppSelector(selectOpenDeactivations);
  const sessions = useAppSelector(selectLiveSessions);

  const recent = seedAccessDays.slice(-7);
  const denied = recent.reduce((sum, day) => sum + day.denied, 0);
  const granted = recent.reduce((sum, day) => sum + day.granted, 0);
  const priorDenied = seedAccessDays
    .slice(-14, -7)
    .reduce((sum, day) => sum + day.denied, 0);

  const overdue = deactivations.filter((d) => hoursUntil(d.dueBy, now) < 0).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Pending approvals"
          value={approvals.total}
          hint={`${approvals.breakGlass.length} break-glass · ${approvals.delegations.length} delegation`}
          tone={approvals.total === 0 ? "green" : "amber"}
        />
        <Kpi
          label="Break-glass active"
          value={activeGrants.length}
          hint={
            activeGrants.length === 0
              ? "No administrator can read paper content"
              : "Time-boxed content access is open"
          }
          tone={activeGrants.length === 0 ? "green" : "red"}
        />
        <Kpi
          label="Refused authorisations"
          value={denied}
          hint={`Last 7 days · ${priorDenied} the week before · ${((denied / (denied + granted)) * 100).toFixed(1)}% of requests`}
          tone={denied > priorDenied ? "amber" : "neutral"}
        />
        <Kpi
          label="Awaiting deactivation"
          value={deactivations.length}
          hint={
            overdue > 0
              ? `${overdue} past the one-hour deadline`
              : `${sessions.length} sessions currently live`
          }
          tone={overdue > 0 ? "red" : deactivations.length === 0 ? "green" : "amber"}
        />
      </div>

      <AttentionQueue now={now} />

      <div className="grid gap-6 xl:grid-cols-2">
        <DenialsChart days={seedAccessDays} />
        <RoleMixChart users={users} />
      </div>

      <MfaPosture users={users} />
    </div>
  );
}
