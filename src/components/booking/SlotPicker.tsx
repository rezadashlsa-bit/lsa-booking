"use client";

import { useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatJakartaDateLong, formatJakartaTime } from "@/lib/time/timezone";
import type { ActionResult } from "@/lib/actions/admin-actions";

export interface BookableSlot {
  id: string;
  starts_at: string;
  ends_at: string;
  coaches?: { name: string } | null;
}

export function SlotPicker({
  slots,
  onBook,
  emptyMessage = "No open slots right now — check back soon.",
}: {
  slots: BookableSlot[];
  onBook: (slotInstanceId: string) => Promise<ActionResult>;
  emptyMessage?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const map = new Map<string, BookableSlot[]>();
    for (const slot of slots) {
      const day = formatJakartaDateLong(slot.starts_at);
      map.set(day, [...(map.get(day) ?? []), slot]);
    }
    return map;
  }, [slots]);

  if (done) {
    return (
      <Card className="text-center">
        <p className="text-lsa-green-deep font-medium">Booking confirmed!</p>
        <p className="text-sm text-gray-500 mt-1">A confirmation email is on its way.</p>
      </Card>
    );
  }

  if (slots.length === 0) {
    return <p className="text-sm text-gray-500">{emptyMessage}</p>;
  }

  const selectedSlot = slots.find((s) => s.id === selected);

  return (
    <div className="space-y-4 pb-20">
      {Array.from(grouped.entries()).map(([day, daySlots]) => (
        <div key={day}>
          <p className="text-sm font-medium text-gray-600 mb-2">{day}</p>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => {
                  setError(null);
                  setSelected(slot.id);
                }}
                className={`rounded-md border px-3 py-2 text-sm text-left transition-colors ${
                  selected === slot.id
                    ? "border-lsa-green-deep bg-lsa-green-deep text-white"
                    : "border-lsa-border bg-white hover:border-lsa-green-sage"
                }`}
              >
                <div className="font-medium">
                  {formatJakartaTime(slot.starts_at)} – {formatJakartaTime(slot.ends_at)}
                </div>
                {slot.coaches && <div className="text-xs opacity-80">{slot.coaches.name}</div>}
              </button>
            ))}
          </div>
        </div>
      ))}

      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-lsa-border bg-white p-4 flex items-center justify-between gap-4 shadow-lg">
          <div className="text-sm">
            <p className="font-medium">
              {formatJakartaDateLong(selectedSlot.starts_at)}, {formatJakartaTime(selectedSlot.starts_at)}
            </p>
            {error && <p className="text-red-600 text-xs mt-0.5">{error}</p>}
          </div>
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await onBook(selectedSlot.id);
                if (!result.ok) {
                  setError(result.error ?? "Could not book this slot");
                  return;
                }
                setDone(true);
              })
            }
          >
            {pending ? "Booking…" : "Confirm booking"}
          </Button>
        </div>
      )}
    </div>
  );
}
