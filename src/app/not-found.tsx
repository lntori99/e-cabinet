import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="stamp text-seal-500">File not on register</span>
      <h1 className="mt-6 text-6xl font-bold tracking-tight">404</h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-neutral-600 dark:text-neutral-400">
        The page you requested is not held in this registry. It may have been
        moved, withdrawn, or never gazetted.
      </p>
      <Link
        href="/welcome"
        className="mt-8 inline-flex items-center rounded bg-state-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-state-700"
      >
        Return to the console
      </Link>
    </main>
  );
}
