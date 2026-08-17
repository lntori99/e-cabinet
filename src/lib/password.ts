/**
 * Government password policy: length first, then variety.
 * Lives outside the server-action file because a `"use server"` module may
 * only export async functions.
 */
export function passwordProblem(password: string): string | null {
  if (password.length < 12) return "Use at least 12 characters.";
  if (!/[A-Z]/.test(password)) return "Include an upper-case letter.";
  if (!/[a-z]/.test(password)) return "Include a lower-case letter.";
  if (!/\d/.test(password)) return "Include a digit.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Include a symbol.";
  return null;
}
