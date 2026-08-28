"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import type { EligibilityType } from "@/lib/supabase/database.types";

const ELIGIBILITY_LABELS: Record<EligibilityType, string> = {
  open_all: "Open to all",
  hp_only: "HP students only",
  general_only: "General students only",
  named_only: "Named students only",
};

export function SlotEligibilityEditor({
  slotInstanceId,
  currentEligibility,
  currentNamedStudentIds,
  students,
  onSave,
}: {
  slotInstanceId: string;
  currentEligibility: EligibilityType;
  currentNamedStudentIds: string[];
  students: { id: string; name: string; type: string }[];
  onSave: (
    slotInstanceId: string,
    eligibility: EligibilityType,
    namedStudentIds: string[]
  ) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityType>(currentEligibility);
  const [named, setNamed] = useState<string[]>(currentNamedStudentIds);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => setOpen(true)}>
        Edit
      </Button>
    );
  }

  return (
    <div className="mt-2 rounded-md border border-lsa-border bg-lsa-sand/20 p-3 space-y-2">
      <Select
        value={eligibility}
        onChange={(e) => setEligibility(e.target.value as EligibilityType)}
      >
        {Object.entries(ELIGIBILITY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      {eligibility === "named_only" && (
        <div className="max-h-32 overflow-y-auto space-y-1 border border-lsa-border rounded-md p-2 bg-white">
          {students.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={named.includes(s.id)}
                onChange={(e) =>
                  setNamed((prev) =>
                    e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                  )
                }
              />
              {s.name} ({s.type === "hp" ? "HP" : "General"})
            </label>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="button"
          disabled={pending}
          className="!px-3 !py-1 text-xs"
          onClick={() =>
            startTransition(async () => {
              const result = await onSave(slotInstanceId, eligibility, named);
              if (!result.ok) {
                setError(result.error ?? "Failed to save");
                return;
              }
              setOpen(false);
            })
          }
        >
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="!px-3 !py-1 text-xs"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
