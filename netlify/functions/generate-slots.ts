import type { Config } from "@netlify/functions";
import { createAdminClient } from "../../src/lib/supabase/admin";
import { generateSlotInstances } from "../../src/lib/availability/generate-instances";

// Netlify Scheduled Function: keeps `slot_instances` materialized ~8 weeks
// ahead of every active `availability_templates` row. Runs daily; safe to
// re-run (upsert with ignoreDuplicates on the coach_id+starts_at unique key).
async function handler() {
  const supabase = createAdminClient();
  const result = await generateSlotInstances(supabase);

  if (result.errors.length > 0) {
    console.error("generate-slots errors:", result.errors);
  }
  console.log(`generate-slots: created ${result.created} new slot instance(s).`);

  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
}

export default handler;

// 17:00 UTC = 00:00 Asia/Jakarta (Indonesia has no DST).
export const config: Config = {
  schedule: "0 17 * * *",
};
