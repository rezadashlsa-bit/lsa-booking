"use client";

import { useMemo, useState } from "react";
import { Select, Label } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { SlotPicker } from "./SlotPicker";
import { isSlotEligibleForStudent } from "@/lib/availability/eligibility";
import { formatJakarta } from "@/lib/time/timezone";
import type { ActionResult } from "@/lib/actions/admin-actions";
import type { EligibleSlot } from "./BookingFlow";

export interface EligibleMissedSession {
  id: string;
  occurred_at: string;
  student_id: string;
  students: { id: string; name: string; type: "hp" | "general" } | null;
}

export function MakeupFlow({
  missedSessions,
  slots,
  onBook,
}: {
  missedSessions: EligibleMissedSession[];
  slots: EligibleSlot[];
  onBook: (missedSessionId: string, studentId: string, slotInstanceId: string) => Promise<ActionResult>;
}) {
  const [missedId, setMissedId] = useState(missedSessions[0]?.id ?? "");

  const selected = missedSessions.find((m) => m.id === missedId);

  const eligibleSlots = useMemo(() => {
    if (!selected?.students) return [];
    return slots.filter((slot) => isSlotEligibleForStudent(slot, selected.students!));
  }, [slots, selected]);

  if (missedSessions.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-500">
          No missed sessions are currently eligible for a makeup booking. Excused (advance-notice)
          absences will show up here once logged by a coach.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <Label htmlFor="missed">Missed session</Label>
        <Select id="missed" value={missedId} onChange={(e) => setMissedId(e.target.value)}>
          {missedSessions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.students?.name} — {formatJakarta(m.occurred_at)}
            </option>
          ))}
        </Select>
      </div>
      {selected && (
        <SlotPicker
          slots={eligibleSlots}
          onBook={(slotId) => onBook(selected.id, selected.student_id, slotId)}
          emptyMessage="No eligible replacement slots open right now — check back soon."
        />
      )}
    </div>
  );
}
