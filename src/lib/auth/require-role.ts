import { redirect } from "next/navigation";
import { getSessionProfile, type SessionProfile } from "./get-session-profile";
import type { UserRole } from "@/lib/supabase/database.types";

const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  coach: "/coach",
  parent: "/parent",
};

/**
 * Guards a role-scoped route group. Redirects to /login if unauthenticated,
 * /pending-approval if authenticated but unmatched, or the correct role's
 * home if the profile's role doesn't match this group.
 */
export async function requireRole(
  allowed: UserRole
): Promise<SessionProfile & { profile: NonNullable<SessionProfile["profile"]> }> {
  const session = await getSessionProfile();

  if (!session) {
    redirect("/login");
  }
  if (!session.profile) {
    redirect("/pending-approval");
  }
  if (session.profile.role !== allowed) {
    redirect(ROLE_HOME[session.profile.role]);
  }

  return session as SessionProfile & { profile: NonNullable<SessionProfile["profile"]> };
}
