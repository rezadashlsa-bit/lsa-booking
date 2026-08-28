import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { jakartaLocalToUtc, LSA_TIMEZONE } from "@/lib/time/timezone";
import { toZonedTime } from "date-fns-tz";
import { addWeeks, format } from "date-fns";

const DEFAULT_HORIZON_WEEKS = 8;

/**
 * Materializes concrete `slot_instances` rows from active `availability_templates`
 * for the next `horizonWeeks`. Idempotent: relies on the (coach_id, starts_at)
 * unique constraint and ignores conflicts, so re-running (e.g. daily cron, or
 * right after creating/editing a template) is always safe.
 *
 * Pass `templateId` to regenerate for just one newly-created/edited template
 * (used by the admin/coach "create availability" action so slots appear
 * immediately); omit it to regenerate for every active template (used by the
 * scheduled job).
 */
export async function generateSlotInstances(
  supabase: SupabaseClient<Database>,
  options: { templateId?: string; horizonWeeks?: number } = {}
): Promise<{ created: number; errors: string[] }> {
  const horizonWeeks = options.horizonWeeks ?? DEFAULT_HORIZON_WEEKS;

  let query = supabase.from("availability_templates").select("*").eq("active", true);
  if (options.templateId) {
    query = query.eq("id", options.templateId);
  }
  const { data: templates, error: templatesError } = await query;
  if (templatesError) {
    return { created: 0, errors: [templatesError.message] };
  }

  const today = toZonedTime(new Date(), LSA_TIMEZONE);
  const horizonEnd = addWeeks(today, horizonWeeks);

  const rowsToInsert: Database["public"]["Tables"]["slot_instances"]["Insert"][] = [];

  for (const template of templates ?? []) {
    const effectiveFrom = new Date(template.effective_from + "T00:00:00");
    const effectiveUntil = template.effective_until
      ? new Date(template.effective_until + "T23:59:59")
      : null;

    const rangeStart = effectiveFrom > today ? effectiveFrom : today;
    const rangeEnd = effectiveUntil && effectiveUntil < horizonEnd ? effectiveUntil : horizonEnd;

    for (let cursor = new Date(rangeStart); cursor <= rangeEnd; cursor.setDate(cursor.getDate() + 1)) {
      if (cursor.getDay() !== template.day_of_week) continue;

      const dateISO = format(cursor, "yyyy-MM-dd");
      const startsAt = jakartaLocalToUtc(dateISO, template.start_time_local.slice(0, 5));
      const endsAt = jakartaLocalToUtc(dateISO, template.end_time_local.slice(0, 5));

      rowsToInsert.push({
        template_id: template.id,
        coach_id: template.coach_id,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        eligibility_type: template.eligibility_type,
        status: "open",
        is_override: false,
      });
    }
  }

  if (rowsToInsert.length === 0) {
    return { created: 0, errors: [] };
  }

  const { error: insertError, data: inserted } = await supabase
    .from("slot_instances")
    .upsert(rowsToInsert, { onConflict: "coach_id,starts_at", ignoreDuplicates: true })
    .select("id");

  if (insertError) {
    return { created: 0, errors: [insertError.message] };
  }

  return { created: inserted?.length ?? 0, errors: [] };
}
