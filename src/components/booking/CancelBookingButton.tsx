"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { cancelBooking } from "@/lib/actions/booking-actions";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="text-right">
      <Button
        variant="danger"
        className="!px-3 !py-1 text-xs"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await cancelBooking(bookingId);
            if (!result.ok) setError(result.error ?? "Could not cancel");
          })
        }
      >
        {pending ? "Cancelling…" : "Cancel"}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
