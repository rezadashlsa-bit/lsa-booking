"use client";

import { useTransition } from "react";
import { Button } from "./Button";

export function ToggleActiveButton({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: (nextActive: boolean) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      disabled={pending}
      className="!px-3 !py-1 text-xs"
      onClick={() =>
        startTransition(async () => {
          await onToggle(!active);
        })
      }
    >
      {pending ? "…" : active ? "Deactivate" : "Reactivate"}
    </Button>
  );
}
