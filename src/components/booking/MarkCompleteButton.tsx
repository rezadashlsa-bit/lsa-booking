"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { markBookingComplete } from "@/lib/actions/missed-session-actions";

export function MarkCompleteButton({ bookingId }: { bookingId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <Button
        variant="secondary"
        className="!px-3 !py-1 text-xs"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await markBookingComplete(bookingId);
            if (!result.ok) setError(result.error ?? "Failed");
          })
        }
      >
        {pending ? "…" : "Mark complete"}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
