import { Card, Badge } from "@/components/ui/Card";
import { formatJakartaDateLong, formatJakartaTime } from "@/lib/time/timezone";
import { SlotEligibilityEditor } from "./SlotEligibilityEditor";
import {
  updateSlotInstanceEligibility,
  blockSlotInstance,
  reopenSlotInstance,
} from "@/lib/actions/availability-actions";
import { BlockReopenButton } from "./BlockReopenButton";
import type { EligibilityType, SlotStatus } from "@/lib/supabase/database.types";

const ELIGIBILITY_LABELS: Record<EligibilityType, string> = {
  open_all: "Open to all",
  hp_only: "HP only",
  general_only: "General only",
  named_only: "Named students",
};

const STATUS_TONE: Record<SlotStatus, "green" | "neutral" | "amber" | "red"> = {
  open: "green",
  booked: "neutral",
  cancelled: "red",
  blocked: "amber",
};

export interface SlotRow {
  id: string;
  starts_at: string;
  ends_at: string;
  eligibility_type: EligibilityType;
  status: SlotStatus;
  coach_id: string;
  coaches?: { name: string } | null;
  slot_instance_students?: { student_id: string }[];
}

export function SlotList({
  slots,
  students,
  showCoachName = false,
}: {
  slots: SlotRow[];
  students: { id: string; name: string; type: string }[];
  showCoachName?: boolean;
}) {
  if (slots.length === 0) {
    return <p className="text-sm text-gray-500">No upcoming slots yet.</p>;
  }

  const grouped = new Map<string, SlotRow[]>();
  for (const slot of slots) {
    const day = formatJakartaDateLong(slot.starts_at);
    grouped.set(day, [...(grouped.get(day) ?? []), slot]);
  }

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([day, daySlots]) => (
        <div key={day}>
          <p className="text-sm font-medium text-gray-600 mb-2">{day}</p>
          <div className="space-y-2">
            {daySlots.map((slot) => (
              <Card key={slot.id} className="!p-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {formatJakartaTime(slot.starts_at)} – {formatJakartaTime(slot.ends_at)}
                      {showCoachName && slot.coaches && (
                        <span className="text-gray-500 font-normal"> · {slot.coaches.name}</span>
                      )}
                    </p>
                    <div className="flex gap-1.5 mt-1">
                      <Badge tone={STATUS_TONE[slot.status]}>{slot.status}</Badge>
                      <Badge>{ELIGIBILITY_LABELS[slot.eligibility_type]}</Badge>
                    </div>
                  </div>
                  {(slot.status === "open" || slot.status === "blocked") && (
                    <div className="flex gap-2">
                      <BlockReopenButton
                        slotInstanceId={slot.id}
                        status={slot.status}
                        onBlock={blockSlotInstance}
                        onReopen={reopenSlotInstance}
                      />
                    </div>
                  )}
                </div>
                {slot.status === "open" && (
                  <SlotEligibilityEditor
                    slotInstanceId={slot.id}
                    currentEligibility={slot.eligibility_type}
                    currentNamedStudentIds={
                      slot.slot_instance_students?.map((s) => s.student_id) ?? []
                    }
                    students={students}
                    onSave={updateSlotInstanceEligibility}
                  />
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
