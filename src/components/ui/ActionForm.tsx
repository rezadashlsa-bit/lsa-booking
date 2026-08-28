"use client";

import { useRef, useState, useTransition, type ReactNode, type FormEvent } from "react";
import { Button } from "./Button";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

// Generic wrapper for calling a Server Action from a form and surfacing its
// error, without needing a separate useActionState reducer per form.
export function ActionForm({
  action,
  onSuccess,
  children,
  submitLabel = "Save",
  className = "",
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  onSuccess?: () => void;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong");
        return;
      }
      formRef.current?.reset();
      onSuccess?.();
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={className}>
      {children}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <Button type="submit" disabled={pending} className="mt-3">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
