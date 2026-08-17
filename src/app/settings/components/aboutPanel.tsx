import Link from "next/link";
import { FiExternalLink, FiLock, FiServer } from "react-icons/fi";
import { DetailRow } from "@/common/table";
import { OPERATOR, SITE } from "@/core/app-constants";
import SettingsCard from "./settingsCard";

/** No client state — this is the environment, not a preference. */
export default function AboutPanel({ now }: { now: string }) {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="This session"
        description="What the audit log will show against anything you do from here."
      >
        <div className="space-y-0.5">
          <DetailRow label="Signed in as" value={OPERATOR.name} />
          <DetailRow label="Role" value={OPERATOR.role} />
          <DetailRow label="Address" value={OPERATOR.email} />
          <DetailRow label="Client address" value={OPERATOR.ip} />
          <DetailRow label="Read at" value={now.replace("T", " ")} />
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <FiLock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          Every action in this console is attributed to this identity and written
          to a protected log. Sessions end after their configured idle period.
        </p>
      </SettingsCard>

      <SettingsCard
        title="Platform"
        description="Where this deployment runs and who is answerable for it."
      >
        <div className="space-y-0.5">
          <DetailRow label="Platform" value={SITE.fullName} />
          <DetailRow
            label="Production site"
            value={
              <span className="inline-flex items-center gap-1.5">
                <FiServer size={12} className="text-neutral-400" aria-hidden="true" />
                {SITE.productionSite}
              </span>
            }
          />
          <DetailRow label="Disaster recovery site" value={SITE.drSite} />
          <DetailRow label="Owner" value={SITE.owner} />
          <DetailRow label="Vendor" value={SITE.vendor} />
          <DetailRow label="Support" value={`${SITE.email} · ${SITE.phone}`} />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Your access"
        description="What you can currently reach, and where to raise a change to it."
      >
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href="/identity-access/access-review"
              className="inline-flex items-center gap-2 font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Your entitlement report
              <FiExternalLink size={13} aria-hidden="true" />
            </Link>
            <span className="block text-xs text-neutral-500 dark:text-neutral-400">
              Every meeting, document and function your account can reach, as it
              appears in the quarterly access review.
            </span>
          </li>
          <li>
            <Link
              href="/identity-access/delegations"
              className="inline-flex items-center gap-2 font-medium text-state-700 hover:underline dark:text-state-400"
            >
              Delegations in your name
              <FiExternalLink size={13} aria-hidden="true" />
            </Link>
            <span className="block text-xs text-neutral-500 dark:text-neutral-400">
              Access lent to you, or by you, for a bounded period.
            </span>
          </li>
        </ul>
      </SettingsCard>
    </div>
  );
}
