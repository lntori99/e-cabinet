import { FiGrid, FiLock, FiMapPin, FiServer, FiUser } from "react-icons/fi";
import { OPERATOR, SITE } from "@/core/app-constants";

/**
 * The band above the launcher tiles.
 *
 * It carries the four things somebody signing in to a Cabinet system needs to
 * know before they touch anything: who the platform thinks they are, which
 * environment they have reached, that the session is a restricted one, and the
 * handling rule that applies to everything behind the tiles. A banner that only
 * said the product name would be decoration; this one is the first line of the
 * handling notice.
 */
export default function WelcomeBanner({
  available,
  total,
}: {
  available: number;
  total: number;
}) {
  return (
    <section
      className="border-b border-state-800 bg-state-700 dark:border-state-900 dark:bg-state-800"
      aria-labelledby="launcher-banner-title"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-6">
          <div className="min-w-0 max-w-2xl text-state-50">
            <span className="inline-flex items-center gap-2 rounded-full border border-state-400/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-state-200">
              <FiLock size={10} aria-hidden="true" />
              Restricted — official use only
            </span>

            <h1
              id="launcher-banner-title"
              className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl xl:text-4xl"
            >
              Welcome, {OPERATOR.name}
            </h1>

            <p className="mt-2 text-sm text-state-100 sm:text-base">
              {SITE.fullName}
            </p>

            <p className="mt-3 max-w-xl text-sm text-state-200">
              Everything behind these tiles is Cabinet material. It is read
              inside the platform, it is not carried out of it, and every act on
              it is recorded against your name.
            </p>
          </div>

          {/* The environment facts, set apart from the copy so they read as a
              plate rather than as more prose. */}
          <dl className="grid shrink-0 gap-x-8 gap-y-3 text-state-100 sm:grid-cols-2">
            <Fact icon={FiUser} label="Signed in as" value={OPERATOR.role} />
            <Fact
              icon={FiServer}
              label="Environment"
              value={`${SITE.productionSite} production`}
            />
            <Fact icon={FiMapPin} label="Recovery site" value={SITE.drSite} />
            <Fact
              icon={FiGrid}
              label="Functional areas"
              value={`${available} of ${total} in this build`}
            />
          </dl>
        </div>

        <div className="mt-8 border-t border-state-600/70 pt-4 dark:border-state-700">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-state-300">
            {SITE.owner} · delivered by {SITE.vendor}
          </p>
        </div>
      </div>
    </section>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FiLock;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-state-300">
        {label}
      </dt>
      <dd className="mt-1 inline-flex items-start gap-1.5 text-sm">
        <Icon size={13} className="mt-0.5 shrink-0 text-state-300" aria-hidden="true" />
        {value}
      </dd>
    </div>
  );
}
