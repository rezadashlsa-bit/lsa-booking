import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Service-role client. Bypasses RLS entirely — never import this into anything
// that runs in the browser, and never use it to serve a client's own request;
// it's only for the scheduled slot-generation job and other trusted server-only
// background work.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        // See server.ts: Next.js caches fetch() by default, which would
        // otherwise let stale query results linger across requests.
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}
