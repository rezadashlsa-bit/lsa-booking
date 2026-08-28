"use server";

import { createClient } from "@/lib/supabase/server";
import { availabilityTemplateSchema } from "@/lib/validation/schemas";
import { validateTemplateWindow } from "@/lib/time/operating-hours";
import { generateSlotInstances } from "@/lib/availability/generate-instances";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./admin-actions";
import type { EligibilityType } from "@/lib/supabase/database.types";

export async function createAvailabilityTemplate(formData: FormData): Promise<ActionResult> {
  const daysRaw = formData.getAll("days_of_week");
  const namedRaw = formData.getAll("named_student_ids");

  const parsed = availabilityTemplateSchema.safeParse({
    coach_id: formData.get("coach_id"),
    days_of_week: daysRaw,
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    eligibility_type: formData.get("eligibility_type"),
    named_student_ids: namedRaw,
    effective_from: formData.get("effective_from"),
    effective_until: formData.get("effective_until") || "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const data = parsed.data;

  for (const day of data.days_of_week) {
    const check = validateTemplateWindow(day, data.start_time, data.end_time);
    if (!check.valid) {
      return { ok: false, error: check.error };
    }
  }
  if (data.eligibility_type === "named_only" && (!data.named_student_ids || data.named_student_ids.length === 0)) {
    return { ok: false, error: "Select at least one student for a named-only slot." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insertedTemplateIds: string[] = [];

  for (const day of data.days_of_week) {
    const { data: template, error } = await supabase
      .from("availability_templates")
      .insert({
        coach_id: data.coach_id,
        day_of_week: day,
        start_time_local: data.start_time,
        end_time_local: data.end_time,
        eligibility_type: data.eligibility_type,
        effective_from: data.effective_from,
        effective_until: data.effective_until || null,
        created_by: user?.id,
      })
      .select("id")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }
    insertedTemplateIds.push(template.id);

    if (data.eligibility_type === "named_only" && data.named_student_ids?.length) {
      const { error: linkError } = await supabase.from("availability_template_students").insert(
        data.named_student_ids.map((studentId) => ({
          template_id: template.id,
          student_id: studentId,
        }))
      );
      if (linkError) {
        return { ok: false, error: linkError.message };
      }
    }
  }

  // Materialize instances immediately so the coach/admin sees slots right away.
  for (const templateId of insertedTemplateIds) {
    const { errors } = await generateSlotInstances(supabase, { templateId });
    if (errors.length) {
      return { ok: false, error: errors[0] };
    }
  }

  revalidatePath("/admin/availability");
  revalidatePath("/coach/availability");
  return { ok: true };
}

export async function deactivateTemplate(templateId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("availability_templates")
    .update({ active: false })
    .eq("id", templateId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/availability");
  revalidatePath("/coach/availability");
  return { ok: true };
}

export async function updateSlotInstanceEligibility(
  slotInstanceId: string,
  eligibilityType: EligibilityType,
  namedStudentIds: string[] = []
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("slot_instances")
    .update({ eligibility_type: eligibilityType, is_override: true })
    .eq("id", slotInstanceId);
  if (error) return { ok: false, error: error.message };

  await supabase.from("slot_instance_students").delete().eq("slot_instance_id", slotInstanceId);
  if (eligibilityType === "named_only" && namedStudentIds.length > 0) {
    const { error: linkError } = await supabase.from("slot_instance_students").insert(
      namedStudentIds.map((studentId) => ({ slot_instance_id: slotInstanceId, student_id: studentId }))
    );
    if (linkError) return { ok: false, error: linkError.message };
  }

  revalidatePath("/admin/availability");
  revalidatePath("/coach/availability");
  return { ok: true };
}

export async function blockSlotInstance(slotInstanceId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("slot_instances")
    .update({ status: "blocked" })
    .eq("id", slotInstanceId)
    .eq("status", "open");
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/availability");
  revalidatePath("/coach/availability");
  return { ok: true };
}

export async function reopenSlotInstance(slotInstanceId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("slot_instances")
    .update({ status: "open" })
    .eq("id", slotInstanceId)
    .eq("status", "blocked");
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/availability");
  revalidatePath("/coach/availability");
  return { ok: true };
}
