"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ui/ActionForm";
import { Input, Label, Select } from "@/components/ui/Field";
import { createAvailabilityTemplate } from "@/lib/actions/availability-actions";
import type { EligibilityType } from "@/lib/supabase/database.types";

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export function TemplateForm({
  coaches,
  students,
  fixedCoachId,
}: {
  coaches: { id: string; name: string }[];
  students: { id: string; name: string; type: string }[];
  fixedCoachId?: string;
}) {
  const [eligibility, setEligibility] = useState<EligibilityType>("open_all");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <ActionForm action={createAvailabilityTemplate} submitLabel="Create recurring availability">
      <div className="grid sm:grid-cols-2 gap-3">
        {!fixedCoachId && (
          <div>
            <Label htmlFor="coach_id">Coach</Label>
            <Select id="coach_id" name="coach_id" required defaultValue="">
              <option value="" disabled>
                Select coach
              </option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        )}
        {fixedCoachId && <input type="hidden" name="coach_id" value={fixedCoachId} />}

        <div>
          <Label>Eligibility</Label>
          <Select
            name="eligibility_type"
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value as EligibilityType)}
          >
            <option value="open_all">Open to all</option>
            <option value="hp_only">HP students only</option>
            <option value="general_only">General students only</option>
            <option value="named_only">Named students only</option>
          </Select>
        </div>

        <div className="sm:col-span-2">
          <Label>Days (Mon–Sat)</Label>
          <div className="flex gap-3 flex-wrap">
            {DAYS.map((d) => (
              <label key={d.value} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" name="days_of_week" value={d.value} />
                {d.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="start_time">Start time (6:00–20:00)</Label>
          <Input id="start_time" name="start_time" type="time" min="06:00" max="20:00" required />
        </div>
        <div>
          <Label htmlFor="end_time">End time</Label>
          <Input id="end_time" name="end_time" type="time" min="06:00" max="20:00" required />
        </div>

        <div>
          <Label htmlFor="effective_from">Starting</Label>
          <Input id="effective_from" name="effective_from" type="date" defaultValue={today} required />
        </div>
        <div>
          <Label htmlFor="effective_until">Ending (optional, ongoing if blank)</Label>
          <Input id="effective_until" name="effective_until" type="date" />
        </div>

        {eligibility === "named_only" && (
          <div className="sm:col-span-2">
            <Label>Named students</Label>
            <div className="max-h-40 overflow-y-auto space-y-1 border border-lsa-border rounded-md p-2">
              {students.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="named_student_ids" value={s.id} />
                  {s.name} ({s.type === "hp" ? "HP" : "General"})
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </ActionForm>
  );
}
