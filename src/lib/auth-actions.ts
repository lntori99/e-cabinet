"use server";

import { redirect } from "next/navigation";
import { destroySession } from "@/lib/auth";

/** Used by the console sidebar and header, so it lives outside the auth routes. */
export async function logoutAction() {
  await destroySession();
  redirect("/auth/login");
}
