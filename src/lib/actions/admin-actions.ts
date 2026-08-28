"use server";

import { createClient } from "@/lib/supabase/server";
import { coachSchema, familySchema, studentSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function createCoach(formData: FormData): Promise<ActionResult> {
  const parsed = coachSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("coaches").insert(parsed.data);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/coaches");
  return { ok: true };
}

export async function setCoachActive(coachId: string, active: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("coaches").update({ active }).eq("id", coachId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/coaches");
  return { ok: true };
}

export async function createFamily(formData: FormData): Promise<ActionResult> {
  const parsed = familySchema.safeParse({
    primary_parent_name: formData.get("primary_parent_name"),
    primary_parent_email: formData.get("primary_parent_email"),
    secondary_parent_name: formData.get("secondary_parent_name") || undefined,
    secondary_parent_email: formData.get("secondary_parent_email") || "",
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { secondary_parent_email, ...rest } = parsed.data;
  const { error } = await supabase.from("families").insert({
    ...rest,
    secondary_parent_email: secondary_parent_email || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/families");
  return { ok: true };
}

export async function createStudent(formData: FormData): Promise<ActionResult> {
  const parsed = studentSchema.safeParse({
    family_id: formData.get("family_id"),
    name: formData.get("name"),
    type: formData.get("type"),
    grade: formData.get("grade") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("students").insert(parsed.data);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/students");
  return { ok: true };
}

export async function setStudentActive(studentId: string, active: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("students").update({ active }).eq("id", studentId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/students");
  return { ok: true };
}
