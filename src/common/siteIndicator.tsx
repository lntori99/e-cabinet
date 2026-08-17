import { FiLock } from "react-icons/fi";
import { SITE } from "@/core/app-constants";

/**
 * Stands where the reference had a location switcher. It reports rather than
 * switches: the console is bound to the production site, and failing over to
 * {SITE.drSite} is an operations decision, not a user preference.
 */
export default function SiteIndicator() {
  return (
    <div className="hidden items-center gap-2 lg:flex">
      <span className="stamp text-seal-500">
        <FiLock size={10} /> Restricted session
      </span>
      <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
        GWAN · {SITE.productionSite} production
      </span>
    </div>
  );
}
