import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FiAlertCircle, FiKey, FiMonitor, FiShield } from "react-icons/fi";
import Logo from "@/common/logo";
import { createPendingSession, isAuthenticated, verifyCredentials } from "@/lib/auth";
import type { LoginRequest } from "@/models/request/auth-request";
import PasswordField from "./components/passwordField";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  credentials: "Sign-in failed. Check the credentials and try again.",
};

const inputCls =
  "block w-full overflow-hidden rounded-xl border border-gray-300 bg-gray-50 px-4 py-4 text-base font-normal text-gray-900 caret-gray-900 placeholder-gray-600 transition-all duration-200 focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-gray-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-neutral-100 dark:focus:bg-neutral-950";

const chipCls =
  "inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 dark:border-neutral-700 dark:text-neutral-300";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAuthenticated()) redirect("/welcome");

  const { error } = await searchParams;

  /** First factor. On success the operator is sent to the MFA step. */
  async function login(formData: FormData) {
    "use server";

    const request: LoginRequest = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      remember: formData.get("remember") === "on",
    };

    if (!verifyCredentials(request.email, request.password)) {
      redirect("/auth/login?error=credentials");
    }

    await createPendingSession(request.email);
    redirect("/auth/mfa");
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
              Welcome to e-Cabinet
            </h1>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className={chipCls}>
                <FiShield size={14} /> Restricted
              </span>
              <span className={chipCls}>
                <FiKey size={14} /> MFA required
              </span>
              <span className={chipCls}>
                <FiMonitor size={14} /> Managed devices
              </span>
            </div>
          </div>

          <form action={login} className="mt-10">
            <div className="space-y-3">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  autoComplete="username"
                  autoFocus
                  placeholder="Email address"
                  className={inputCls}
                />
              </div>

              <PasswordField className={inputCls} />
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
              Continue
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              href="/auth/forget-password"
              className="rounded text-base font-medium text-gray-500 hover:text-gray-900 hover:underline focus:outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Forgot password?
            </Link>
          </div>

          <div className="mt-4 text-center text-base text-gray-500 dark:text-neutral-400">
            Demo: secretariat@cabinet.gov.mw · eCabinet@2026
          </div>
        </div>
      </div>
    </section>
  );
}
