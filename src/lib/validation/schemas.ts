import { z } from "zod";

export const coachSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
});

export const familySchema = z.object({
  primary_parent_name: z.string().min(1, "Primary parent name is required"),
  primary_parent_email: z.string().email("Enter a valid email"),
  secondary_parent_name: z.string().optional(),
  secondary_parent_email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional(),
});

export const studentSchema = z.object({
  family_id: z.string().uuid("Select a family"),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["hp", "general"]),
  grade: z.string().optional(),
});

export const availabilityTemplateSchema = z.object({
  coach_id: z.string().uuid("Select a coach"),
  days_of_week: z.array(z.coerce.number().int().min(1).max(6)).min(1, "Pick at least one day"),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  eligibility_type: z.enum(["open_all", "hp_only", "general_only", "named_only"]),
  named_student_ids: z.array(z.string().uuid()).optional(),
  effective_from: z.string(),
  effective_until: z.string().optional().or(z.literal("")),
});

export const logMissedSessionSchema = z.object({
  booking_id: z.string().uuid(),
  notice_given: z.coerce.boolean(),
  reason: z.string().optional(),
});
