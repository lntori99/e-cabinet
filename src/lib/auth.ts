import { cookies } from "next/headers";

export const COOKIE = process.env.AUTH_COOKIE_NAME ?? "ecab_session";
/** Set after password verification, exchanged for a full session by MFA. */
export const PENDING_COOKIE = `${COOKIE}_pending`;

function secret(): string {
  return process.env.AUTH_SECRET ?? "dev-secret";
}

/** Demo session token — replace with signed JWT / IdP integration in production. */
function expectedToken(): string {
  return Buffer.from(`secretariat:${secret()}`).toString("base64url");
}

function pendingToken(email: string): string {
  return Buffer.from(`pending:${email.trim().toLowerCase()}:${secret()}`).toString(
    "base64url",
  );
}

/* ------------------------------ Full session ------------------------------ */

export async function createSession() {
  const store = await cookies();
  store.set(COOKIE, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hour working session
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
  store.delete(PENDING_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE)?.value === expectedToken();
}

/* ---------------------------- Pending MFA step ---------------------------- */

export async function createPendingSession(email: string) {
  const store = await cookies();
  store.set(PENDING_COOKIE, pendingToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10, // the code must be entered within ten minutes
  });
}

export async function destroyPendingSession() {
  const store = await cookies();
  store.delete(PENDING_COOKIE);
}

/**
 * The account half-way through sign-in, or null. The email is not stored in the
 * cookie in readable form, so it is recovered by matching against the known
 * account — enough for the demo, and it means a tampered cookie resolves to null.
 */
export async function getPendingEmail(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(PENDING_COOKIE)?.value;
  if (!value) return null;
  const email = adminEmail();
  return value === pendingToken(email) ? email : null;
}

/* ------------------------------ Credentials ------------------------------ */

function adminEmail(): string {
  return process.env.ADMIN_EMAIL ?? "secretariat@cabinet.gov.mw";
}

export function verifyCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === adminEmail().toLowerCase() &&
    password === (process.env.ADMIN_PASSWORD ?? "eCabinet@2026")
  );
}

/** Demo MFA: any 6-digit code passes. Replace with FIDO2/TOTP verification. */
export function verifyMfaCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

/** Masks an address for display on the MFA screen. */
export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const head = name.slice(0, 2);
  return `${head}${"•".repeat(Math.max(3, name.length - 2))}@${domain}`;
}
