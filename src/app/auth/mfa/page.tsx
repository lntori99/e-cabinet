import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FiAlertCircle, FiClock, FiKey, FiSmartphone } from "react-icons/fi";
import Logo from "@/common/logo";
import {
  createSession,
  destroyPendingSession,
  getPendingEmail,
  isAuthenticated,
  maskEmail,
  verifyMfaCode,
} from "@/lib/auth";
import type { MfaRequest } from "@/models/request/auth-request";

export const metadata: Metadata = { title: "Verification" };

const ERRORS: Record<string, string> = {
  code: "Enter the 6-digit code from your security key or authenticator.",
};

const inputCls =
  "block w-full overflow-hidden rounded-xl border border-gray-300 bg-gray-50 px-4 py-4 text-center text-2xl font-bold tracking-[0.6em] text-gray-900 caret-gray-900 placeholder-gray-600 transition-all duration-200 focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-gray-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-neutral-100 dark:focus:bg-neutral-950";

const chipCls =
  "inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 dark:border-neutral-700 dark:text-neutral-300";

export default async function MfaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAuthenticated()) redirect("/welcome");

  // Reachable only with a password already verified.
  const email = await getPendingEmail();
  if (!email) redirect("/auth/login");

  const { error } = await searchParams;

  /** Second factor. Exchanges the pending cookie for a full session. */
  async function verify(formData: FormData) {
    "use server";

    if (!(await getPendingEmail())) redirect("/auth/login");

    const request: MfaRequest = { code: String(formData.get("code") ?? "") };

    if (!verifyMfaCode(request.code)) {
      redirect("/auth/mfa?error=code");
    }

    await destroyPendingSession();
    await createSession();
    redirect("/welcome");
  }

  /** Abandon the half-finished sign-in and start again. */
  async function cancel() {
    "use server";
    await destroyPendingSession();
    redirect("/auth/login");
  }

  return (
    // flex + items-center centres the whole card vertically in the viewport
    <section className="flex min-h-screen items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8 dark:bg-neutral-950">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center">
          <Logo href="/auth/login" />
        </div>

        <div className="mt-10 lg:px-12 xl:px-16">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl xl:text-5xl dark:text-neutral-50">
              Two-factor verification
            </h1>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className={chipCls}>
                <FiKey size={14} /> Security key
              </span>
              <span className={chipCls}>
                <FiSmartphone size={14} /> Authenticator
              </span>
              <span className={chipCls}>
                <FiClock size={14} /> Expires in 10 min
              </span>
            </div>

            <p className="mt-5 text-base text-gray-500 dark:text-neutral-400">
              Enter the 6-digit code for{" "}
              <span className="font-bold text-gray-900 dark:text-neutral-200">
                {maskEmail(email)}
              </span>
            </p>
          </div>

          <form action={verify} className="mt-10">
            <div>
              <label htmlFor="code" className="sr-only">
                Six-digit verification code
              </label>
              <input
                type="text"
                name="code"
                id="code"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                autoFocus
                autoComplete="one-time-code"
                placeholder="000000"
                className={inputCls}
              />
            </div>

            {error && ERRORS[error] && (
              <p
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-xl border border-seal-500/40 bg-seal-500/5 px-4 py-3 text-base text-seal-500"
              >
                <FiAlertCircle className="mt-1 shrink-0" size={16} />
                {ERRORS[error]}
              </p>
            )}

            <button
              type="submit"
              className="mt-8 flex w-full items-center justify-center rounded-xl border border-transparent bg-state-600 px-8 py-4 text-base font-bold text-white transition-all duration-200 hover:bg-state-700 focus:outline-none focus:ring-2 focus:ring-state-600 focus:ring-offset-2 dark:bg-state-500 dark:hover:bg-state-400 dark:focus:ring-state-500"
            >
              Verify and sign in
            </button>
          </form>

          <form action={cancel} className="mt-5 text-center">
            <button
              type="submit"
              className="rounded text-base font-medium text-gray-500 hover:text-gray-900 hover:underline focus:outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Wrong account? Start again
            </button>
          </form>

          <div className="mt-4 text-center text-base text-gray-500 dark:text-neutral-400">
            Demo: any 6-digit code
          </div>
        </div>
      </div>
    </section>
  );
}
