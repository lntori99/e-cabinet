import Link from "next/link";
import { FiGrid, FiLock, FiLogOut, FiSettings } from "react-icons/fi";
import DarkModeToggle from "@/common/darkModeToggle";
import Logo from "@/common/logo";
import { logoutAction } from "@/lib/auth-actions";


export default function LauncherHeader({
  current,
}: {
  current: "welcome" | "settings";
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Logo href="/welcome" />

        <div className="flex items-center gap-3">
          <span className="stamp hidden text-seal-500 sm:inline-flex">
            <FiLock size={10} /> Restricted session
          </span>

          <DarkModeToggle />

          {current === "welcome" ? (
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
            >
              <FiSettings size={14} />
              Settings
            </Link>
          ) : (
            <Link
              href="/welcome"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-state-500 hover:text-state-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-state-400"
            >
              <FiGrid size={14} />
              All apps
            </Link>
          )}

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-seal-500 hover:text-seal-500 dark:border-neutral-700 dark:text-neutral-300"
            >
              <FiLogOut size={14} />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
