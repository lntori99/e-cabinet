import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LauncherHeader from "@/common/launcherHeader";
import { OPERATOR, SITE } from "@/core/app-constants";
import { CABINET_APPS } from "@/data/apps";
import { isAuthenticated } from "@/lib/auth";
import AppTile from "./components/appTile";

export const metadata: Metadata = { title: "Welcome" };

export default async function WelcomePage() {
  // The landing screen after sign-in, so it carries the same guard as the console.
  if (!(await isAuthenticated())) redirect("/auth/login");

  const available = CABINET_APPS.filter((a) => a.href).length;

  return (
    <section className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Outside the padded container so the bar spans the full width when it
          sticks; the inner container keeps it aligned with the tiles below. */}
      <LauncherHeader current="welcome" />

      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mt-12 text-center sm:mt-16">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl xl:text-5xl dark:text-neutral-50">
            Welcome, {OPERATOR.name}
          </h1>
          <p className="mt-4 text-base text-gray-500 dark:text-neutral-400">
            {OPERATOR.role} · {SITE.productionSite} production. Choose a
            functional area to continue.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CABINET_APPS.map((app) => (
            <AppTile key={app.code} app={app} />
          ))}
        </div>

        <p className="mt-10 text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-gray-400 dark:text-neutral-500">
          {available} of {CABINET_APPS.length} functional areas available in this
          build
          <span className="mt-1 block">{SITE.owner}</span>
        </p>
      </div>
    </section>
  );
}
