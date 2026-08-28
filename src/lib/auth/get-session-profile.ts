import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface SessionProfile {
  userId: string;
  email: string;
  profile: Profile | null; // null means authenticated but no matching profile yet
}

// Central place every route-group layout calls to resolve "who is this and what
// role are they" server-side. Returns null if there's no authenticated session at all.
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { userId: user.id, email: user.email, profile: profile ?? null };
}
