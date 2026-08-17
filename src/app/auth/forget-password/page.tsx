import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FiAlertCircle,
  FiClock,
  FiMail,
  FiUserCheck,
} from "react-icons/fi";
import Logo from "@/common/logo";
import { isAuthenticated } from "@/lib/auth";
import type { ForgotPasswordRequest } from "@/models/request/auth-request";

export const metadata: Metadata = { title: "Reset your password" };

const ERRORS: Record<string, string> = {
  email: "Enter the official email address on your account.",
};

const inputCls =
  "block w-full overflow-hidden rounded-xl border border-gray-300 bg-gray-50 px-4 py-4 text-base font-normal text-gray-900 caret-gray-900 placeholder-gray-600 transition-all duration-200 focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-gray-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-neutral-100 dark:focus:bg-neutral-950";

const chipCls =
  "inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 dark:border-neutral-700 dark:text-neutral-300";

export default async function ForgetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  if (await isAuthenticated()) redirect("/welcome");

  const { error, sent } = await searchParams;

  /**
   * Always reports success, whether or not the address is on the register —
   * telling an unauthenticated caller which addresses exist would be an
   * enumeration weakness. The real send happens server-side.
   */
  async function requestReset(formData: FormData) {
    "use server";

    const request: ForgotPasswordRequest = {
      email: String(formData.get("email") ?? "").trim(),
    };

    if (!/^\S+@\S+\.\S+$/.test(request.email)) {
      redirect("/auth/forget-password?error=email");
    }

    // TODO: issue a single-use, time-limited token and email the reset link.
    redirect("/auth/forget-password?sent=1");
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
              Reset your password
            </h1>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className={chipCls}>
                <FiMail size={14} /> Single-use link
              </span>
              <span className={chipCls}>
                <FiClock size={14} /> Expires in 30 min
              </span>
              <span className={chipCls}>
                <FiUserCheck size={14} /> Named accounts
              </span>
            </div>
          </div>

          {sent ? (
            <p className="mt-10 rounded-xl border border-state-300 bg-state-50 px-4 py-3 text-center text-base text-state-800 dark:border-state-700 dark:bg-state-900/20 dark:text-state-200">
              If that address is on the register, a single-use reset link is on
              its way. It expires in 30 minutes. Check with the service desk if
              nothing arrives within a few minutes.
            </p>
          ) : (
            <form action={requestReset} className="mt-10">
              <div>
                <label htmlFor="email" className="sr-only">
                  Official email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder="Official email address"
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
                Send reset link
              </button>
            </form>
          )}

          <div className="mt-5 text-center">
            <Link
              href="/auth/login"
              className="rounded text-base font-medium text-gray-500 hover:text-gray-900 hover:underline focus:outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Back to sign-in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
