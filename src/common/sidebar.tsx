"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiMiniXMark, HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { LuLogOut } from "react-icons/lu";
import Logo from "@/common/logo";
import { OPERATOR } from "@/core/app-constants";
import { logoutAction } from "@/lib/auth-actions";
import { navigationFor, settingsNavigation } from "@/data/sidebarData";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

/** "T. Kachale" → "TK", "Larry" → "LA". Always two letters where possible. */
function initials(name: string) {
  const parts = name.split(/[\s.]+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ─── Bottom settings card ─────────────────────────────────────────────────────

const SettingsCard = ({ onNavigate }: { onNavigate: () => void }) => {
  const pathname = usePathname();

  return (
    <div className="mt-4 shrink-0">
      <div className="space-y-0.5 rounded-xl border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900/60">
        {settingsNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href) && item.href !== "#";
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={classNames(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-state-50 text-state-700 dark:bg-state-900/30 dark:text-state-400"
                  : "text-neutral-600 hover:bg-white/70 dark:text-neutral-300 dark:hover:bg-neutral-800",
              )}
            >
              <item.icon
                className={classNames(
                  "h-4 w-4 shrink-0",
                  isActive
                    ? "text-state-600 dark:text-state-400"
                    : "text-neutral-400 dark:text-neutral-500",
                )}
              />
              {item.name}
            </Link>
          );
        })}

        {/* Divider + sign out. A form, not a click handler — the session cookie
            is httpOnly, so only the server can clear it. */}
        <div className="border-t border-neutral-200 pt-1 dark:border-neutral-800">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-seal-500 transition-colors hover:bg-white/70 dark:hover:bg-neutral-800"
            >
              <LuLogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Signed-in operator */}
      <div className="mt-3 flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-state-600">
            <span className="text-xs font-bold text-white">
              {initials(OPERATOR.name)}
            </span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {OPERATOR.name}
            </p>
            <p className="text-xs font-medium text-state-600 dark:text-state-400">
              {OPERATOR.shortRole}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) => {
  const pathname = usePathname();

  // Each functional area brings its own list, so the sidebar shows the app you
  // are inside rather than every route in the build.
  const navigation = useMemo(() => navigationFor(pathname), [pathname]);

  /** The group the current page sits in, if any. */
  const activeGroup =
    navigation.find((item) =>
      item.subItems?.some((sub) => pathname === sub.href),
    )?.name ?? null;

  const [openAccordion, setOpenAccordion] = useState<string | null>(activeGroup);

  // The sidebar stays mounted across client navigation, so the group holding
  // the page has to be opened on arrival too — not only on first render. A link
  // from elsewhere in the app would otherwise land on a page whose group is
  // still collapsed.
  useEffect(() => {
    if (activeGroup) setOpenAccordion(activeGroup);
  }, [activeGroup]);

  const toggleAccordion = (name: string) => {
    setOpenAccordion((prev) => (prev === name ? null : name));
  };

  const brand = <Logo href="/welcome" />;

  const navList = (
    <ul role="list" className="flex flex-1 flex-col gap-y-1">
      {navigation.map((item) => {
        const isOpen = openAccordion === item.name;
        return (
          <li key={item.name}>
            {item.section && (
              <p className="px-3 pt-4 pb-1 text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                {item.section}
              </p>
            )}

            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleAccordion(item.name)}
                  aria-expanded={isOpen}
                  className={classNames(
                    "group flex w-full items-center justify-between rounded-lg p-2 text-sm font-medium transition-colors",
                    activeGroup === item.name
                      ? "text-state-700 dark:text-state-400"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800",
                  )}
                >
                  <span className="flex items-center gap-x-3">
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </span>
                  {isOpen ? (
                    <HiChevronUp className="h-4 w-4" />
                  ) : (
                    <HiChevronDown className="h-4 w-4" />
                  )}
                </button>

                {isOpen && (
                  <div className="mt-1 ml-5 flex flex-col border-l border-neutral-200 pl-3 dark:border-neutral-800">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        onClick={() => setSidebarOpen(false)}
                        aria-current={pathname === subItem.href ? "page" : undefined}
                        className={classNames(
                          "flex items-center gap-x-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                          pathname === subItem.href
                            ? "bg-state-600/10 font-medium text-state-700 dark:bg-state-900/30 dark:text-state-400"
                            : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                        )}
                      >
                        <subItem.icon className="h-4 w-4 shrink-0" />
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
                className={classNames(
                  "group flex items-center gap-x-3 rounded-lg p-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-state-600/10 text-state-700 dark:bg-state-900/30 dark:text-state-400"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* ===== Mobile Sidebar ===== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-neutral-900/80"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex w-full max-w-[260px] flex-1 flex-col bg-white dark:bg-neutral-950">
            <div className="flex items-center justify-between px-6 pt-6">
              {brand}
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation"
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-300 dark:hover:text-white"
              >
                <HiMiniXMark className="h-6 w-6" />
              </button>
            </div>

            <nav
              aria-label="Console"
              className="mt-6 flex flex-1 flex-col overflow-y-auto px-4 pb-4"
            >
              <div className="flex-1">{navList}</div>
              <SettingsCard onNavigate={() => setSidebarOpen(false)} />
            </nav>
          </div>
        </div>
      )}

      {/* ===== Desktop Sidebar ===== */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-[250px] lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto border-r border-neutral-200 bg-white px-4 pb-4 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex shrink-0 items-center px-2 pt-6">{brand}</div>

          <nav aria-label="Console" className="mt-6 flex flex-1 flex-col">
            <div className="flex-1">{navList}</div>
            <SettingsCard onNavigate={() => {}} />
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
