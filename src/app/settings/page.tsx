import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LauncherHeader from "@/common/launcherHeader";
import { isAuthenticated } from "@/lib/auth";
import { passwordProblem } from "@/lib/password";
import AboutPanel from "./components/aboutPanel";
import AppearancePanel from "./components/appearancePanel";
import NotificationsPanel from "./components/notificationsPanel";
import ProfilePanel from "./components/profilePanel";
import SecurityPanel from "./components/securityPanel";
import SessionsPanel from "./components/sessionsPanel";
import RegionalPanel from "./components/regionalPanel";
import SettingsNav, { SECTIONS, isSection } from "./components/settingsNav";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; error?: string; changed?: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/auth/login");

  const params = await searchParams;
  const section = isSection(params.section ?? "") ? params.section! : "profile";
  const active = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];

  // Resolved on the server so session expiry does not turn on the viewer's clock.
  const now = new Date().toISOString().slice(0, 16);

  /**
   * The local credential, changed in place. Errors come back on the URL rather
   * than in client state so the reader lands in the same panel they submitted
   * from, and a refresh cannot resubmit the form.
   */
  async function changePassword(formData: FormData) {
    "use server";

    const current = String(formData.get("current") ?? "");
    const next = String(formData.get("next") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    const back = "/settings?section=security";

    const fail = (message: string) =>
      redirect(`${back}&error=${encodeURIComponent(message)}`);

    if (!current) fail("Enter your current password.");

    const problem = passwordProblem(next);
    if (problem) fail(problem);

    if (next !== confirm) fail("The two new passwords do not match.");
    if (next === current) fail("The new password must differ from the current one.");

    // TODO: verify the current credential, write the new one, and revoke every
    // other session the account holds (FR-IAM-14).
    redirect(`${back}&changed=1`);
  }

  return (
    <section className="min-h-screen bg-white dark:bg-neutral-950">
      <LauncherHeader current="settings" />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Your account
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Settings
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            Your own account, factors and console preferences. Anything the
            Government directory owns, or that exists for oversight, is shown here
            but changed in Identity and Access.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SettingsNav current={active.id} />
          </div>

          <div className="min-w-0 space-y-6">
            <div className="lg:hidden">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {active.label}
              </h2>
            </div>

            {section === "profile" && <ProfilePanel />}
            {section === "security" && (
              <SecurityPanel
                changePassword={changePassword}
                error={params.error}
                changed={params.changed === "1"}
              />
            )}
            {section === "sessions" && <SessionsPanel now={now} />}
            {section === "notifications" && <NotificationsPanel />}
            {section === "appearance" && <AppearancePanel />}
            {section === "regional" && <RegionalPanel />}
            {section === "about" && <AboutPanel now={now} />}
          </div>
        </div>
      </div>
    </section>
  );
}
