import Link from "next/link";
import { FiArrowRight, FiBell, FiCalendar } from "react-icons/fi";
import { OPERATOR, SITE } from "@/core/app-constants";
import { seedCentreItems } from "@/data/notifications";

/**
 * The banner above the launcher tiles.
 *
 * The artwork is inline SVG rather than an image: it has to scale to any width,
 * survive a build with no asset pipeline, and sit in a repository that ships no
 * binaries. Blurred shapes over a gradient get close enough to a photographic
 * wash and cost nothing to load.
 */
export default function WelcomeBanner() {
  // What is actually waiting on this officer, so the second action carries a
  // real number rather than a decorative one.
  const outstanding = seedCentreItems.filter((item) => !item.read).length;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
      <section className="relative isolate overflow-hidden rounded-2xl">
        <BannerArt />

        <div className="relative px-6 py-10 sm:px-10 sm:py-12">
          <span className="block text-3xl leading-none" aria-hidden="true">
            👋
          </span>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl xl:text-4xl">
            Welcome back, {OPERATOR.name}!
          </h1>

          <p className="mt-2 max-w-xl text-sm text-state-100 sm:text-base">
            {OPERATOR.role} · {SITE.productionSite} production. Here is what is
            waiting in your workspace.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/meetings-agenda/overview"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-state-800 shadow-sm transition hover:bg-state-50"
            >
              <FiCalendar size={15} aria-hidden="true" />
              Meetings and agenda
            </Link>

            <Link
              href="/notifications/centre"
              className="inline-flex items-center gap-2 rounded-lg bg-state-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-state-400"
            >
              <FiBell size={15} aria-hidden="true" />
              {outstanding > 0
                ? `${outstanding} outstanding item${outstanding === 1 ? "" : "s"}`
                : "Notification centre"}
              <FiArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * The wash behind the banner.
 *
 * Three things have to read at once for this to look like flowing light rather
 * than a flat fill: a near-black ground, a saturated core left of centre where
 * the heading sits, and a pale band sweeping up to the right. The dark masses
 * cut back into the band and give it the silhouette.
 *
 * Two blur levels rather than one — the wash wants to be formless, the band
 * wants to keep its shape.
 *
 * `preserveAspectRatio="none"` distorts the shapes at extreme widths, which is
 * fine: they are abstract, and the alternative is a gap at one edge.
 */
function BannerArt() {
  return (
    <svg
      className="absolute inset-0 -z-10 h-full w-full"
      viewBox="0 0 1200 320"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="banner-ground" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#03130c" />
          <stop offset="50%" stopColor="#062317" />
          <stop offset="100%" stopColor="#010b07" />
        </linearGradient>

        <radialGradient id="banner-core" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#3ba876" stopOpacity="1" />
          <stop offset="45%" stopColor="#1f8a5c" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0e3d29" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="banner-hot" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#6fc59a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3ba876" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="banner-band" x1="0.1" y1="1" x2="0.9" y2="0">
          <stop offset="0%" stopColor="#6fc59a" stopOpacity="0" />
          <stop offset="35%" stopColor="#ecf8f1" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#a6ddbf" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#6fc59a" stopOpacity="0" />
        </linearGradient>

        <filter
          id="banner-wash"
          filterUnits="userSpaceOnUse"
          x="-500"
          y="-500"
          width="2200"
          height="1320"
        >
          <feGaussianBlur stdDeviation="52" />
        </filter>

        <filter
          id="banner-edge"
          filterUnits="userSpaceOnUse"
          x="-500"
          y="-500"
          width="2200"
          height="1320"
        >
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>

      <rect width="1200" height="320" fill="url(#banner-ground)" />

      {/* The formless part: a saturated core and a hotter spot inside it. */}
      <g filter="url(#banner-wash)">
        <ellipse cx="300" cy="190" rx="520" ry="330" fill="url(#banner-core)" />
        <ellipse cx="470" cy="120" rx="230" ry="170" fill="url(#banner-hot)" />
      </g>

      {/* The band, blurred less so it keeps its sweep. */}
      <g filter="url(#banner-edge)">
        <path
          d="M430 400 C 610 300, 740 160, 820 -60 L 1060 -60 C 960 180, 810 330, 650 430 Z"
          fill="url(#banner-band)"
        />
      </g>

      {/* The masses that cut back into it. Both sit low, so the band runs
          clear to the top-right corner instead of being clipped by one. */}
      <g filter="url(#banner-wash)">
        <ellipse cx="1190" cy="330" rx="330" ry="215" fill="#010b07" />
        <ellipse cx="830" cy="400" rx="270" ry="170" fill="#010b07" />
      </g>
    </svg>
  );
}
