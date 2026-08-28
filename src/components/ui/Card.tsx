import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-lsa-border bg-white p-5 shadow-[0_1px_2px_rgba(1,1,1,0.04)] transition-shadow hover:shadow-[0_2px_10px_rgba(1,1,1,0.06)] ${className}`}
      {...props}
    />
  );
}

export function Badge({
  className = "",
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "green" | "amber" | "red";
}) {
  const tones = {
    neutral: "bg-gray-100 text-gray-700",
    green: "bg-lsa-green-mint/20 text-lsa-green-deep",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
