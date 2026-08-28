"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { logMissedSession } from "@/lib/actions/missed-session-actions";

export function LogMissedSessionForm({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false);
  const [noticeGiven, setNoticeGiven] = useState(true);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button variant="danger" className="!px-3 !py-1 text-xs" onClick={() => setOpen(true)}>
        Log missed
      </Button>
    );
  }

  return (
    <div className="mt-2 w-full rounded-md border border-lsa-border bg-lsa-sand/20 p-3 space-y-2">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={noticeGiven}
          onChange={(e) => setNoticeGiven(e.target.checked)}
        />
        Advance notice given (excused — generates a makeup opportunity)
      </label>
      <textarea
        className="w-full rounded-md border border-lsa-border px-3 py-2 text-sm"
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="danger"
          disabled={pending}
          className="!px-3 !py-1 text-xs"
          onClick={() =>
            startTransition(async () => {
              const result = await logMissedSession(bookingId, noticeGiven, reason || undefined);
              if (!result.ok) {
                setError(result.error ?? "Failed to log");
                return;
              }
              setOpen(false);
            })
          }
        >
          {pending ? "Logging…" : "Confirm missed"}
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
