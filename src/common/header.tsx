"use client";

import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiMiniBars4, HiMagnifyingGlass } from "react-icons/hi2";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import DarkModeToggle from "./darkModeToggle";
import FullScreen from "./fullScreen";
import SiteIndicator from "./siteIndicator";
import { OPERATOR } from "@/core/app-constants";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import {
  searchChanged,
  selectDocumentSearch,
} from "@/core/slices/documents-slice";
import { logoutAction } from "@/lib/auth-actions";

const userNavigation = [
  { name: "All apps", url: "/welcome" },
  { name: "Users & roles", url: "/dashboard/users" },
  { name: "Audit log", url: "/dashboard/audit" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

/** "Larry" → "LA", "T. Kachale" → "TK" */
function initials(name: string) {
  const parts = name.split(/[\s.]+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const separator = (
  <div
    className="h-6 w-px bg-neutral-900/10 dark:bg-white/10 lg:hidden"
    aria-hidden="true"
  />
);

const Header = ({
  setSidebarOpen,
}: {
  setSidebarOpen: (open: boolean) => void;
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const search = useAppSelector(selectDocumentSearch);

  /** Search drives the Cabinet paper register (FR SCH), wherever it is typed. */
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(searchChanged({ ...search, query: e.target.value }));
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/dashboard/documents");
  };

  return (
    <div>
      {/* Stickiness is owned by MainLayout's wrapper, not this bar */}
      <div className="flex h-16 shrink-0 items-center gap-x-4 border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-950 sm:gap-x-6 sm:px-6 lg:px-8">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-neutral-700 dark:text-white lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
        >
          <span className="sr-only">Open sidebar</span>
          <HiMiniBars4 className="h-6 w-6" aria-hidden="true" />
        </button>

        {separator}

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <form
            onSubmit={handleSearchSubmit}
            className="m-auto hidden max-w-xs flex-1 sm:block"
          >
            <label htmlFor="search" className="sr-only">
              Search Cabinet papers
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <HiMagnifyingGlass
                  className="h-5 w-5 text-neutral-400"
                  aria-hidden="true"
                />
              </div>

              <input
                type="search"
                name="search"
                id="search"
                value={search.query ?? ""}
                onChange={handleSearchChange}
                className="block w-full rounded-lg border border-neutral-300 py-2 pl-10 focus:border-state-600 focus:ring-state-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 sm:text-sm"
                placeholder="Search papers"
              />
            </div>
          </form>

          <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
            <SiteIndicator />

            {separator}

            <FullScreen />

            {separator}

            <DarkModeToggle />

            {separator}

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <MenuButton className="-m-1.5 flex items-center p-1.5">
                <span className="sr-only">Open user menu</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-state-600">
                  <span className="text-xs font-bold text-white">
                    {initials(OPERATOR.name)}
                  </span>
                </span>
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-50 mt-2.5 w-60 origin-top-right overflow-hidden rounded-xl bg-white py-2 shadow-lg ring-1 ring-neutral-900/5 transition focus:outline-none data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-neutral-900 dark:ring-white/10"
              >
                <div className="-mt-2 mb-2 bg-neutral-100 px-5 py-3 dark:bg-neutral-800">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Signed in as
                  </p>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {OPERATOR.name}
                  </p>
                  <p className="text-xs font-normal text-neutral-700 dark:text-neutral-300">
                    {OPERATOR.email}
                  </p>
                </div>

                {userNavigation.map((item) => (
                  <MenuItem key={item.name}>
                    <Link
                      href={item.url}
                      className={classNames(
                        "block px-5 py-1.5 text-sm leading-6 text-neutral-900 data-focus:bg-neutral-50 dark:text-white dark:data-focus:bg-neutral-800",
                      )}
                    >
                      {item.name}
                    </Link>
                  </MenuItem>
                ))}

                {/* A form, not a click handler — the session cookie is httpOnly */}
                <MenuItem>
                  <form action={logoutAction} className="mt-1 border-t border-neutral-200 pt-1 dark:border-neutral-800">
                    <button
                      type="submit"
                      className="block w-full px-5 py-1.5 text-left text-sm leading-6 text-seal-500 data-focus:bg-neutral-50 dark:data-focus:bg-neutral-800"
                    >
                      Sign out
                    </button>
                  </form>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
