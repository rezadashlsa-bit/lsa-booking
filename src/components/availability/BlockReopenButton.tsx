"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import type { ActionResult } from "@/lib/actions/admin-actions";
import type { SlotStatus } from "@/lib/supabase/database.types";

export function BlockReopenButton({
  slotInstanceId,
  status,
  onBlock,
  onReopen,
}: {
  slotInstanceId: string;
  status: SlotStatus;
  onBlock: (id: string) => Promise<ActionResult>;
  onReopen: (id: string) => Promise<ActionResult>;
}) {
  const [pending, startTransition] = useTransition();
  const isBlocked = status === "blocked";

  return (
    <Button
      type="button"
      variant="secondary"
      className="!px-3 !py-1 text-xs"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await (isBlocked ? onReopen(slotInstanceId) : onBlock(slotInstanceId));
        })
      }
    >
      {pending ? "…" : isBlocked ? "Reopen" : "Block"}
    </Button>
  );
}
