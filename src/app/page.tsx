import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

/** The platform has no public face — the root is just a door into the console. */
export default async function RootPage() {
  redirect((await isAuthenticated()) ? "/welcome" : "/auth/login");
}
