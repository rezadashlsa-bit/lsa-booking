import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

// Server client for use in Server Components, Server Actions, and Route Handlers.
// Uses the anon key + the caller's own auth cookies, so RLS applies normally.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component (not an Action/Route Handler) where
            // cookies can't be set — safe to ignore as long as middleware.ts is
            // refreshing the session cookie on every request.
          }
        },
      },
    }
  );
}
