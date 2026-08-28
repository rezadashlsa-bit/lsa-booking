import type { EligibilityType, StudentType } from "@/lib/supabase/database.types";

export function isSlotEligibleForStudent(
  slot: { eligibility_type: EligibilityType; slot_instance_students?: { student_id: string }[] },
  student: { id: string; type: StudentType }
): boolean {
  switch (slot.eligibility_type) {
    case "open_all":
      return true;
    case "hp_only":
      return student.type === "hp";
    case "general_only":
      return student.type === "general";
    case "named_only":
      return !!slot.slot_instance_students?.some((s) => s.student_id === student.id);
    default:
      return false;
  }
}
