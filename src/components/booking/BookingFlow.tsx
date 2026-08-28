"use client";

import { useMemo, useState } from "react";
import { Select, Label } from "@/components/ui/Field";
import { SlotPicker, type BookableSlot } from "./SlotPicker";
import { isSlotEligibleForStudent } from "@/lib/availability/eligibility";
import type { ActionResult } from "@/lib/actions/admin-actions";
import type { EligibilityType, StudentType } from "@/lib/supabase/database.types";

export interface EligibleSlot extends BookableSlot {
  eligibility_type: EligibilityType;
  slot_instance_students?: { student_id: string }[];
}

export function BookingFlow({
  students,
  slots,
  onBook,
}: {
  students: { id: string; name: string; type: StudentType }[];
  slots: EligibleSlot[];
  onBook: (studentId: string, slotInstanceId: string) => Promise<ActionResult>;
}) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");

  const eligibleSlots = useMemo(() => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return [];
    return slots.filter((slot) => isSlotEligibleForStudent(slot, student));
  }, [slots, students, studentId]);

  if (students.length === 0) {
    return <p className="text-sm text-gray-500">No eligible students on your account.</p>;
  }

  return (
    <div className="space-y-4">
      {students.length > 1 && (
        <div className="max-w-xs">
          <Label htmlFor="student">Student</Label>
          <Select id="student" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      )}
      <SlotPicker slots={eligibleSlots} onBook={(slotId) => onBook(studentId, slotId)} />
    </div>
  );
}
